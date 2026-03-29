import type { AppSettings, ProviderConfig } from '@/types/core'

export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  id: 'default-lmstudio',
  name: 'LM Studio',
  providerType: 'lmstudio',
  baseURL: 'http://192.168.20.10:1234',
  model: 'qwen3.5 35B',
  timeoutMs: 90_000,
  enabled: true,
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultTargetLanguage: 'zh',
  autoDetectSourceLanguage: true,
  enableStreaming: true,
  enableClipboardWatch: false,
  enableCtrlEnterTranslate: true,
  historyLimit: 300,
  outputViewMode: 'translated-only',
  keepTerminologyConsistency: true,
}

export const MAX_SEGMENT_LENGTH = 900
