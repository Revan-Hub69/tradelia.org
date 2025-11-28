'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
} from '@/lib/animations';

const footerLinks = {
  support: [
    { label: 'Supporto', href: '/support', key: 'support' },
    { label: 'Status', href: '/status', key: 'status' },
    { label: 'Documentazione', href: '/docs', key: 'docs' },
    { label: 'FAQ', href: '/faq', key: 'faq' },
  ],
  legal: [
    { label: 'MiFID II', href: '/mifid', key: 'mifid' },
    { label: 'Privacy', href: '/privacy', key: 'privacy' },
    { label: 'Cookie', href: '/cookie', key: 'cookie' },
    { label: 'Termini e Condizioni', href: '/terms', key: 'terms' },
  ],
  resources: [
    { label: 'Blog', href: '/blog', key: 'blog' },
    { label: 'Guide', href: '/guides', key: 'guides' },
    { label: 'API', href: '/api', key: 'api' },
    { label: 'Changelog', href: '/changelog', key: 'changelog' },
  ],
  company: [
    { label: 'Chi Siamo', href: '/about', key: 'about' },
    { label: 'Carriere', href: '/careers', key: 'careers' },
    { label: 'Stampa', href: '/press', key: 'press' },
    { label: 'Contatti', href: '/contact', key: 'contact' },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);

  return (
    <footer className="relative border-t border-border-subtle glass overflow-hidden" role="contentinfo">
      {/* Subtle pattern */}
      <div className="geometric-pattern" aria-hidden="true" />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary opacity-20" />

      <motion.div
        className="relative z-10 container py-16 px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Left Column - Brand */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <Link
              href="/"
              className="inline-block group transition-smooth hover:-translate-y-0.5"
              aria-label="Tradelia AI - Home"
            >
              <div className="relative">
                <Image
                  src="/logos/tradelia-logo.svg"
                  alt="Tradelia AI"
                  width={200}
                  height={50}
                  className="h-9 w-auto brightness-95 drop-shadow-[0_0_10px_rgba(88,166,255,0.2)] transition-smooth group-hover:brightness-100 group-hover:drop-shadow-[0_0_15px_rgba(88,166,255,0.4)] group-hover:scale-105"
                />
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
              </div>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
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

          {/* Support Column */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 relative pb-2">
              Supporto
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-primary" />
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-smooth inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent opacity-0 scale-0 transition-smooth group-hover:opacity-100 group-hover:scale-100" />
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-primary transition-smooth group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Column */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 relative pb-2">
              Legale
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-primary" />
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-smooth inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent opacity-0 scale-0 transition-smooth group-hover:opacity-100 group-hover:scale-100" />
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-primary transition-smooth group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources & Company Column */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 relative pb-2">
                Risorse
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-primary" />
              </h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-smooth inline-flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-accent opacity-0 scale-0 transition-smooth group-hover:opacity-100 group-hover:scale-100" />
                      <span className="relative">
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-primary transition-smooth group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 relative pb-2">
                Azienda
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-primary" />
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-smooth inline-flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-accent opacity-0 scale-0 transition-smooth group-hover:opacity-100 group-hover:scale-100" />
                      <span className="relative">
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-primary transition-smooth group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.4 }}
          className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              v2.0.1
            </Badge>
            <span className="opacity-40">·</span>
            <span>{new Date().toISOString().split('T')[0]}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-text-primary transition-smooth"
            >
              Privacy
            </Link>
            <span className="opacity-40">·</span>
            <Link
              href="/terms"
              className="hover:text-text-primary transition-smooth"
            >
              Termini
            </Link>
            <span className="opacity-40">·</span>
            <Link
              href="/cookie"
              className="hover:text-text-primary transition-smooth"
            >
              Cookie
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
