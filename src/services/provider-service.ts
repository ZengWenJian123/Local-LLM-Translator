import { LMStudioAdapter } from '@/adapters/llm/lmstudio-adapter'
import { OpenAICompatibleAdapter } from '@/adapters/llm/openai-compatible-adapter'
import { invokeIfTauri } from '@/lib/tauri'
import type {
  ModelDescriptor,
  ProviderConfig,
  ProviderConnectionResult,
  TranslationResult,
} from '@/types/core'

const lmStudioAdapter = new LMStudioAdapter()
const openaiCompatibleAdapter = new OpenAICompatibleAdapter()

function resolveAdapter(config: ProviderConfig): LMStudioAdapter | OpenAICompatibleAdapter {
  if (config.providerType === 'lmstudio') return lmStudioAdapter
  return openaiCompatibleAdapter
}

export async function testProviderConnection(
  config: ProviderConfig,
): Promise<ProviderConnectionResult> {
  const tauriResult = await invokeIfTauri<ProviderConnectionResult>('provider_test_connection', {
    config,
  })
  if (tauriResult) return tauriResult

  const adapter = resolveAdapter(config)
  return adapter.testConnection(config)
}

export async function listProviderModels(config: ProviderConfig): Promise<ModelDescriptor[]> {
  const tauriModels = await invokeIfTauri<ModelDescriptor[]>('provider_list_models', { config })
  if (tauriModels) return tauriModels

  const adapter = resolveAdapter(config)
  return adapter.listModels(config)
}

export async function warmupModel(config: ProviderConfig): Promise<TranslationResult | null> {
  const tauriResult = await invokeIfTauri<TranslationResult>('provider_warmup_model', { config })
  if (tauriResult) return tauriResult
  return null
}

export function getProviderAdapter(config: ProviderConfig): LMStudioAdapter | OpenAICompatibleAdapter {
  return resolveAdapter(config)
}
