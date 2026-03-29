import { useQuery } from '@tanstack/react-query'
import { getProviderConfig } from '@/services/settings-service'
import { listProviderModels } from '@/services/provider-service'

export function useProviderConfig() {
  return useQuery({
    queryKey: ['provider-config'],
    queryFn: getProviderConfig,
    staleTime: 60_000,
  })
}

export function useProviderModels(enabled: boolean) {
  const provider = useProviderConfig()

  return useQuery({
    queryKey: ['provider-models', provider.data?.baseURL, provider.data?.model],
    queryFn: async () => listProviderModels(provider.data!),
    enabled: enabled && Boolean(provider.data),
    staleTime: 60_000,
  })
}
