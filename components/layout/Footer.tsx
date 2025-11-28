'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const footerLinks = {
  support: [
    { label: 'Supporto', href: '#support' },
    { label: 'Status', href: '#status' },
  ],
  legal: [
    { label: 'MiFID', href: '#mifid' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'Cookie', href: '#cookie' },
    { label: 'Termini', href: '#terms' },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-bg-soft overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_40px,rgba(255,255,255,0.008)_40px,rgba(255,255,255,0.008)_41px)]" />
      </div>

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary opacity-30" />

      <div className="relative z-10 container py-16 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <Link
              href="/"
              className="inline-block group transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="relative">
                <Image
                  src="/logos/tradelia-logo.svg"
                  alt="Tradelia AI"
                  width={200}
                  height={50}
                  className="h-9 w-auto brightness-95 drop-shadow-[0_0_10px_rgba(0,188,212,0.2)] transition-all duration-300 group-hover:brightness-100 group-hover:drop-shadow-[0_0_15px_rgba(0,188,212,0.4)] group-hover:scale-105"
                />
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
              </div>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-md">
              &copy; {year} Tradelia AI · Tutti i diritti riservati
            </p>
            <p className="text-base text-text-secondary leading-relaxed max-w-md font-light">
              Formazione finanziaria gratuita basata su framework AI proprietari verificabili.
              Materiale conforme agli standard accademici internazionali e alle normative MiFID II.
            </p>
            <p className="text-xs text-text-muted leading-relaxed max-w-md opacity-90 font-light">
              Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria.
            </p>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-8"
          >
            <nav className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 relative pb-2">
                  Supporto
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-primary" />
                </h3>
                <ul className="space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-secondary hover:text-text-primary transition-all duration-300 inline-flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-accent opacity-0 scale-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
                        <span className="relative">
                          {link.label}
                          <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-primary transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 relative pb-2">
                  Legale
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-primary" />
                </h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-secondary hover:text-text-primary transition-all duration-300 inline-flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-accent opacity-0 scale-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
                        <span className="relative">
                          {link.label}
                          <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-primary transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
            <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
              <Badge variant="outline" className="text-xs">
                v2.0.1
              </Badge>
              <span className="opacity-40">·</span>
              <span>{new Date().toISOString().split('T')[0]}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
