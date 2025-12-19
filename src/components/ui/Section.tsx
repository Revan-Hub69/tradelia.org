import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SectionProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string
  title?: string
  description?: string
  children: ReactNode
}

export function Section({
  eyebrow,
  title,
  description,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn('py-16 sm:py-20', className)} {...props}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        {(eyebrow || title || description) && (
          <header className="max-w-3xl space-y-3">
            {eyebrow && (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base text-slate-600 sm:text-lg">{description}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
