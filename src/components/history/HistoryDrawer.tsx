import { Star, Trash2, Search } from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { HistoryRecord } from '@/types/core'

interface HistoryDrawerProps {
  open: boolean
  records: HistoryRecord[]
  search: string
  onClose: () => void
  onSearchChange: (value: string) => void
  onLoad: (record: HistoryRecord) => void
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
}

export function HistoryDrawer(props: HistoryDrawerProps) {
  const { open, records, search, onClose, onSearchChange, onLoad, onToggleFavorite, onDelete } = props

  return (
    <Drawer open={open} onClose={onClose} title="历史记录">
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="搜索原文或译文摘要"
        />
      </div>

      <div className="space-y-2">
        {records.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            暂无历史记录
          </p>
        ) : null}

        {records.map((record) => (
          <article
            key={record.id}
            className="rounded-md border border-border p-3 transition-colors hover:border-primary/40"
          >
            <div className="mb-1 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {new Date(record.createdAt).toLocaleString()} | {record.sourceLanguage}→{record.targetLanguage}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={record.favorite ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => onToggleFavorite(record.id)}
                  title="收藏"
                >
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(record.id)} title="删除">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <button
              type="button"
              className="w-full text-left"
              onClick={() => onLoad(record)}
              title="加载到编辑区"
            >
              <p className="line-clamp-2 text-sm">{record.sourcePreview}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{record.translatedPreview}</p>
            </button>
          </article>
        ))}
      </div>
    </Drawer>
  )
}
