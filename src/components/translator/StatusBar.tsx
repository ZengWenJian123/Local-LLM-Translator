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
    <footer className="flex w-full min-w-0 flex-wrap items-center gap-2 overflow-hidden rounded-lg border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-sm">
      <Badge variant={providerConnected ? 'success' : 'error'}>
        {providerConnected ? 'Connected' : 'Disconnected'}
      </Badge>
      <span className="min-w-0 break-words">Provider: {providerName}</span>
      <span className="min-w-0 break-all">Model: {modelName}</span>
      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-cyan-700">
        <Clock3 className="h-3 w-3" />
        Elapsed
      </span>
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">{elapsed.seconds}</span>
      <span className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700">{elapsed.milliseconds}</span>
      <span>Segments: {typeof segmentCount === 'number' ? segmentCount : '--'}</span>
      <span>Streaming: {streamingEnabled ? 'On' : 'Off'}</span>
    </footer>
  )
}