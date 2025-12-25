'use client'

import Link from 'next/link'
import { TradeliaLogo } from './icons/TradeliaLogo'

interface FooterLink {
  label: string
  href: string
}

interface InstitutionFooterProps {
  links: FooterLink[]
  disclaimer: string
}

export function InstitutionFooter({ links, disclaimer }: InstitutionFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[var(--bg)] border-t border-[var(--br)]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <TradeliaLogo size={28} className="text-[var(--ink)]" />
              <h3 className="text-lg font-semibold text-[var(--ink)]">Tradelia</h3>
            </div>
            <p className="text-[var(--muted)] leading-relaxed mb-4 max-w-md">
              Progetto educativo indipendente per comprendere il rischio nel mondo delle criptovalute.
            </p>
            <p className="text-sm text-[var(--muted)]">
              © {currentYear} Tradelia. Tutti i diritti riservati.
            </p>
          </div>

          {/* Links sections */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--ink)]">Metodo</h4>
            <ul className="space-y-2">
              {links
                .filter(link => ['Metodo', 'Glossario', 'Fonti'].includes(link.label))
                .map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="footer-link text-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--ink)]">Informazioni</h4>
            <ul className="space-y-2">
              {links
                .filter(link => ['Privacy', 'Cookie', 'Termini', 'Contatti'].includes(link.label))
                .map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="footer-link text-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-[var(--br)] pt-8">
          <p className="text-sm text-[var(--muted)] leading-relaxed max-w-4xl">
            {disclaimer}
          </p>
        </div>
      </div>
    </footer>
  )
}
