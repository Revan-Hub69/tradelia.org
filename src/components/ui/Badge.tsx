import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type BadgeVariant = 'full' | 'partial' | 'info'

const variants: Record<BadgeVariant, string> = {
  full: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-slate-100 text-slate-600 border-slate-200'
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

export function Badge({ variant = 'info', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
