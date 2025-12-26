'use client'

import Link from 'next/link'
import { RiskLowIcon } from './icons/RiskLowIcon'
import { RiskMidIcon } from './icons/RiskMidIcon'
import { RiskHighIcon } from './icons/RiskHighIcon'
import { RiskExtremeIcon } from './icons/RiskExtremeIcon'

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
  const getIcon = (level: RiskLevel['level']) => {
    switch (level) {
      case 'low':
        return RiskLowIcon
      case 'mid':
        return RiskMidIcon
      case 'high':
        return RiskHighIcon
      case 'extreme':
        return RiskExtremeIcon
      default:
        return RiskLowIcon
    }
  }

  const getBadgeClass = (level: RiskLevel['level']) => {
    switch (level) {
      case 'low':
        return 'badge-risk-low'
      case 'mid':
        return 'badge-risk-mid'
      case 'high':
        return 'badge-risk-high'
      case 'extreme':
        return 'badge-risk-extreme'
      default:
        return 'badge-risk-low'
    }
  }

  return (
    <section className="py-20 bg-[var(--bg-2)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16 space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--ink)]">
            {title}
          </h2>
          <p className="text-[var(--muted)]">
            {description}
          </p>
        </div>

        {/* Desktop: horizontal layout */}
        <div className="hidden lg:block">
          <ol className="grid grid-cols-4 gap-8">
            {items.map((item, index) => {
              const IconComponent = getIcon(item.level)
              return (
                <li key={item.level} className="flex flex-col items-center">
                  <div className="bg-[var(--surface)] border border-[var(--br)] rounded-lg p-8 w-full text-center hover:border-[var(--accent)] transition-colors">
                    <div className="flex items-center justify-center mb-4">
                      <IconComponent className="w-8 h-8 mr-3 text-[var(--ink)]" />
                      <span className={getBadgeClass(item.level)}>{item.title}</span>
                    </div>
                    <p className="text-[var(--muted)] mb-6 leading-relaxed">
                      {item.description}
                    </p>
                    <Link
                      href={item.href}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-colors focus:ring-[var(--focus-ring)] focus:outline-none rounded-md"
                      aria-label={`${actionLabel}: ${item.title}`}
                    >
                      {actionLabel}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Mobile: vertical stack layout */}
        <div className="lg:hidden">
          <ol className="space-y-6">
            {items.map((item, index) => {
              const IconComponent = getIcon(item.level)
              return (
                <li key={item.level}>
                  <div className="bg-[var(--surface)] border border-[var(--br)] rounded-lg p-6 hover:border-[var(--accent)] transition-colors">
                    <div className="flex items-center mb-4">
                      <IconComponent className="w-6 h-6 mr-3 text-[var(--ink)] flex-shrink-0" />
                      <span className={getBadgeClass(item.level)}>{item.title}</span>
                    </div>
                    <p className="text-[var(--muted)] mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <Link
                      href={item.href}
                      className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-colors focus:ring-[var(--focus-ring)] focus:outline-none rounded-md"
                      aria-label={`${actionLabel}: ${item.title}`}
                    >
                      {actionLabel}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
