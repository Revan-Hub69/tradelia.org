'use client';

import { useState, useEffect } from 'react';
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
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    support: false,
    legal: false,
    resources: false,
  });
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState(2024);

  useEffect(() => {
    setMounted(true);
    setYear(new Date().getFullYear());
  }, []);

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
          <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">
            {title}
          </h3>
          <ul className="space-y-3">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="text-sm text-text-secondary hover:text-text-primary hover:translate-x-1 transition-all duration-200 inline-block group relative"
                >
                  <span className="relative">
                    {t(`footer.${sectionKey}Links.${link.key}`)}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent transition-all duration-200 group-hover:w-full" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile: Collapsible - Best Practice Accordion */}
        <div className="md:hidden">
          <button
            onClick={() => toggleSection(sectionKey)}
            className="w-full flex items-center justify-between py-4 text-xs font-semibold text-text-primary uppercase tracking-wider border-b border-border-subtle hover:text-accent transition-colors duration-200"
            aria-expanded={isExpanded}
            aria-controls={`footer-${sectionKey}`}
          >
            <span>{title}</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-200 text-text-tertiary',
                isExpanded && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.ul
                id={`footer-${sectionKey}`}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, maxHeight: 0 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, maxHeight: 500 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, maxHeight: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden space-y-3 pt-4 pb-4"
              >
                {links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary hover:translate-x-1 transition-all duration-200 block pl-2 group relative"
                      onClick={() => toggleSection(sectionKey)}
                    >
                      <span className="relative">
                        {t(`footer.${sectionKey}Links.${link.key}`)}
                        <span className="absolute -bottom-0.5 left-2 w-0 h-px bg-accent transition-all duration-200 group-hover:w-[calc(100%-0.5rem)]" />
                      </span>
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="py-12 md:py-16 lg:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
        >
          {/* Main Footer Content - Best Practice: Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand Column - Full width on mobile, spans 2 columns on desktop */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-2 lg:col-span-1 flex flex-col gap-4"
            >
              <Link
                href="/"
                className="inline-block group transition-all duration-300 hover:-translate-y-0.5 w-fit mb-2"
                aria-label="Tradelia AI - Home"
              >
                <div className="relative">
                  <Image
                    src="/logos/tradelia-logo.svg"
                    alt="Tradelia AI"
                    width={200}
                    height={50}
                    className="h-9 w-auto brightness-95 drop-shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-300 group-hover:brightness-100 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-hover transition-all duration-300 group-hover:w-full" />
                </div>
              </Link>
              <p className="text-sm text-text-muted leading-relaxed">
                &copy; {mounted ? year : 2024} Tradelia · {t('footer.copyright')}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed max-w-sm transition-colors duration-200">
                {t('footer.description')}
              </p>
              <p className="text-xs text-text-muted leading-relaxed max-w-sm mt-2 opacity-90">
                {t('footer.disclaimer')}
              </p>
            </motion.div>

            {/* Footer Sections - Equal width columns on desktop */}
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

          {/* Bottom Bar - Best Practice: Clean horizontal layout */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.4 }}
            className="pt-8 border-t border-border-subtle"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs font-medium hover:border-accent hover:text-accent transition-all duration-200">
                  v2.0.1
                </Badge>
                <span className="opacity-50">·</span>
                {mounted && (
                  <span className="text-text-tertiary">{new Date().toISOString().split('T')[0]}</span>
                )}
              </div>
              <nav className="flex items-center gap-4" aria-label="Legal links">
                <Link
                  href="/privacy"
                  className="hover:text-text-primary hover:scale-105 transition-all duration-200 inline-block"
                >
                  {t('footer.legalLinks.privacy')}
                </Link>
                <span className="opacity-50">·</span>
                <Link
                  href="/terms"
                  className="hover:text-text-primary hover:scale-105 transition-all duration-200 inline-block"
                >
                  {t('footer.legalLinks.terms')}
                </Link>
                <span className="opacity-50">·</span>
                <Link
                  href="/cookie"
                  className="hover:text-text-primary hover:scale-105 transition-all duration-200 inline-block"
                >
                  {t('footer.legalLinks.cookie')}
                </Link>
              </nav>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
