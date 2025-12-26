'use client'

import Link from 'next/link'

export interface RiskLevel {
  level: 'low' | 'mid' | 'high' | 'extreme'
  title: string
  description: string
  href: string
}

interface RiskScaleProps {
  items: RiskLevel[]
  title: string
  description: string
  actionLabel: string
}

export function RiskScale({ items, title, description, actionLabel }: RiskScaleProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="space-y-3 mb-10">
          <h2 className="text-3xl font-semibold text-[var(--ink)]">
            {title}
          </h2>
          <p className="text-[var(--muted)] leading-relaxed">
            {description}
          </p>
        </div>

        <ol className="space-y-10">
          {items.map(item => (
            <li key={item.level} className="space-y-3">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[var(--ink)]">{item.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed">{item.description}</p>
              </div>
              <Link
                href={item.href}
                className="inline-flex items-center gap-2 text-[var(--accent)] font-semibold focus:outline-none focus:ring-[var(--focus-ring)]"
                aria-label={`${actionLabel}: ${item.title}`}
              >
                {actionLabel}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
