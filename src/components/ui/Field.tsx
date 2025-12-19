import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type FieldProps = {
  label: string
  description?: string
  error?: string
  children: ReactNode
}

export function Field({ label, description, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2 text-sm text-slate-700">
      <span className="font-medium text-slate-900">{label}</span>
      {description && <span className="text-xs text-slate-500">{description}</span>}
      <div className={cn(error && 'rounded-lg border border-rose-200 p-2')}>{children}</div>
      {error && (
        <span className="text-xs font-medium text-rose-600" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
