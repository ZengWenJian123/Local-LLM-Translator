use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranslateInput {
    pub mode: String,
    pub source_language: String,
    pub target_language: String,
    pub text: Option<String>,
    pub image_base64: Option<String>,
    pub image_mime_type: Option<String>,
    pub image_path: Option<String>,
    pub document_path: Option<String>,
    pub document_text: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranslationSegment {
    pub index: i64,
    pub source_text: String,
    pub translated_text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranslationResult {
    pub task_id: String,
    pub mode: String,
    pub source_language: String,
    pub target_language: String,
    pub segments: Vec<TranslationSegment>,
    pub plain_text: String,
    pub elapsed_ms: i64,
    pub provider: String,
    pub model: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderConfig {
    pub id: String,
    pub name: String,
    pub provider_type: String,
    pub base_url: String,
    pub api_key: Option<String>,
    pub model: String,
    pub timeout_ms: i64,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub default_target_language: String,
    pub auto_detect_source_language: bool,
    pub enable_streaming: bool,
    pub enable_clipboard_watch: bool,
    pub enable_ctrl_enter_translate: bool,
    pub history_limit: i64,
    pub export_directory: Option<String>,
    pub output_view_mode: String,
    pub keep_terminology_consistency: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryRecord {
    pub id: String,
    pub mode: String,
    pub source_language: String,
    pub target_language: String,
    pub source_preview: String,
    pub translated_preview: String,
    pub source_text: String,
    pub translated_text: String,
    pub provider: String,
    pub model: String,
    pub favorite: bool,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderConnectionResult {
    pub ok: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelDescriptor {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedDocument {
    pub file_name: String,
    pub extension: String,
    pub text: String,
    pub paragraph_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportResultInput {
    pub content: String,
    pub format: String,
    pub file_name: String,
}
