'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TradeliaLogo } from './icons/TradeliaLogo'

interface TradeliaHeaderProps {
  lang: string
  onToggleTheme: () => void
  theme: 'dark' | 'light'
  textScale: 'normal' | 'large'
  animations: 'on' | 'reduce'
  onTextScaleChange: (scale: 'normal' | 'large') => void
  onToggleAnimations: () => void
  onOpenSettings: () => void
  onChangeLang: (lang: string) => void
  strings?: {
    animationsShort: string
    themeLabel: string
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
  strings = {
    animationsShort: 'Anim',
    themeLabel: 'Toggle theme',
  }
}: TradeliaHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-2)]/80 backdrop-blur border-b border-[var(--br)]">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <TradeliaLogo size={36} className="text-[var(--ink)]" />
              <span className="text-2xl font-bold text-[var(--ink)] tracking-tight">Tradelia</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/method" className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors font-medium">
              Metodo
            </Link>
            <Link href="/glossary" className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors font-medium">
              Glossario
            </Link>
            <Link href="/sources" className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors font-medium">
              Fonti
            </Link>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Text scale */}
            <div className="hidden sm:flex items-center bg-[var(--surface)] border border-[var(--br)] rounded-full px-1 py-0.5">
              {(['normal', 'large'] as const).map(scale => (
                <button
                  key={scale}
                  onClick={() => onTextScaleChange(scale)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                    textScale === scale
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                  aria-label={`Imposta dimensione testo ${scale === 'normal' ? 'normale' : 'grande'}`}
                >
                  {scale === 'normal' ? 'A' : 'A+'}
                </button>
              ))}
            </div>

            {/* Animations toggle */}
            <button
              onClick={onToggleAnimations}
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--br)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
              aria-label={strings.animationsShort}
            >
              <span className="text-xs font-semibold">{strings.animationsShort}</span>
              <span className={`w-2 h-2 rounded-full ${animations === 'on' ? 'bg-[var(--accent)] pulse-dot' : 'bg-[var(--muted)]'}`} />
            </button>

            {/* Language Switcher - Simplified */}
            <div className="flex items-center space-x-1">
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => onChangeLang(code)}
                  className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                    lang === code
                      ? 'text-[var(--accent)] bg-[var(--surface)]'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {label}
                </button>
            ))}
          </div>

          {/* Settings gear */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <button
            onClick={onOpenSettings}
            className="hidden md:inline-flex items-center p-2 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Apri impostazioni"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.757.427 1.757 2.925 0 3.352a1.724 1.724 0 00-1.066 2.572c.94 1.544-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.427 1.757-2.925 1.757-3.352 0a1.724 1.724 0 00-2.572-1.066c-1.544.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.757-.427-1.757-2.925 0-3.352a1.724 1.724 0 001.066-2.572c-.94-1.544.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors border border-transparent hover:border-[var(--br)]"
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

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[var(--br)] py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[var(--muted)] text-sm">Dimensione testo</span>
                <div className="flex items-center bg-[var(--surface)] border border-[var(--br)] rounded-full px-1 py-0.5">
                  {(['normal', 'large'] as const).map(scale => (
                    <button
                      key={scale}
                      onClick={() => {
                        onTextScaleChange(scale)
                        setIsMenuOpen(false)
                      }}
                      className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                        textScale === scale
                          ? 'bg-[var(--accent)] text-white'
                          : 'text-[var(--muted)] hover:text-[var(--ink)]'
                      }`}
                      aria-label={`Imposta dimensione testo ${scale === 'normal' ? 'normale' : 'grande'}`}
                    >
                      {scale === 'normal' ? 'A' : 'A+'}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/method"
                className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors px-2 py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Metodo
              </Link>
              <Link
                href="/glossary"
                className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors px-2 py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Glossario
              </Link>
              <Link
                href="/sources"
                className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors px-2 py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Fonti
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
