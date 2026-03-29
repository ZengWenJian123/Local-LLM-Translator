export type InputMode = 'text' | 'image' | 'document'
export type Language = 'auto' | 'zh' | 'en' | 'ru'
export type TargetLanguage = Exclude<Language, 'auto'>
export type OutputViewMode = 'translated-only' | 'bilingual'

export interface TranslateInput {
  mode: InputMode
  sourceLanguage: Language
  targetLanguage: TargetLanguage
  text?: string
  imageBase64?: string
  imageMimeType?: string
  imagePath?: string
  documentPath?: string
  documentText?: string
}

export interface TranslationSegment {
  index: number
  sourceText: string
  translatedText: string
}

export interface TranslationResult {
  taskId: string
  mode: InputMode
  sourceLanguage: string
  targetLanguage: string
  segments: TranslationSegment[]
  plainText: string
  elapsedMs: number
  provider: string
  model: string
}

export interface ProviderConfig {
  id: string
  name: string
  providerType: 'lmstudio' | 'openai-compatible'
  baseURL: string
  apiKey?: string
  model: string
  timeoutMs: number
  enabled: boolean
}

export interface HistoryRecord {
  id: string
  mode: InputMode
  sourceLanguage: string
  targetLanguage: string
  sourcePreview: string
  translatedPreview: string
  sourceText: string
  translatedText: string
  provider: string
  model: string
  favorite: boolean
  createdAt: string
}

export interface AppSettings {
  defaultTargetLanguage: TargetLanguage
  autoDetectSourceLanguage: boolean
  enableStreaming: boolean
  enableClipboardWatch: boolean
  enableCtrlEnterTranslate: boolean
  historyLimit: number
  exportDirectory?: string
  outputViewMode: OutputViewMode
  keepTerminologyConsistency: boolean
}

export interface ModelDescriptor {
  id: string
  name: string
}

export interface ProviderConnectionResult {
  ok: boolean
  message: string
}

export interface ParsedDocument {
  fileName: string
  extension: string
  text: string
  paragraphCount: number
}

export interface TranslateRuntimeOptions {
  signal?: AbortSignal
  onChunk?: (chunk: string, partial: string) => void
}
