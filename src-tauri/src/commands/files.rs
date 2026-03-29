use crate::models::ParsedDocument;
use crate::services::document;

#[tauri::command]
pub fn files_parse_document(document_path: String) -> Result<ParsedDocument, String> {
    document::parse_document(&document_path).map_err(|error| error.to_string())
}
