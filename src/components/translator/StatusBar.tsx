import { Clock3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatElapsed } from '@/lib/format'

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
  const elapsed = formatElapsed(elapsedMs)

  return (
    <footer className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-sm">
      <Badge variant={providerConnected ? 'success' : 'error'}>
        {providerConnected ? '模型已连接' : '模型未连接'}
      </Badge>
      <span>提供方: {providerName}</span>
      <span>模型: {modelName}</span>
      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-cyan-700">
        <Clock3 className="h-3 w-3" />
        耗时
      </span>
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">{elapsed.seconds}</span>
      <span className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700">{elapsed.milliseconds}</span>
      <span>分段: {typeof segmentCount === 'number' ? segmentCount : '--'}</span>
      <span>流式输出: {streamingEnabled ? '开启' : '关闭'}</span>
    </footer>
  )
}
