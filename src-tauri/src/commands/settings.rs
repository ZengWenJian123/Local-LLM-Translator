use tauri::State;

use crate::db;
use crate::models::{AppSettings, ProviderConfig};
use crate::AppState;

fn default_provider() -> ProviderConfig {
    ProviderConfig {
        id: "default-lmstudio".to_string(),
        name: "LM Studio".to_string(),
        provider_type: "lmstudio".to_string(),
        base_url: "http://192.168.20.10:1234".to_string(),
        api_key: None,
        model: "qwen3.5 35B".to_string(),
        timeout_ms: 90_000,
        enabled: true,
    }
}

fn default_settings() -> AppSettings {
    AppSettings {
        default_target_language: "zh".to_string(),
        auto_detect_source_language: true,
        enable_streaming: true,
        enable_clipboard_watch: false,
        enable_ctrl_enter_translate: true,
        history_limit: 300,
        export_directory: None,
        output_view_mode: "translated-only".to_string(),
        keep_terminology_consistency: true,
    }
}

#[tauri::command]
pub fn settings_get_provider_config(state: State<'_, AppState>) -> Result<ProviderConfig, String> {
    let conn = db::open(&state.db_path).map_err(|error| error.to_string())?;
    let config = db::get_provider_config(&conn).map_err(|error| error.to_string())?;
    Ok(config.unwrap_or_else(default_provider))
}

#[tauri::command]
pub fn settings_save_provider_config(
    state: State<'_, AppState>,
    input: ProviderConfig,
) -> Result<ProviderConfig, String> {
    let conn = db::open(&state.db_path).map_err(|error| error.to_string())?;
    db::save_provider_config(&conn, &input).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn settings_get_app_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    let conn = db::open(&state.db_path).map_err(|error| error.to_string())?;
    let settings = db::get_app_settings(&conn).map_err(|error| error.to_string())?;
    Ok(settings.unwrap_or_else(default_settings))
}

#[tauri::command]
pub fn settings_save_app_settings(
    state: State<'_, AppState>,
    input: AppSettings,
) -> Result<AppSettings, String> {
    let conn = db::open(&state.db_path).map_err(|error| error.to_string())?;
    db::save_app_settings(&conn, &input).map_err(|error| error.to_string())
}
