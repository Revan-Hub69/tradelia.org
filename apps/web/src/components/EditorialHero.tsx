'use client'

import Link from 'next/link'

interface EditorialHeroProps {
  title: string
  lede: string[]
  kicker?: string
  badges?: string[]
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export function EditorialHero({
  title,
  lede,
  kicker,
  badges = [],
  primaryCta,
  secondaryCta,
}: EditorialHeroProps) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
      <div className="absolute inset-0 grid-stroke opacity-50" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/6 to-transparent blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 shadow-lg border border-[var(--br)] card-glow">
          <div className="flex flex-col gap-6 text-center">
            {kicker && <span className="section-kicker self-center">{kicker}</span>}

            <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <div className="space-y-4 text-lg text-[var(--muted)] leading-relaxed max-w-3xl mx-auto">
              {lede.map((paragraph, index) => (
                <p key={index} className="text-xl sm:text-2xl">
                  {paragraph}
                </p>
              ))}
            </div>

            {badges.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {badges.map((badge, index) => (
                  <span key={index} className="pill">
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {(primaryCta || secondaryCta) && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4">
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className="btn-primary px-5 py-3 text-base shadow-md"
                  >
                    {primaryCta.label}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    className="btn-ghost"
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
