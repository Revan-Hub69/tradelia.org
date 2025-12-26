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
    themeLabel: string
    menuLabel: string
    closeMenuLabel: string
    loginLabel?: string
    tagline?: string
  }
}



export function TradeliaHeader({
  onToggleTheme,
  theme,
  navItems = [
    { label: 'Percorsi', href: '#percorso' },
    { label: 'Metodo', href: '#metodo' },
    { label: 'Note', href: '#note' }
  ],
  strings = {
    themeLabel: 'Toggle theme',
    menuLabel: 'Apri menu',
    closeMenuLabel: 'Chiudi menu',
    loginLabel: 'Accedi',
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

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--accent)] text-white font-semibold hover:brightness-110 transition-colors"
              aria-label={strings.loginLabel}
            >
              {strings.loginLabel}
            </Link>
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

            <div className="px-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-white py-3 font-semibold hover:brightness-110 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {strings.loginLabel}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
