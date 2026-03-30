import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Copy, FileImage, FileText, Keyboard, Trash2, Type, X, ZoomIn } from 'lucide-react'
import { MarkdownContent } from '@/components/common/MarkdownContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { InputMode } from '@/types/core'

interface InputPanelProps {
  mode: InputMode
  textDraft: string
  imageName: string
  imageBase64: string
  imageMimeType: string
  markdownPreviewEnabled: boolean
  onTextChange: (value: string) => void
  onSetImage: (image: { base64: string; mimeType: string; name: string }) => void
  onToggleMarkdownPreview: () => void
  onCopyInput: () => void
  onClearInput: () => void
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result?.toString() ?? ''
      resolve(dataUrl.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function InputPanel(props: InputPanelProps) {
  const {
    mode,
    textDraft,
    imageName,
    imageBase64,
    imageMimeType,
    markdownPreviewEnabled,
    onTextChange,
    onSetImage,
    onToggleMarkdownPreview,
    onCopyInput,
    onClearInput,
  } = props
  const [previewOpen, setPreviewOpen] = useState(false)

  const onImageDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      const base64 = await fileToBase64(file)
      onSetImage({
        base64,
        mimeType: file.type || 'image/png',
        name: file.name,
      })
    },
    [onSetImage],
  )

  const imageDropzone = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
  })

  return (
    <Card className="h-full overflow-hidden border-border/70 bg-card/85 shadow-xl backdrop-blur-sm">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-cyan-50/70 via-sky-50/40 to-teal-50/60">
        <CardTitle className="flex items-center gap-2 text-base">
          <Type className="h-4 w-4 text-primary" />
          输入区
        </CardTitle>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-4rem)] p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(14,165,233,0.08),transparent_30%),radial-gradient(circle_at_90%_90%,rgba(45,212,191,0.08),transparent_35%)]" />

        {mode === 'text' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Keyboard className="h-3.5 w-3.5" />
                支持 Ctrl+V / Ctrl+Enter
              </div>
              <span>字符数：{textDraft.length}</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant={markdownPreviewEnabled ? 'secondary' : 'outline'}
                size="sm"
                onClick={onToggleMarkdownPreview}
              >
                <FileText className="mr-1 h-4 w-4" />
                Markdown
              </Button>
              <Button variant="outline" size="sm" onClick={onCopyInput} disabled={!textDraft.trim()}>
                <Copy className="mr-1 h-4 w-4" />
                复制
              </Button>
              <Button variant="outline" size="sm" onClick={onClearInput} disabled={!textDraft.trim()}>
                <Trash2 className="mr-1 h-4 w-4" />
                清空
              </Button>
            </div>
            {markdownPreviewEnabled ? (
              <div className="min-h-[420px] overflow-auto rounded-xl border border-border/70 bg-white/75 p-4 shadow-inner">
                {textDraft.trim() ? (
                  <MarkdownContent content={textDraft} />
                ) : (
                  <div className="flex min-h-[388px] items-center justify-center text-sm text-muted-foreground">
                    Markdown 预览将显示在这里
                  </div>
                )}
              </div>
            ) : (
              <Textarea
                value={textDraft}
                onChange={(event) => onTextChange(event.target.value)}
                className="min-h-[420px] resize-none border-border/70 bg-white/75 shadow-inner"
                placeholder="在这里输入待翻译文本..."
              />
            )}
            <div className="text-right text-xs text-muted-foreground">长文本将自动分段翻译</div>
          </motion.div>
        )}

        {mode === 'image' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 space-y-3">
            <div
              {...imageDropzone.getRootProps()}
              className="group flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cyan-400/55 bg-gradient-to-br from-cyan-50/90 via-white to-sky-50/70 p-5 text-center shadow-sm transition hover:border-cyan-500/70 hover:shadow-md"
            >
              <input {...imageDropzone.getInputProps()} />
              <FileImage className="mb-3 h-10 w-10 text-cyan-600 transition group-hover:scale-110" />
              <p className="text-sm font-medium">拖拽图片到此处，或点击选择图片</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG / JPG / WEBP</p>
            </div>

            {imageBase64 ? (
              <div className="space-y-2 rounded-xl border border-border/70 bg-background/80 p-3 shadow-sm">
                <div className="truncate text-sm font-medium">{imageName}</div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-lg border border-border/60"
                  title="点击放大查看"
                >
                  <img
                    src={`data:${imageMimeType};base64,${imageBase64}`}
                    alt={imageName || 'uploaded'}
                    className="max-h-[250px] w-full object-contain transition group-hover:scale-[1.02]"
                  />
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[11px] text-white">
                    <ZoomIn className="h-3 w-3" />
                    放大
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onCopyInput}>
                    <Copy className="mr-1 h-4 w-4" />
                    复制
                  </Button>
                  <Button variant="outline" size="sm" onClick={onClearInput}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    清空
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border/70 bg-background/70 p-3 text-center text-xs text-muted-foreground">
                上传后会在这里显示图片预览
              </div>
            )}
          </motion.div>
        )}
      </CardContent>

      {previewOpen && imageBase64 ? (
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
            src={`data:${imageMimeType};base64,${imageBase64}`}
            alt={imageName || 'input-image'}
            className="max-h-[90vh] max-w-[90vw] rounded-lg border border-white/20 bg-black/20 object-contain"
          />
        </div>
      ) : null}
    </Card>
  )
}
