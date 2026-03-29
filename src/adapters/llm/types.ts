import type {
  ModelDescriptor,
  ProviderConfig,
  ProviderConnectionResult,
  TranslateInput,
  TranslateRuntimeOptions,
  TranslationResult,
} from '@/types/core'

export interface LLMProvider {
  name: string
  testConnection(config: ProviderConfig): Promise<ProviderConnectionResult>
  listModels(config: ProviderConfig): Promise<ModelDescriptor[]>
  translateText(
    input: TranslateInput,
    config: ProviderConfig,
    options?: TranslateRuntimeOptions,
  ): Promise<TranslationResult>
  translateImage(
    input: TranslateInput,
    config: ProviderConfig,
    options?: TranslateRuntimeOptions,
  ): Promise<TranslationResult>
  translateDocument(
    input: TranslateInput,
    config: ProviderConfig,
    options?: TranslateRuntimeOptions,
  ): Promise<TranslationResult>
}
