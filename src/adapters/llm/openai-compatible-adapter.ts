import { AppError } from '@/lib/errors'
import { buildPrompt } from '@/lib/prompt'
import { mergeSegments, splitText } from '@/lib/segment'
import { isTauriRuntime } from '@/lib/tauri'
import { createId } from '@/lib/utils'
import type { LLMProvider } from '@/adapters/llm/types'
import type {
  ModelDescriptor,
  ProviderConfig,
  ProviderConnectionResult,
  TranslateInput,
  TranslateRuntimeOptions,
  TranslationResult,
} from '@/types/core'

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content?: string
    }
  }>
}

interface ModelsResponse {
  data: Array<{
    id: string
  }>
}

async function fetchJson<T>(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  const combinedSignal = signal ?? controller.signal

  try {
    const response = await fetch(url, { ...init, signal: combinedSignal })
    if (!response.ok) {
      throw new AppError(`请求失败（${response.status}）`, 'HTTP_ERROR')
    }
    return (await response.json()) as T
  } finally {
    window.clearTimeout(timeout)
  }
}

function withAuth(config: ProviderConfig, json = true): HeadersInit {
  const headers: Record<string, string> = {}
  if (json) headers['Content-Type'] = 'application/json'
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`
  return headers
}

function resolveBaseURL(config: ProviderConfig): string {
  if (!isTauriRuntime() && import.meta.env.DEV && config.providerType === 'lmstudio') {
    return '/lmstudio'
  }
  return config.baseURL.replace(/\/$/, '')
}

async function chat(
  config: ProviderConfig,
  messages: Array<Record<string, unknown>>,
  options?: TranslateRuntimeOptions,
): Promise<string> {
  const payload = {
    model: config.model,
    stream: false,
    messages,
  }

  const response = await fetchJson<ChatCompletionResponse>(
    `${resolveBaseURL(config)}/v1/chat/completions`,
    {
      method: 'POST',
      headers: withAuth(config),
      body: JSON.stringify(payload),
    },
    config.timeoutMs,
    options?.signal,
  )

  const content = response.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new AppError('模型返回空结果', 'EMPTY_RESULT')
  }
  return content
}

function buildTranslationResult(
  input: TranslateInput,
  segments: Array<{ source: string; translated: string }>,
  config: ProviderConfig,
  startedAt: number,
): TranslationResult {
  return {
    taskId: createId('task'),
    mode: input.mode,
    sourceLanguage: input.sourceLanguage,
    targetLanguage: input.targetLanguage,
    segments: segments.map((segment, index) => ({
      index,
      sourceText: segment.source,
      translatedText: segment.translated,
    })),
    plainText: mergeSegments(segments.map((segment) => segment.translated)),
    elapsedMs: Date.now() - startedAt,
    provider: config.name,
    model: config.model,
  }
}

export class OpenAICompatibleAdapter implements LLMProvider {
  name = 'openai-compatible'

  async testConnection(config: ProviderConfig): Promise<ProviderConnectionResult> {
    try {
      const models = await this.listModels(config)
      if (models.length > 0) {
        return { ok: true, message: `连接成功，共 ${models.length} 个模型` }
      }
      return { ok: true, message: '连接成功，模型列表为空' }
    } catch (error) {
      const message = error instanceof Error ? error.message : '连接失败'
      return { ok: false, message }
    }
  }

  async listModels(config: ProviderConfig): Promise<ModelDescriptor[]> {
    const response = await fetchJson<ModelsResponse>(
      `${resolveBaseURL(config)}/v1/models`,
      {
        method: 'GET',
        headers: withAuth(config, false),
      },
      config.timeoutMs,
    )
    return response.data.map((item) => ({ id: item.id, name: item.id }))
  }

  async translateText(
    input: TranslateInput,
    config: ProviderConfig,
    options?: TranslateRuntimeOptions,
  ): Promise<TranslationResult> {
    const source = input.text?.trim()
    if (!source) throw new AppError('请输入待翻译文本', 'INVALID_INPUT')

    const startedAt = Date.now()
    const split = splitText(source)
    const results: Array<{ source: string; translated: string }> = []

    for (const segment of split) {
      const prompt = buildPrompt(segment, {
        targetLanguage: input.targetLanguage,
        keepTerminologyConsistency: true,
        bilingual: false,
      })
      const translated = await chat(
        config,
        [
          { role: 'system', content: '你是专业翻译助手，请严格按要求输出。' },
          { role: 'user', content: prompt },
        ],
        options,
      )
      results.push({ source: segment, translated })
      options?.onChunk?.(translated, mergeSegments(results.map((item) => item.translated)))
    }

    return buildTranslationResult(input, results, config, startedAt)
  }

  async translateImage(
    input: TranslateInput,
    config: ProviderConfig,
    options?: TranslateRuntimeOptions,
  ): Promise<TranslationResult> {
    if (!input.imageBase64) throw new AppError('请先上传图片', 'INVALID_INPUT')

    const startedAt = Date.now()
    const prompt = `请识别并翻译图片中的文字为目标语言（${input.targetLanguage}）。仅输出译文。`
    const message = await chat(
      config,
      [
        { role: 'system', content: '你是多模态翻译助手。' },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${input.imageMimeType ?? 'image/png'};base64,${input.imageBase64}`,
              },
            },
          ],
        },
      ],
      options,
    )
    return buildTranslationResult(
      input,
      [{ source: '[image]', translated: message }],
      config,
      startedAt,
    )
  }

  async translateDocument(
    input: TranslateInput,
    config: ProviderConfig,
    options?: TranslateRuntimeOptions,
  ): Promise<TranslationResult> {
    const source = input.documentText?.trim()
    if (!source) throw new AppError('文档内容为空', 'INVALID_INPUT')
    return this.translateText(
      {
        ...input,
        mode: 'document',
        text: source,
      },
      config,
      options,
    )
  }
}
