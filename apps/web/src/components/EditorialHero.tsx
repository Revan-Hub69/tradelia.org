'use client'

import Link from 'next/link'

interface EditorialHeroProps {
  id?: string
  title: string
  lede: string[]
  kicker?: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export function EditorialHero({
  title,
  lede,
  kicker,
  primaryCta,
  secondaryCta,
  id,
}: EditorialHeroProps) {
  return (
    <section className="py-16 sm:py-20" id={id}>
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {kicker && <span className="text-sm text-[var(--muted)]">{kicker}</span>}

          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
            {title}
          </h1>

          <div className="space-y-4 text-lg text-[var(--muted)] leading-relaxed">
            {lede.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {(primaryCta || secondaryCta) && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center justify-center px-5 py-3 bg-[var(--accent)] text-white font-semibold rounded-md focus:outline-none focus:ring-[var(--focus-ring)]"
                  aria-label={primaryCta.label}
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="text-[var(--muted)] hover:text-[var(--ink)] font-semibold"
                  aria-label={secondaryCta.label}
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
