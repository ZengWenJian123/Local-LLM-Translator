import type { AppSettings, ProviderConfig } from '@/types/core'

export const DEFAULT_BASE_URL_OPTIONS = [
  '/lmstudio',
  'http://192.168.10.30:1234',
  'http://192.168.20.10:1234',
] as const
export const FIXED_MODEL_NAME = 'qwen/qwen3.5-35b-a3b'

export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  id: 'default-lmstudio',
  name: 'LM Studio',
  providerType: 'lmstudio',
  baseURL: DEFAULT_BASE_URL_OPTIONS[0],
  model: FIXED_MODEL_NAME,
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
