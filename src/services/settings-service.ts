import { appSettingsSchema, providerConfigSchema } from '@/schemas/settings'
import { DEFAULT_APP_SETTINGS, DEFAULT_PROVIDER_CONFIG, FIXED_MODEL_NAME } from '@/lib/defaults'
import { invokeIfTauri } from '@/lib/tauri'
import type { AppSettings, ProviderConfig } from '@/types/core'

const APP_SETTINGS_KEY = 'local-translate:app-settings'
let browserProviderConfig: ProviderConfig | null = null

function normalizeProviderConfig(input: ProviderConfig): ProviderConfig {
  return {
    ...input,
    model: FIXED_MODEL_NAME,
  }
}

function readLocalStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeLocalStorage(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export async function getAppSettings(): Promise<AppSettings> {
  const tauriSettings = await invokeIfTauri<AppSettings>('settings_get_app_settings')
  if (tauriSettings) return appSettingsSchema.parse(tauriSettings)

  const fromStorage = readLocalStorage(APP_SETTINGS_KEY, DEFAULT_APP_SETTINGS)
  return appSettingsSchema.parse(fromStorage)
}

export async function saveAppSettings(input: AppSettings): Promise<AppSettings> {
  const parsed = appSettingsSchema.parse(input)
  const tauriSaved = await invokeIfTauri<AppSettings>('settings_save_app_settings', { input: parsed })
  if (tauriSaved) return appSettingsSchema.parse(tauriSaved)

  writeLocalStorage(APP_SETTINGS_KEY, parsed)
  return parsed
}

export async function getProviderConfig(): Promise<ProviderConfig> {
  const tauriConfig = await invokeIfTauri<ProviderConfig>('settings_get_provider_config')
  if (tauriConfig) {
    return providerConfigSchema.parse(normalizeProviderConfig(tauriConfig))
  }

  if (!browserProviderConfig) {
    browserProviderConfig = providerConfigSchema.parse(normalizeProviderConfig({ ...DEFAULT_PROVIDER_CONFIG }))
  }
  return providerConfigSchema.parse(normalizeProviderConfig(browserProviderConfig))
}

export async function saveProviderConfig(input: ProviderConfig): Promise<ProviderConfig> {
  const parsed = providerConfigSchema.parse(normalizeProviderConfig(input))
  const tauriSaved = await invokeIfTauri<ProviderConfig>('settings_save_provider_config', {
    input: parsed,
  })
  if (tauriSaved) return providerConfigSchema.parse(normalizeProviderConfig(tauriSaved))

  browserProviderConfig = parsed
  return parsed
}
