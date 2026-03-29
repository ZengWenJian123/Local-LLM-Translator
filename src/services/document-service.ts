import { invokeIfTauri } from '@/lib/tauri'
import type { ParsedDocument } from '@/types/core'

export async function parseDocument(documentPath: string): Promise<ParsedDocument> {
  const tauriParsed = await invokeIfTauri<ParsedDocument>('files_parse_document', {
    documentPath,
  })
  if (tauriParsed) return tauriParsed

  return {
    fileName: documentPath.split(/[\\/]/g).at(-1) ?? 'unknown',
    extension: documentPath.split('.').at(-1)?.toLowerCase() ?? 'txt',
    text: '',
    paragraphCount: 0,
  }
}
