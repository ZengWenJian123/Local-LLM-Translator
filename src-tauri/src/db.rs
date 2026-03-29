use anyhow::Result;
use rusqlite::{params, Connection};
use std::path::Path;

use crate::models::{AppSettings, HistoryRecord, ProviderConfig};

pub fn open(db_path: &Path) -> Result<Connection> {
    let conn = Connection::open(db_path)?;
    Ok(conn)
}

pub fn init(db_path: &Path) -> Result<()> {
    let conn = open(db_path)?;

    conn.execute_batch(
        r#"
CREATE TABLE IF NOT EXISTS provider_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_key TEXT,
  model TEXT NOT NULL,
  timeout_ms INTEGER NOT NULL,
  enabled INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  default_target_language TEXT NOT NULL,
  auto_detect_source_language INTEGER NOT NULL,
  enable_streaming INTEGER NOT NULL,
  enable_clipboard_watch INTEGER NOT NULL,
  enable_ctrl_enter_translate INTEGER NOT NULL,
  history_limit INTEGER NOT NULL,
  export_directory TEXT,
  output_view_mode TEXT NOT NULL,
  keep_terminology_consistency INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS history_records (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  source_preview TEXT NOT NULL,
  translated_preview TEXT NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  favorite INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
"#,
    )?;

    Ok(())
}

pub fn save_provider_config(conn: &Connection, input: &ProviderConfig) -> Result<ProviderConfig> {
    conn.execute(
        r#"
INSERT INTO provider_configs
  (id, name, provider_type, base_url, api_key, model, timeout_ms, enabled, updated_at)
VALUES
  (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  provider_type = excluded.provider_type,
  base_url = excluded.base_url,
  api_key = excluded.api_key,
  model = excluded.model,
  timeout_ms = excluded.timeout_ms,
  enabled = excluded.enabled,
  updated_at = datetime('now');
        "#,
        params![
            input.id,
            input.name,
            input.provider_type,
            input.base_url,
            input.api_key,
            input.model,
            input.timeout_ms,
            input.enabled as i64
        ],
    )?;
    Ok(input.clone())
}

pub fn get_provider_config(conn: &Connection) -> Result<Option<ProviderConfig>> {
    let mut stmt = conn.prepare(
        r#"
SELECT id, name, provider_type, base_url, api_key, model, timeout_ms, enabled
FROM provider_configs
ORDER BY updated_at DESC
LIMIT 1;
        "#,
    )?;
    let config = stmt.query_row([], |row| {
        Ok(ProviderConfig {
            id: row.get(0)?,
            name: row.get(1)?,
            provider_type: row.get(2)?,
            base_url: row.get(3)?,
            api_key: row.get(4)?,
            model: row.get(5)?,
            timeout_ms: row.get(6)?,
            enabled: row.get::<_, i64>(7)? == 1,
        })
    });

    match config {
        Ok(found) => Ok(Some(found)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(error) => Err(error.into()),
    }
}

pub fn save_app_settings(conn: &Connection, input: &AppSettings) -> Result<AppSettings> {
    conn.execute(
        r#"
INSERT INTO app_settings
  (id, default_target_language, auto_detect_source_language, enable_streaming, enable_clipboard_watch,
   enable_ctrl_enter_translate, history_limit, export_directory, output_view_mode, keep_terminology_consistency, updated_at)
VALUES
  (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  default_target_language = excluded.default_target_language,
  auto_detect_source_language = excluded.auto_detect_source_language,
  enable_streaming = excluded.enable_streaming,
  enable_clipboard_watch = excluded.enable_clipboard_watch,
  enable_ctrl_enter_translate = excluded.enable_ctrl_enter_translate,
  history_limit = excluded.history_limit,
  export_directory = excluded.export_directory,
  output_view_mode = excluded.output_view_mode,
  keep_terminology_consistency = excluded.keep_terminology_consistency,
  updated_at = datetime('now');
        "#,
        params![
            input.default_target_language,
            input.auto_detect_source_language as i64,
            input.enable_streaming as i64,
            input.enable_clipboard_watch as i64,
            input.enable_ctrl_enter_translate as i64,
            input.history_limit,
            input.export_directory,
            input.output_view_mode,
            input.keep_terminology_consistency as i64,
        ],
    )?;
    Ok(input.clone())
}

pub fn get_app_settings(conn: &Connection) -> Result<Option<AppSettings>> {
    let mut stmt = conn.prepare(
        r#"
SELECT default_target_language, auto_detect_source_language, enable_streaming, enable_clipboard_watch,
       enable_ctrl_enter_translate, history_limit, export_directory, output_view_mode, keep_terminology_consistency
FROM app_settings
WHERE id = 1;
        "#,
    )?;

    let settings = stmt.query_row([], |row| {
        Ok(AppSettings {
            default_target_language: row.get(0)?,
            auto_detect_source_language: row.get::<_, i64>(1)? == 1,
            enable_streaming: row.get::<_, i64>(2)? == 1,
            enable_clipboard_watch: row.get::<_, i64>(3)? == 1,
            enable_ctrl_enter_translate: row.get::<_, i64>(4)? == 1,
            history_limit: row.get(5)?,
            export_directory: row.get(6)?,
            output_view_mode: row.get(7)?,
            keep_terminology_consistency: row.get::<_, i64>(8)? == 1,
        })
    });

    match settings {
        Ok(found) => Ok(Some(found)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(error) => Err(error.into()),
    }
}

pub fn save_history_record(conn: &Connection, record: &HistoryRecord) -> Result<HistoryRecord> {
    conn.execute(
        r#"
INSERT INTO history_records
  (id, mode, source_language, target_language, source_preview, translated_preview, source_text, translated_text,
   provider, model, favorite, created_at)
VALUES
  (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12);
        "#,
        params![
            record.id,
            record.mode,
            record.source_language,
            record.target_language,
            record.source_preview,
            record.translated_preview,
            record.source_text,
            record.translated_text,
            record.provider,
            record.model,
            record.favorite as i64,
            record.created_at
        ],
    )?;
    Ok(record.clone())
}

pub fn list_history_records(conn: &Connection, search: &str) -> Result<Vec<HistoryRecord>> {
    let mut records = Vec::new();
    let mut stmt = conn.prepare(
        r#"
SELECT id, mode, source_language, target_language, source_preview, translated_preview, source_text, translated_text,
       provider, model, favorite, created_at
FROM history_records
WHERE (?1 = '' OR source_preview LIKE '%' || ?1 || '%' OR translated_preview LIKE '%' || ?1 || '%')
ORDER BY datetime(created_at) DESC
LIMIT 500;
        "#,
    )?;

    let mapped = stmt.query_map([search], |row| {
        Ok(HistoryRecord {
            id: row.get(0)?,
            mode: row.get(1)?,
            source_language: row.get(2)?,
            target_language: row.get(3)?,
            source_preview: row.get(4)?,
            translated_preview: row.get(5)?,
            source_text: row.get(6)?,
            translated_text: row.get(7)?,
            provider: row.get(8)?,
            model: row.get(9)?,
            favorite: row.get::<_, i64>(10)? == 1,
            created_at: row.get(11)?,
        })
    })?;

    for item in mapped {
        records.push(item?);
    }
    Ok(records)
}

pub fn delete_history_record(conn: &Connection, id: &str) -> Result<bool> {
    let count = conn.execute("DELETE FROM history_records WHERE id = ?1", [id])?;
    Ok(count > 0)
}

pub fn toggle_history_favorite(conn: &Connection, id: &str) -> Result<bool> {
    let count = conn.execute(
        "UPDATE history_records SET favorite = CASE favorite WHEN 1 THEN 0 ELSE 1 END WHERE id = ?1",
        [id],
    )?;
    Ok(count > 0)
}
