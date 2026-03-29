import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function Switch({ className, label, ...props }: SwitchProps) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 text-sm', className)}>
      <span>{label}</span>
      <input type="checkbox" className="h-4 w-4 accent-primary" {...props} />
    </label>
  )
}
