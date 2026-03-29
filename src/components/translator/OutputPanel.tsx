import { motion } from 'framer-motion'
import { useState } from 'react'
import { Clock3, Copy, Download, RefreshCcw, Save, Sparkles, Trash2, X, ZoomIn } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatElapsed } from '@/lib/format'
import type { InputMode, OutputViewMode, TranslationResult } from '@/types/core'

interface OutputPanelProps {
  mode: InputMode
  result?: TranslationResult
  streamedPartial: string
  outputViewMode: OutputViewMode
  loading: boolean
  errorMessage: string
  sourceImageUrl?: string
  sourceImageName?: string
  onOutputViewModeChange: (mode: OutputViewMode) => void
  onCopy: () => void
  onClear: () => void
  onExport: () => void
  onSaveHistory: () => void
  onRetranslate: () => void
}

function EmptyState({ loading, errorMessage }: { loading: boolean; errorMessage: string }) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0.35 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: 'mirror', duration: 0.9 }}
        className="rounded-xl border border-cyan-300/45 bg-gradient-to-r from-cyan-50/60 via-sky-50/40 to-teal-50/50 p-8 text-center text-sm text-muted-foreground"
      >
        <div className="mb-2 text-base font-medium text-foreground">正在翻译中...</div>
        正在等待模型返回结果，请稍候
      </motion.div>
    )
  }
  if (errorMessage) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {errorMessage}
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-background/70 p-8 text-center text-sm text-muted-foreground">
      翻译结果将显示在这里
    </div>
  )
}

export function OutputPanel(props: OutputPanelProps) {
  const {
    mode,
    result,
    streamedPartial,
    outputViewMode,
    loading,
    errorMessage,
    sourceImageUrl,
    sourceImageName,
    onOutputViewModeChange,
    onCopy,
    onClear,
    onExport,
    onSaveHistory,
    onRetranslate,
  } = props
  const [previewOpen, setPreviewOpen] = useState(false)
  const elapsed = formatElapsed(result?.elapsedMs)

  return (
    <Card className="h-full overflow-hidden border-border/70 bg-card/90 shadow-xl backdrop-blur-sm">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-emerald-50/70 via-cyan-50/40 to-sky-50/70 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            输出区
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              className="h-9 w-[130px] border-border/70 bg-background/75"
              value={outputViewMode}
              onChange={(event) => onOutputViewModeChange(event.target.value as OutputViewMode)}
            >
              <option value="translated-only">仅译文</option>
              <option value="bilingual">双语对照</option>
            </Select>
            <Button variant="outline" size="sm" onClick={onCopy} disabled={!result && !streamedPartial}>
              <Copy className="mr-1 h-4 w-4" />
              复制
            </Button>
            <Button variant="outline" size="sm" onClick={onClear} disabled={!result && !streamedPartial && !loading}>
              <Trash2 className="mr-1 h-4 w-4" />
              清空
            </Button>
            <Button variant="outline" size="sm" onClick={onExport} disabled={!result}>
              <Download className="mr-1 h-4 w-4" />
              导出
            </Button>
            <Button variant="outline" size="sm" onClick={onSaveHistory} disabled={!result}>
              <Save className="mr-1 h-4 w-4" />
              保存
            </Button>
            <Button variant="ghost" size="sm" onClick={onRetranslate} disabled={loading}>
              <RefreshCcw className="mr-1 h-4 w-4" />
              重译
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-4.5rem)] space-y-3 p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_8%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_5%_85%,rgba(14,165,233,0.07),transparent_34%)]" />
        <div className="relative z-10 h-full space-y-3">
          {mode === 'image' && sourceImageUrl ? (
            <div className="rounded-xl border border-border/70 bg-white/80 p-3 shadow-sm">
              <p className="mb-2 text-xs font-medium text-muted-foreground">当前图片</p>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="group relative block w-full overflow-hidden rounded-lg border border-border/70"
                title="点击放大查看"
              >
                <img
                  src={sourceImageUrl}
                  alt={sourceImageName || 'source-image'}
                  className="max-h-[170px] w-full object-contain transition group-hover:scale-[1.02]"
                />
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[11px] text-white">
                  <ZoomIn className="h-3 w-3" />
                  放大
                </span>
              </button>
            </div>
          ) : null}

          {!result ? <EmptyState loading={loading} errorMessage={errorMessage} /> : null}

          {result ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{result.provider}</Badge>
                <Badge variant="outline">{result.model}</Badge>
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-cyan-700">
                  <Clock3 className="h-3 w-3" />
                  耗时
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                  {elapsed.seconds}
                </span>
                <span className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700">
                  {elapsed.milliseconds}
                </span>
              </div>
              {outputViewMode === 'translated-only' ? (
                <pre className="max-h-[470px] overflow-auto whitespace-pre-wrap rounded-xl border border-border/70 bg-white/75 p-4 text-sm leading-6 shadow-inner">
                  {result.plainText}
                </pre>
              ) : (
                <div className="max-h-[470px] space-y-2 overflow-auto pr-1">
                  {result.segments.map((segment) => (
                    <motion.div
                      key={segment.index}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-border/70 bg-white/80 p-4 shadow-sm"
                    >
                      <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">原文</p>
                      <p className="text-sm leading-6">{segment.sourceText}</p>
                      <p className="mb-2 mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">译文</p>
                      <p className="text-sm leading-6">{segment.translatedText}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {!result && streamedPartial ? (
            <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap rounded-xl border border-border/70 bg-white/75 p-4 text-sm leading-6 shadow-inner">
              {streamedPartial}
            </pre>
          ) : null}
        </div>
      </CardContent>

      {previewOpen && sourceImageUrl ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-5">
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
            onClick={() => setPreviewOpen(false)}
          >
            <X className="h-4 w-4" />
            关闭
          </button>
          <img
            src={sourceImageUrl}
            alt={sourceImageName || 'source-image'}
            className="max-h-[90vh] max-w-[90vw] rounded-lg border border-white/20 bg-black/20 object-contain"
          />
        </div>
      ) : null}
    </Card>
  )
}
