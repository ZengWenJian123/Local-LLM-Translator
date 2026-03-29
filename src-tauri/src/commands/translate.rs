use crate::models::{ProviderConfig, TranslateInput, TranslationResult};
use crate::services::llm;

#[tauri::command]
pub async fn translate_text(input: TranslateInput, config: ProviderConfig) -> Result<TranslationResult, String> {
    llm::translate_text(&input, &config)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn translate_image(input: TranslateInput, config: ProviderConfig) -> Result<TranslationResult, String> {
    llm::translate_image(&input, &config)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn translate_document(input: TranslateInput, config: ProviderConfig) -> Result<TranslationResult, String> {
    llm::translate_document(&input, &config)
        .await
        .map_err(|error| error.to_string())
}
