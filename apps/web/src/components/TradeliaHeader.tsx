'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TradeliaLogo } from './icons/TradeliaLogo'

interface TradeliaHeaderProps {
  lang: string
  onToggleTheme: () => void
  onChangeLang: (lang: string) => void
}

const SUPPORTED_LANGUAGES = {
  it: 'IT',
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  de: 'DE'
}

export function TradeliaHeader({ lang, onToggleTheme, onChangeLang }: TradeliaHeaderProps) {
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

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              aria-label="Toggle theme"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
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
