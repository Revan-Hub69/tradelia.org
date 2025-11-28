'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
} from '@/lib/animations';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';

export function Footer() {
  const { t } = useTranslations();
  const year = new Date().getFullYear();
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    support: false,
    legal: false,
    resources: false,
  });

  const footerLinks = {
    support: [
      { key: 'support', href: '/support' },
      { key: 'status', href: '/status' },
      { key: 'documentation', href: '/docs' },
      { key: 'faq', href: '/faq' },
    ],
    legal: [
      { key: 'mifid', href: '/mifid' },
      { key: 'privacy', href: '/privacy' },
      { key: 'cookie', href: '/cookie' },
      { key: 'terms', href: '/terms' },
    ],
    resources: [
      { key: 'blog', href: '/blog' },
      { key: 'guides', href: '/guides' },
      { key: 'api', href: '/api' },
      { key: 'changelog', href: '/changelog' },
    ],
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const FooterSection = ({ 
    title, 
    links, 
    sectionKey, 
    delay 
  }: { 
    title: string; 
    links: typeof footerLinks.support; 
    sectionKey: string;
    delay: number;
  }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <motion.div
        variants={itemVariants}
        transition={{ delay }}
        className="flex flex-col"
      >
        {/* Desktop: Always visible - Best Practice Layout */}
        <div className="hidden md:block">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4">
            {title}
          </h3>
          <ul className="space-y-2.5">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 inline-block"
                >
                  {t(`footer.${sectionKey}Links.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile: Collapsible - Best Practice Accordion */}
        <div className="md:hidden">
          <button
            onClick={() => toggleSection(sectionKey)}
            className="w-full flex items-center justify-between py-3 text-xs font-bold text-text-primary uppercase tracking-widest border-b border-border-subtle"
            aria-expanded={isExpanded}
            aria-controls={`footer-${sectionKey}`}
          >
            <span>{title}</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.ul
                id={`footer-${sectionKey}`}
                initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
                animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
                exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-2.5 pt-3 pb-4"
              >
                {links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 block pl-4"
                    >
                      {t(`footer.${sectionKey}Links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <footer className="relative border-t border-border-subtle bg-bg-surface" role="contentinfo">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary opacity-20" />

      <motion.div
        className="relative z-10 container py-16 md:py-20 px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
      >
        {/* Main Footer Content - Best Practice: 4-column grid desktop, stacked mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12">
          {/* Brand Column - Spans 5 columns on desktop */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-5 flex flex-col gap-4"
          >
            <Link
              href="/"
              className="inline-block group transition-smooth hover:-translate-y-0.5 w-fit"
              aria-label="Tradelia AI - Home"
            >
              <div className="relative">
                <Image
                  src="/logos/tradelia-logo.svg"
                  alt="Tradelia AI"
                  width={200}
                  height={50}
                  className="h-9 w-auto brightness-95 drop-shadow-[0_0_10px_rgba(88,166,255,0.2)] transition-smooth group-hover:brightness-100 group-hover:drop-shadow-[0_0_15px_rgba(88,166,255,0.4)] group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
              </div>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              &copy; {year} Tradelia · {t('footer.copyright')}
            </p>
            <p className="text-base text-text-secondary leading-relaxed max-w-md font-light">
              {t('footer.description')}
            </p>
            <p className="text-xs text-text-muted leading-relaxed max-w-md opacity-90 font-light">
              {t('footer.disclaimer')}
            </p>
          </motion.div>

          {/* Footer Sections - Best Practice: Equal width columns */}
          <FooterSection
            title={t('footer.support')}
            links={footerLinks.support}
            sectionKey="support"
            delay={0.1}
          />

          <FooterSection
            title={t('footer.legal')}
            links={footerLinks.legal}
            sectionKey="legal"
            delay={0.2}
          />

          <FooterSection
            title={t('footer.resources')}
            links={footerLinks.resources}
            sectionKey="resources"
            delay={0.3}
          />
        </div>

        {/* Bottom Bar - Best Practice: Horizontal layout with proper spacing */}
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.4 }}
          className="pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted"
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
              className="hover:text-text-primary transition-colors duration-200"
            >
              Privacy
            </Link>
            <span className="opacity-40">·</span>
            <Link
              href="/terms"
              className="hover:text-text-primary transition-colors duration-200"
            >
              Termini
            </Link>
            <span className="opacity-40">·</span>
            <Link
              href="/cookie"
              className="hover:text-text-primary transition-colors duration-200"
            >
              Cookie
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
