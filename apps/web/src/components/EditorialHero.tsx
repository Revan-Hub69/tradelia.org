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
  onAiClick?: () => void
}

export function EditorialHero({
  title,
  lede,
  kicker,
  badges = [],
  primaryCta,
  secondaryCta,
  tertiaryCta,
  onAiClick,
  id,
}: EditorialHeroProps) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28" id={id}>
      <div className="absolute inset-0 grid-stroke opacity-35 animate-pulse-slow" aria-hidden />
      <div className="hero-pattern animate-float" aria-hidden />
      <div className="absolute inset-0 hero-mesh animate-drift" aria-hidden />
      <svg
        aria-hidden="true"
        className="hidden lg:block absolute top-4 right-8 text-[var(--accent)]/45 animate-glow"
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 46 L94 38 L142 62 L66 72 Z" />
          <path d="M42 102 L132 94 L156 126 L66 132 Z" />
          <path d="M56 30 L62 120" strokeDasharray="8 6" />
          <path d="M118 46 L124 140" strokeDasharray="8 6" />
          <circle cx="68" cy="60" r="3" fill="currentColor" />
          <circle cx="124" cy="108" r="3" fill="currentColor" />
        </g>
      </svg>
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/6 to-transparent blur-3xl animate-fade-in" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 shadow-lg border border-[var(--br)] card-glow animate-slide-up">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="flex flex-col gap-6">
              {kicker && <span className="section-kicker w-fit animate-fade-in-delay">{kicker}</span>}

              <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl animate-slide-in-left">
                {title}
              </h1>

              <div className="space-y-3 text-lg text-[var(--muted)] leading-relaxed max-w-3xl animate-fade-in-delay-2">
                {lede.map((paragraph, index) => (
                  <p key={index} className="text-xl sm:text-2xl">
                    {paragraph}
                  </p>
                ))}
              </div>

              {(primaryCta || secondaryCta || tertiaryCta) && (
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-2 animate-fade-in-delay-3">
                  {primaryCta && (
                    <Link
                      href={primaryCta.href}
                      className="btn-primary px-5 py-3 text-base shadow-md w-full sm:w-auto animate-bounce-subtle"
                      aria-label={primaryCta.label}
                    >
                      {primaryCta.label}
                    </Link>
                  )}
                  {secondaryCta && (
                    <Link
                      href={secondaryCta.href}
                      className="btn-tertiary w-full sm:w-auto animate-bounce-subtle-delay"
                      aria-label={secondaryCta.label}
                    >
                      {secondaryCta.label}
                    </Link>
                  )}
                  {tertiaryCta && (
                    <Link
                      href={tertiaryCta.href}
                      className="text-[var(--muted)] hover:text-[var(--ink)] text-sm font-semibold inline-flex items-center gap-2 animate-fade-in-delay-4"
                      aria-label={tertiaryCta.label}
                    >
                      {tertiaryCta.label}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  )}
                  {/* AI Assistant Button */}
                  <button
                    className="btn-ghost px-4 py-2 text-sm animate-pulse-slow bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent-2)]/10 border-[var(--accent)]/30 hover:border-[var(--accent)]/60"
                    aria-label="Open AI Assistant"
                    onClick={onAiClick}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    AI Assistant
                  </button>
                </div>
              )}
            </div>

            {badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end animate-slide-in-right">
                {badges.map((badge, index) => (
                  <span key={index} className="pill animate-fade-in-delay">
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
