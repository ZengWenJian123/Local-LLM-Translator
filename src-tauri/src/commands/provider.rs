use crate::models::{ModelDescriptor, ProviderConfig, ProviderConnectionResult, TranslationResult};
use crate::services::llm;

#[tauri::command]
pub async fn provider_test_connection(config: ProviderConfig) -> Result<ProviderConnectionResult, String> {
    llm::test_connection(&config)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn provider_list_models(config: ProviderConfig) -> Result<Vec<ModelDescriptor>, String> {
    llm::list_models(&config)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn provider_warmup_model(config: ProviderConfig) -> Result<TranslationResult, String> {
    let input = crate::models::TranslateInput {
        mode: "text".to_string(),
        source_language: "auto".to_string(),
        target_language: "zh".to_string(),
        text: Some("Hello".to_string()),
        image_base64: None,
        image_mime_type: None,
        image_path: None,
        document_path: None,
        document_text: None,
    };
    llm::translate_text(&input, &config)
        .await
        .map_err(|error| error.to_string())
}
