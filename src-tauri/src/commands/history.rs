use tauri::State;

use crate::db;
use crate::models::HistoryRecord;
use crate::AppState;

#[tauri::command]
pub fn history_list_records(state: State<'_, AppState>, search: Option<String>) -> Result<Vec<HistoryRecord>, String> {
    let conn = db::open(&state.db_path).map_err(|error| error.to_string())?;
    db::list_history_records(&conn, &search.unwrap_or_default()).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn history_save_record(state: State<'_, AppState>, record: HistoryRecord) -> Result<HistoryRecord, String> {
    let conn = db::open(&state.db_path).map_err(|error| error.to_string())?;
    db::save_history_record(&conn, &record).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn history_delete_record(state: State<'_, AppState>, id: String) -> Result<bool, String> {
    let conn = db::open(&state.db_path).map_err(|error| error.to_string())?;
    db::delete_history_record(&conn, &id).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn history_toggle_favorite(state: State<'_, AppState>, id: String) -> Result<bool, String> {
    let conn = db::open(&state.db_path).map_err(|error| error.to_string())?;
    db::toggle_history_favorite(&conn, &id).map_err(|error| error.to_string())
}
