use anyhow::Result;
use docx_rs::*;
use std::fs;
use std::path::{Path, PathBuf};

pub fn save_result(export_dir: &Path, file_name: &str, format: &str, content: &str) -> Result<PathBuf> {
    fs::create_dir_all(export_dir)?;
    let path = export_dir.join(format!("{}.{}", file_name, format));
    match format {
        "txt" | "md" => {
            fs::write(&path, content)?;
        }
        "docx" => {
            let docx = Docx::new().add_paragraph(Paragraph::new().add_run(Run::new().add_text(content)));
            let file = fs::File::create(&path)?;
            docx.build().pack(file)?;
        }
        _ => {
            fs::write(&path, content)?;
        }
    }
    Ok(path)
}
