mod commands;
mod db;
mod models;
mod services;

use std::path::PathBuf;
use tauri::Manager;

#[derive(Clone)]
pub struct AppState {
    pub db_path: PathBuf,
    pub app_data_dir: PathBuf,
    pub export_dir: Option<PathBuf>,
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .map_err(|error| format!("无法读取 app_data_dir: {error}"))?;

            std::fs::create_dir_all(&app_data_dir)
                .map_err(|error| format!("创建应用目录失败: {error}"))?;
            let db_path = app_data_dir.join("local_translate.db");
            db::init(&db_path).map_err(|error| format!("初始化数据库失败: {error}"))?;

            let state = AppState {
                db_path,
                app_data_dir: app_data_dir.clone(),
                export_dir: None,
            };
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::provider::provider_test_connection,
            commands::provider::provider_list_models,
            commands::provider::provider_warmup_model,
            commands::settings::settings_get_provider_config,
            commands::settings::settings_save_provider_config,
            commands::settings::settings_get_app_settings,
            commands::settings::settings_save_app_settings,
            commands::translate::translate_text,
            commands::translate::translate_image,
            commands::translate::translate_document,
            commands::history::history_list_records,
            commands::history::history_save_record,
            commands::history::history_delete_record,
            commands::history::history_toggle_favorite,
            commands::files::files_parse_document,
            commands::export::export_save_result
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
