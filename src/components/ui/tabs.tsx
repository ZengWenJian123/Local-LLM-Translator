import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsProps<T extends string> {
  value: T
  onChange: (next: T) => void
  items: Array<{
    value: T
    label: ReactNode
  }>
  className?: string
}

export function Tabs<T extends string>({ value, onChange, items, className }: TabsProps<T>) {
  return (
    <div className={cn('inline-flex rounded-md border border-input bg-background p-1', className)}>
      {items.map((item) => {
        const active = value === item.value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              'rounded px-3 py-1.5 text-sm transition-colors',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
