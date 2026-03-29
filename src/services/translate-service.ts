import { getProviderAdapter } from '@/services/provider-service'
import { invokeIfTauri } from '@/lib/tauri'
import type {
  ProviderConfig,
  TranslateInput,
  TranslateRuntimeOptions,
  TranslationResult,
} from '@/types/core'

export async function translateInput(
  input: TranslateInput,
  config: ProviderConfig,
  options?: TranslateRuntimeOptions,
): Promise<TranslationResult> {
  const command = `translate_${input.mode}`
  const tauriResult = await invokeIfTauri<TranslationResult>(command, { input, config })
  if (tauriResult) return tauriResult

  const adapter = getProviderAdapter(config)
  if (input.mode === 'text') {
    return adapter.translateText(input, config, options)
  }
  if (input.mode === 'image') {
    return adapter.translateImage(input, config, options)
  }
  return adapter.translateDocument(input, config, options)
}
