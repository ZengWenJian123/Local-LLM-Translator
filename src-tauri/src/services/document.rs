use anyhow::{anyhow, Result};
use quick_xml::events::Event;
use quick_xml::Reader;
use std::fs;
use std::io::Read;
use std::path::Path;
use zip::ZipArchive;

use crate::models::ParsedDocument;

fn parse_docx_text(path: &Path) -> Result<String> {
    let file = fs::File::open(path)?;
    let mut archive = ZipArchive::new(file)?;
    let mut document_xml = String::new();
    let mut xml_file = archive.by_name("word/document.xml")?;
    xml_file.read_to_string(&mut document_xml)?;

    let mut reader = Reader::from_str(&document_xml);
    reader.config_mut().trim_text(true);
    let mut text = String::new();
    let mut in_text_node = false;

    loop {
        match reader.read_event() {
            Ok(Event::Start(e)) => {
                in_text_node = e.name().as_ref() == b"w:t";
            }
            Ok(Event::Text(e)) => {
                if in_text_node {
                    text.push_str(&String::from_utf8_lossy(e.as_ref()));
                    text.push('\n');
                }
            }
            Ok(Event::Eof) => break,
            Ok(_) => {}
            Err(e) => return Err(anyhow!("解析 DOCX 失败: {}", e)),
        }
    }
    Ok(text)
}

pub fn parse_document(document_path: &str) -> Result<ParsedDocument> {
    let path = Path::new(document_path);
    if !path.exists() {
        return Err(anyhow!("文件不存在: {}", document_path));
    }

    let extension = path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("txt")
        .to_lowercase();

    let text = match extension.as_str() {
        "txt" => fs::read_to_string(path)?,
        "pdf" => pdf_extract::extract_text(path)?,
        "docx" => parse_docx_text(path)?,
        _ => return Err(anyhow!("不支持的文档类型: {}", extension)),
    };

    let paragraph_count = text
        .split("\n\n")
        .map(|part| part.trim())
        .filter(|part| !part.is_empty())
        .count() as i64;

    Ok(ParsedDocument {
        file_name: path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("document")
            .to_string(),
        extension,
        text,
        paragraph_count,
    })
}
