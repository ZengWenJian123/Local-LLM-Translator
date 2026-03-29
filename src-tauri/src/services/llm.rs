use anyhow::{anyhow, Result};
use reqwest::Client;
use serde_json::json;
use std::time::Instant;
use uuid::Uuid;

use crate::models::{
    ModelDescriptor, ProviderConfig, ProviderConnectionResult, TranslateInput, TranslationResult,
    TranslationSegment,
};

async fn client_request(config: &ProviderConfig, endpoint: &str, body: serde_json::Value) -> Result<serde_json::Value> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_millis(config.timeout_ms as u64))
        .build()?;

    let url = format!("{}/{}", config.base_url.trim_end_matches('/'), endpoint.trim_start_matches('/'));
    let mut request = client.post(url).json(&body);
    if let Some(api_key) = &config.api_key {
        if !api_key.is_empty() {
            request = request.bearer_auth(api_key);
        }
    }
    let response = request.send().await?;
    let status = response.status();
    if !status.is_success() {
        return Err(anyhow!("模型请求失败: {}", status));
    }
    Ok(response.json::<serde_json::Value>().await?)
}

pub async fn test_connection(config: &ProviderConfig) -> Result<ProviderConnectionResult> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_millis(config.timeout_ms as u64))
        .build()?;
    let url = format!("{}/v1/models", config.base_url.trim_end_matches('/'));
    let mut request = client.get(url);
    if let Some(api_key) = &config.api_key {
        if !api_key.is_empty() {
            request = request.bearer_auth(api_key);
        }
    }
    let response = request.send().await?;
    if response.status().is_success() {
        return Ok(ProviderConnectionResult {
            ok: true,
            message: "连接成功".to_string(),
        });
    }
    Ok(ProviderConnectionResult {
        ok: false,
        message: format!("连接失败: {}", response.status()),
    })
}

pub async fn list_models(config: &ProviderConfig) -> Result<Vec<ModelDescriptor>> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_millis(config.timeout_ms as u64))
        .build()?;
    let url = format!("{}/v1/models", config.base_url.trim_end_matches('/'));
    let mut request = client.get(url);
    if let Some(api_key) = &config.api_key {
        if !api_key.is_empty() {
            request = request.bearer_auth(api_key);
        }
    }
    let response = request.send().await?;
    let value = response.json::<serde_json::Value>().await?;
    let data = value
        .get("data")
        .and_then(|item| item.as_array())
        .cloned()
        .unwrap_or_default();
    let models = data
        .iter()
        .filter_map(|item| item.get("id").and_then(|id| id.as_str()))
        .map(|id| ModelDescriptor {
            id: id.to_string(),
            name: id.to_string(),
        })
        .collect::<Vec<_>>();
    Ok(models)
}

fn extract_content(value: &serde_json::Value) -> Result<String> {
    let content = value
        .get("choices")
        .and_then(|c| c.as_array())
        .and_then(|choices| choices.first())
        .and_then(|choice| choice.get("message"))
        .and_then(|message| message.get("content"))
        .and_then(|content| content.as_str())
        .unwrap_or("")
        .trim()
        .to_string();
    if content.is_empty() {
        return Err(anyhow!("模型返回空结果"));
    }
    Ok(content)
}

fn split_text(input: &str, max_len: usize) -> Vec<String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return vec![];
    }
    let mut result = Vec::new();
    for paragraph in trimmed.split("\n\n") {
        let text = paragraph.trim();
        if text.is_empty() {
            continue;
        }
        if text.len() <= max_len {
            result.push(text.to_string());
            continue;
        }
        let mut start = 0;
        while start < text.len() {
            let end = std::cmp::min(start + max_len, text.len());
            result.push(text[start..end].to_string());
            start = end;
        }
    }
    result
}

pub async fn translate_text(input: &TranslateInput, config: &ProviderConfig) -> Result<TranslationResult> {
    let started = Instant::now();
    let source = input.text.clone().unwrap_or_default();
    let segments = split_text(&source, 900);
    if segments.is_empty() {
        return Err(anyhow!("文本为空"));
    }

    let mut output_segments = Vec::new();
    for (idx, segment) in segments.iter().enumerate() {
        let prompt = format!(
            "请将以下内容翻译为{}。\n要求：\n1. 保持原意准确\n2. 保持术语一致\n3. 不额外解释\n4. 仅输出译文\n\n文本：\n{}",
            input.target_language, segment
        );

        let body = json!({
            "model": config.model,
            "messages": [
                { "role": "system", "content": "你是专业翻译助手。" },
                { "role": "user", "content": prompt }
            ],
            "stream": false
        });
        let response = client_request(config, "v1/chat/completions", body).await?;
        let translated = extract_content(&response)?;
        output_segments.push(TranslationSegment {
            index: idx as i64,
            source_text: segment.clone(),
            translated_text: translated,
        });
    }

    let plain_text = output_segments
        .iter()
        .map(|segment| segment.translated_text.clone())
        .collect::<Vec<String>>()
        .join("\n\n");

    Ok(TranslationResult {
        task_id: Uuid::new_v4().to_string(),
        mode: input.mode.clone(),
        source_language: input.source_language.clone(),
        target_language: input.target_language.clone(),
        segments: output_segments,
        plain_text,
        elapsed_ms: started.elapsed().as_millis() as i64,
        provider: config.name.clone(),
        model: config.model.clone(),
    })
}

pub async fn translate_image(input: &TranslateInput, config: &ProviderConfig) -> Result<TranslationResult> {
    let started = Instant::now();
    let base64 = input
        .image_base64
        .clone()
        .ok_or_else(|| anyhow!("缺少图片内容"))?;
    let mime = input
        .image_mime_type
        .clone()
        .unwrap_or_else(|| "image/png".to_string());
    let prompt = format!(
        "请识别并翻译图片里的文字为 {}，只输出译文。",
        input.target_language
    );
    let body = json!({
      "model": config.model,
      "messages": [
        { "role": "system", "content": "你是多模态翻译助手。" },
        { "role": "user", "content": [
          { "type": "text", "text": prompt },
          { "type": "image_url", "image_url": { "url": format!("data:{};base64,{}", mime, base64)}}
        ]}
      ],
      "stream": false
    });

    let response = client_request(config, "v1/chat/completions", body).await?;
    let translated = extract_content(&response)?;
    let segment = TranslationSegment {
        index: 0,
        source_text: "[image]".to_string(),
        translated_text: translated.clone(),
    };

    Ok(TranslationResult {
        task_id: Uuid::new_v4().to_string(),
        mode: input.mode.clone(),
        source_language: input.source_language.clone(),
        target_language: input.target_language.clone(),
        segments: vec![segment],
        plain_text: translated,
        elapsed_ms: started.elapsed().as_millis() as i64,
        provider: config.name.clone(),
        model: config.model.clone(),
    })
}

pub async fn translate_document(input: &TranslateInput, config: &ProviderConfig) -> Result<TranslationResult> {
    let text = input
        .document_text
        .clone()
        .or_else(|| input.text.clone())
        .ok_or_else(|| anyhow!("文档内容为空"))?;

    let mut text_input = input.clone();
    text_input.mode = "document".to_string();
    text_input.text = Some(text);
    translate_text(&text_input, config).await
}
