import { invokeIfTauri, isTauriRuntime } from '@/lib/tauri'

export type ExportFormat = 'txt' | 'md' | 'docx'

interface ExportResultInput {
  content: string
  format: ExportFormat
  fileName: string
}

function downloadInBrowser(input: ExportResultInput): void {
  const blob = new Blob([input.content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${input.fileName}.${input.format === 'docx' ? 'txt' : input.format}`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export async function exportResult(input: ExportResultInput): Promise<string> {
  if (isTauriRuntime()) {
    const path = await invokeIfTauri<string>('export_save_result', { input })
    if (!path) throw new Error('导出失败')
    return path
  }
  downloadInBrowser(input)
  return 'browser-download'
}
