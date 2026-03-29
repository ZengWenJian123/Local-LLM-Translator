import type { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

interface DrawerProps extends PropsWithChildren {
  open: boolean
  onClose: () => void
  title: string
  className?: string
}

export function Drawer({ open, onClose, title, children, className }: DrawerProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        className="h-full flex-1 bg-black/40"
        onClick={onClose}
        aria-label="关闭抽屉"
      />
      <section
        className={cn(
          'h-full w-full max-w-[460px] border-l border-border bg-background p-5 shadow-2xl',
          className,
        )}
      >
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" className="text-sm text-muted-foreground hover:text-foreground" onClick={onClose}>
            关闭
          </button>
        </header>
        <div className="h-[calc(100%-3rem)] overflow-y-auto pr-1">{children}</div>
      </section>
    </div>
  )
}
