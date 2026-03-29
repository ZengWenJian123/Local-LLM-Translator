import { describe, expect, it } from 'vitest'
import { appSettingsSchema, providerConfigSchema } from '@/schemas/settings'

describe('settings schema', () => {
  it('accepts valid provider config', () => {
    const parsed = providerConfigSchema.parse({
      id: 'p1',
      name: 'LM Studio',
      providerType: 'lmstudio',
      baseURL: 'http://127.0.0.1:1234',
      model: 'qwen3.5',
      timeoutMs: 10_000,
      enabled: true,
    })
    expect(parsed.name).toBe('LM Studio')
  })

  it('rejects invalid history limit', () => {
    const result = appSettingsSchema.safeParse({
      defaultTargetLanguage: 'zh',
      autoDetectSourceLanguage: true,
      enableStreaming: true,
      enableClipboardWatch: false,
      enableCtrlEnterTranslate: true,
      historyLimit: 10,
      outputViewMode: 'translated-only',
      keepTerminologyConsistency: true,
    })
    expect(result.success).toBe(false)
  })
})
