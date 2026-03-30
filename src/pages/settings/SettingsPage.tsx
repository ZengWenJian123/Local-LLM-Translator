import { ProviderConfigForm } from '@/components/settings/ProviderConfigForm'
import type { AppSettings, ProviderConfig } from '@/types/core'

interface SettingsPageProps {
  provider: ProviderConfig
  settings: AppSettings
  testingConnection: boolean
  onSaveProvider: (input: ProviderConfig) => Promise<void>
  onSaveSettings: (input: AppSettings) => Promise<void>
  onTestConnection: (
    input: ProviderConfig,
  ) => Promise<{ ok: boolean; message: string; models: string[] }>
}

export function SettingsPage(props: SettingsPageProps) {
  return (
    <div className="mx-auto max-w-3xl p-4">
      <ProviderConfigForm {...props} />
    </div>
  )
}
