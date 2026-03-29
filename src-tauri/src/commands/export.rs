use tauri::State;

use crate::models::ExportResultInput;
use crate::services::export;
use crate::AppState;

#[tauri::command]
pub fn export_save_result(state: State<'_, AppState>, input: ExportResultInput) -> Result<String, String> {
    let target_dir = state
        .export_dir
        .clone()
        .unwrap_or_else(|| state.app_data_dir.join("exports"));
    let saved = export::save_result(&target_dir, &input.file_name, &input.format, &input.content)
        .map_err(|error| error.to_string())?;
    Ok(saved.to_string_lossy().to_string())
}
