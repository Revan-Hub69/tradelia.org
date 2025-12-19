import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'error'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        {
          'border-slate-200 bg-slate-100 text-slate-900': variant === 'default',
          'border-green-200 bg-green-100 text-green-800': variant === 'success',
          'border-yellow-200 bg-yellow-100 text-yellow-800': variant === 'warning',
          'border-blue-200 bg-blue-100 text-blue-800': variant === 'info',
          'border-red-200 bg-red-100 text-red-800': variant === 'error',
        },
        className
      )}
      {...props}
    />
  )
}