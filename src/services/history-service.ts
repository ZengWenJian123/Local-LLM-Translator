import { createId } from '@/lib/utils'
import { invokeIfTauri } from '@/lib/tauri'
import type { HistoryRecord, TranslationResult } from '@/types/core'

const HISTORY_STORAGE_KEY = 'local-translate:history'

function readHistoryStorage(): HistoryRecord[] {
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as HistoryRecord[]
  } catch {
    return []
  }
}

function writeHistoryStorage(records: HistoryRecord[]): void {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records))
}

export async function listHistory(search = ''): Promise<HistoryRecord[]> {
  const tauriRecords = await invokeIfTauri<HistoryRecord[]>('history_list_records', { search })
  if (tauriRecords) return tauriRecords

  const local = readHistoryStorage()
  if (!search.trim()) return local
  return local.filter(
    (item) =>
      item.sourcePreview.toLowerCase().includes(search.toLowerCase()) ||
      item.translatedPreview.toLowerCase().includes(search.toLowerCase()),
  )
}

export async function saveHistory(record: HistoryRecord): Promise<HistoryRecord> {
  const tauriRecord = await invokeIfTauri<HistoryRecord>('history_save_record', { record })
  if (tauriRecord) return tauriRecord

  const local = readHistoryStorage()
  const next = [record, ...local].slice(0, 500)
  writeHistoryStorage(next)
  return record
}

export async function removeHistory(id: string): Promise<void> {
  const removed = await invokeIfTauri<boolean>('history_delete_record', { id })
  if (removed !== null) return

  const local = readHistoryStorage()
  writeHistoryStorage(local.filter((item) => item.id !== id))
}

export async function toggleHistoryFavorite(id: string): Promise<void> {
  const toggled = await invokeIfTauri<boolean>('history_toggle_favorite', { id })
  if (toggled !== null) return

  const local = readHistoryStorage()
  const next = local.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item))
  writeHistoryStorage(next)
}

export function buildHistoryRecord(result: TranslationResult): HistoryRecord {
  const sourceText = result.segments.map((segment) => segment.sourceText).join('\n\n')
  return {
    id: createId('history'),
    mode: result.mode,
    sourceLanguage: result.sourceLanguage,
    targetLanguage: result.targetLanguage,
    sourcePreview: sourceText.slice(0, 120),
    translatedPreview: result.plainText.slice(0, 120),
    sourceText,
    translatedText: result.plainText,
    provider: result.provider,
    model: result.model,
    favorite: false,
    createdAt: new Date().toISOString(),
  }
}
