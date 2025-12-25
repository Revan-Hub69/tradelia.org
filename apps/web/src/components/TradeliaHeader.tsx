'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { TradeliaLogo } from './icons/TradeliaLogo'

interface TradeliaHeaderProps {
  lang: string
  onToggleTheme: () => void
  theme: 'dark' | 'light'
  textScale: 'small' | 'normal' | 'large'
  animations: 'on' | 'reduce'
  onTextScaleChange: (scale: 'small' | 'normal' | 'large') => void
  onToggleAnimations: () => void
  onOpenSettings: () => void
  onChangeLang: (lang: string) => void
  navItems?: { href: string; label: string }[]
  strings?: {
    animationsShort: string
    themeLabel: string
    menuLabel: string
    closeMenuLabel: string
    settingsLabel: string
    languageLabel: string
    textScaleLabel: string
    animationsLabel: string
    tagline?: string
    textSmallLabel?: string
    textNormalLabel?: string
    textLargeLabel?: string
  }
}

const SUPPORTED_LANGUAGES = {
  it: 'IT',
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  de: 'DE'
}

export function TradeliaHeader({
  lang,
  onToggleTheme,
  theme,
  textScale,
  onTextScaleChange,
  animations,
  onToggleAnimations,
  onOpenSettings,
  onChangeLang,
  navItems = [
    { label: 'Percorsi', href: '#percorso' },
    { label: 'Metodo', href: '#metodo' },
    { label: 'Note', href: '#note' }
  ],
  strings = {
    animationsShort: 'Anim',
    themeLabel: 'Toggle theme',
    menuLabel: 'Apri menu',
    closeMenuLabel: 'Chiudi menu',
    settingsLabel: 'Impostazioni',
    languageLabel: 'Lingua',
    textScaleLabel: 'Dimensione testo',
    animationsLabel: 'Animazioni',
    tagline: 'Design cognitivo · 2025',
    textSmallLabel: 'Compatta',
    textNormalLabel: 'Normale',
    textLargeLabel: 'Ampia',
  }
}: TradeliaHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const computedNavItems = useMemo(() => navItems, [navItems])

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-2)]/85 backdrop-blur border-b border-[var(--br)]">
      <nav className="mx-auto max-w-7xl px-5 lg:px-8" aria-label="Navigazione principale">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
              <TradeliaLogo size={34} className="text-[var(--ink)]" />
              <span className="text-xl font-semibold text-[var(--ink)] tracking-tight hidden sm:inline">Tradelia</span>
            </Link>
            {strings.tagline && (
              <span className="hidden lg:inline text-[var(--muted)] text-sm border-l border-[var(--br)] pl-3">{strings.tagline}</span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {computedNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-full text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
                aria-label={item.label}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center rounded-full border border-[var(--br)] bg-[var(--surface)] px-1 py-0.5">
              {(['small', 'normal', 'large'] as const).map(scale => {
                const label =
                  scale === 'small'
                    ? strings.textSmallLabel || 'Compatta'
                    : scale === 'normal'
                      ? strings.textNormalLabel || 'Normale'
                      : strings.textLargeLabel || 'Ampia'
                return (
                  <button
                    key={scale}
                    onClick={() => onTextScaleChange(scale)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                      textScale === scale
                        ? 'bg-[var(--accent)] text-white shadow-sm'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                    aria-label={`${strings.textScaleLabel} ${label}`}
                  >
                    {scale === 'small' ? 'A-' : scale === 'normal' ? 'A' : 'A+'}
                  </button>
                )
              })}
            </div>

            <button
              onClick={onToggleAnimations}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--br)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
              aria-label={strings.animationsLabel}
            >
              <span className="text-xs font-semibold">{strings.animationsShort}</span>
              <span
                className={`w-2 h-2 rounded-full ${animations === 'on' ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'}`}
                style={animations === 'on' ? { boxShadow: '0 0 0 6px color-mix(in oklab, var(--accent) 35%, transparent)' } : undefined}
              />
            </button>

            <div className="flex items-center gap-1 rounded-full border border-[var(--br)] bg-[var(--surface)] px-2 py-1">
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => onChangeLang(code)}
                  className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                    lang === code
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                  aria-label={`${strings.languageLabel}: ${label}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={onToggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--br)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
              aria-label={strings.themeLabel}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m13.364 6.364l-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 118.646 3.646 9.003 9.003 0 0012 21c3.866 0 7.163-2.455 8.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--br)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
              aria-label={strings.settingsLabel}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.757.427 1.757 2.925 0 3.352a1.724 1.724 0 00-1.066 2.572c.94 1.544-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.427 1.757-2.925 1.757-3.352 0a1.724 1.724 0 00-2.572-1.066c-1.544.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.757-.427-1.757-2.925 0-3.352a1.724 1.724 0 001.066-2.572c-.94-1.544.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--br)] text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
            aria-label={isMenuOpen ? strings.closeMenuLabel : strings.menuLabel}
            aria-expanded={isMenuOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span className="text-sm font-medium">{isMenuOpen ? strings.closeMenuLabel : strings.menuLabel}</span>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-[var(--br)] py-4 space-y-6 bg-[var(--bg-2)]/95">
            <div className="flex flex-col gap-2">
              {computedNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-2 py-3 rounded-lg hover:bg-[var(--surface)] text-[var(--ink)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            <div className="space-y-4 px-2">
              <span className="text-[var(--muted)] text-sm">{strings.languageLabel}</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => {
                      onChangeLang(code)
                      setIsMenuOpen(false)
                    }}
                    className={`px-3 py-2 text-xs font-semibold rounded-full border transition-colors ${
                      lang === code
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]'
                        : 'border-[var(--br)] text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                    aria-label={`${strings.languageLabel}: ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-2 space-y-2">
              <p className="text-[var(--muted)] text-xs">Personalizza tema, testo e animazioni nelle impostazioni.</p>
              <button
                onClick={() => {
                  onOpenSettings()
                  setIsMenuOpen(false)
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-white py-3 font-semibold hover:brightness-110 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.757.427 1.757 2.925 0 3.352a1.724 1.724 0 00-1.066 2.572c.94 1.544-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.427 1.757-2.925 1.757-3.352 0a1.724 1.724 0 00-2.572-1.066c-1.544.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.757-.427-1.757-2.925 0-3.352a1.724 1.724 0 001.066-2.572c-.94-1.544.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {strings.settingsLabel}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
