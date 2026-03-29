import { z } from 'zod'

export const providerConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Provider 名称不能为空'),
  providerType: z.enum(['lmstudio', 'openai-compatible']),
  baseURL: z.url('请填写有效的 Base URL'),
  apiKey: z.string().optional(),
  model: z.string().min(1, '模型名称不能为空'),
  timeoutMs: z.number().int().min(1_000).max(300_000),
  enabled: z.boolean(),
})

export const appSettingsSchema = z.object({
  defaultTargetLanguage: z.enum(['zh', 'en', 'ru']),
  autoDetectSourceLanguage: z.boolean(),
  enableStreaming: z.boolean(),
  enableClipboardWatch: z.boolean(),
  enableCtrlEnterTranslate: z.boolean(),
  historyLimit: z.number().int().min(50).max(5_000),
  exportDirectory: z.string().optional(),
  outputViewMode: z.enum(['translated-only', 'bilingual']),
  keepTerminologyConsistency: z.boolean(),
})

export type ProviderConfigFormValues = z.infer<typeof providerConfigSchema>
export type AppSettingsFormValues = z.infer<typeof appSettingsSchema>
