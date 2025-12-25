'use client'

import Link from 'next/link'

interface EditorialHeroProps {
  id?: string
  title: string
  lede: string[]
  kicker?: string
  badges?: string[]
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  tertiaryCta?: { label: string; href: string }
}

export function EditorialHero({
  title,
  lede,
  kicker,
  badges = [],
  primaryCta,
  secondaryCta,
  tertiaryCta,
  id,
}: EditorialHeroProps) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28" id={id}>
      <div className="absolute inset-0 grid-stroke opacity-35" aria-hidden />
      <div className="absolute inset-0 hero-mesh" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/6 to-transparent blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 shadow-lg border border-[var(--br)] card-glow">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="flex flex-col gap-6">
              {kicker && <span className="section-kicker w-fit">{kicker}</span>}

              <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
                {title}
              </h1>

              <div className="space-y-3 text-lg text-[var(--muted)] leading-relaxed max-w-3xl">
                {lede.map((paragraph, index) => (
                  <p key={index} className="text-xl sm:text-2xl">
                    {paragraph}
                  </p>
                ))}
              </div>

              {(primaryCta || secondaryCta || tertiaryCta) && (
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-2">
                  {primaryCta && (
                    <Link
                      href={primaryCta.href}
                      className="btn-primary px-5 py-3 text-base shadow-md w-full sm:w-auto animate-cta"
                      aria-label={primaryCta.label}
                    >
                      {primaryCta.label}
                    </Link>
                  )}
                  {secondaryCta && (
                    <Link
                      href={secondaryCta.href}
                      className="btn-ghost w-full sm:w-auto"
                      aria-label={secondaryCta.label}
                    >
                      {secondaryCta.label}
                    </Link>
                  )}
                  {tertiaryCta && (
                    <Link
                      href={tertiaryCta.href}
                      className="text-[var(--muted)] hover:text-[var(--ink)] text-sm font-semibold"
                      aria-label={tertiaryCta.label}
                    >
                      {tertiaryCta.label} →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                {badges.map((badge, index) => (
                  <span key={index} className="pill">
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
