'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TradeliaLogo } from './icons/TradeliaLogo'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Lezioni', href: '/lezioni' },
]

export function TradeliaHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-2)]/85 backdrop-blur border-b border-[var(--br)]">
      <nav className="mx-auto max-w-5xl px-5 lg:px-6" aria-label="Navigazione principale">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center space-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <TradeliaLogo size={32} className="text-[var(--ink)]" />
            <span className="text-lg font-semibold text-[var(--ink)] tracking-tight hidden sm:inline">Tradelia</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
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

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--br)] text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
            aria-label={isMenuOpen ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={isMenuOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span className="text-sm font-medium">{isMenuOpen ? 'Chiudi' : 'Menu'}</span>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-[var(--br)] py-4 space-y-2 bg-[var(--bg-2)]/95">
            <div className="flex flex-col gap-1">
              {navItems.map(item => (
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
          </div>
        )}
      </nav>
    </header>
  )
}
