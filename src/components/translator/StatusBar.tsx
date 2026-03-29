import { Badge } from '@/components/ui/badge'

interface StatusBarProps {
  providerConnected: boolean
  providerName: string
  modelName: string
  elapsedMs?: number
  segmentCount?: number
  streamingEnabled: boolean
}

export function StatusBar(props: StatusBarProps) {
  const { providerConnected, providerName, modelName, elapsedMs, segmentCount, streamingEnabled } = props

  return (
    <footer className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
      <Badge variant={providerConnected ? 'success' : 'error'}>
        {providerConnected ? '模型已连接' : '模型未连接'}
      </Badge>
      <span>Provider: {providerName}</span>
      <span>Model: {modelName}</span>
      <span>耗时: {typeof elapsedMs === 'number' ? `${elapsedMs}ms` : '--'}</span>
      <span>分段: {typeof segmentCount === 'number' ? segmentCount : '--'}</span>
      <span>Streaming: {streamingEnabled ? '开启' : '关闭'}</span>
    </footer>
  )
}
