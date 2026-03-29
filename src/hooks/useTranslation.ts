import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { normalizeErrorMessage } from '@/lib/errors'
import { buildHistoryRecord, saveHistory } from '@/services/history-service'
import { getProviderConfig } from '@/services/settings-service'
import { translateInput } from '@/services/translate-service'
import type { TranslateInput, TranslationResult } from '@/types/core'

export function useTranslation() {
  const queryClient = useQueryClient()
  const abortRef = useRef<AbortController | null>(null)
  const [streamedPartial, setStreamedPartial] = useState('')

  const mutation = useMutation({
    mutationFn: async (input: TranslateInput) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setStreamedPartial('')

      const providerConfig = await getProviderConfig()
      const result = await translateInput(input, providerConfig, {
        signal: controller.signal,
        onChunk: (_chunk, partial) => setStreamedPartial(partial),
      })
      await saveHistory(buildHistoryRecord(result))
      return result
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })

  const cancel = (): void => {
    abortRef.current?.abort()
    abortRef.current = null
  }

  const clear = (): void => {
    cancel()
    setStreamedPartial('')
    mutation.reset()
  }

  const errorMessage = mutation.error ? normalizeErrorMessage(mutation.error) : ''
  return {
    ...mutation,
    streamedPartial,
    cancel,
    clear,
    errorMessage,
    result: mutation.data as TranslationResult | undefined,
  }
}
