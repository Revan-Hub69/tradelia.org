'use client';

import { memo, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { BookOpen, Layout, Sparkles, ArrowRight, TrendingUp, Printer } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import { TooltipGlossary } from '@/components/glossary/TooltipGlossary';
import { getGlossaryTerm } from '@/lib/glossary/terms';

export const QuickLinks = memo(function QuickLinks() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [watchlistTerm, setWatchlistTerm] = useState<any>(null);

  // Carica termine Watchlist per tooltip
  useEffect(() => {
    getGlossaryTerm('Watchlist').then(term => {
      if (term) setWatchlistTerm(term);
    });
  }, []);

  const links = [
    {
      id: 'watchlist',
      href: buildLocalePath(locale, '/dashboard/watchlist'),
      icon: TrendingUp,
      label: t('dashboard.quickLinks.watchlist') || 'Watchlist',
      description: t('dashboard.quickLinks.watchlistDesc') || 'Monitora asset con alert personalizzati',
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      borderColor: 'border-green-400/30',
    },
    {
      id: 'glossary',
      href: '/glossary',
      icon: BookOpen,
      label: t('dashboard.quickLinks.glossary') || 'Glossario',
      description: t('dashboard.quickLinks.glossaryDesc') || 'Termini finanziari e definizioni',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      borderColor: 'border-blue-400/30',
    },
    {
      id: 'widgets',
      href: buildLocalePath(locale, '/dashboard/widgets'),
      icon: Layout,
      label: t('dashboard.quickLinks.widgets') || 'Widget',
      description: t('dashboard.quickLinks.widgetsDesc') || 'Personalizza la tua dashboard',
      color: 'text-indigo-300',
      bgColor: 'bg-indigo-500/20',
      borderColor: 'border-indigo-400/30',
    },
    {
      id: 'utilities',
      href: '#',
      icon: Sparkles,
      label: t('dashboard.quickLinks.utilities') || 'Utilities Pro',
      description: t('dashboard.quickLinks.utilitiesDesc') || 'Strumenti avanzati per utenti Pro',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/20',
      borderColor: 'border-amber-400/30',
      proOnly: true,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        // Trigger click sul pulsante floating ProUtilities
        const event = new CustomEvent('open-pro-utilities');
        window.dispatchEvent(event);
      },
    },
    {
      id: 'print',
      href: buildLocalePath(locale, '/dashboard/print'),
      icon: Printer,
      label: t('dashboard.quickLinks.print') || 'Stampa e Download',
      description: t('dashboard.quickLinks.printDesc') || 'Stampa e scarica report in PDF, Excel, CSV',
      color: 'text-red-400',
      bgColor: 'bg-red-400/20',
      borderColor: 'border-red-400/30',
      proOnly: true,
    },
  ];

  return (
    <section className="mb-8" aria-label={t('dashboard.quickLinks.title') || 'Link rapidi'}>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('dashboard.quickLinks.title') || 'Risorse'}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {links.map((link, index) => {
          const Icon = link.icon;
          const isDisabled = link.proOnly && !isPro;
          
          const content = (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative p-4 rounded-xl border transition-all duration-200',
                link.bgColor,
                link.borderColor,
                isDisabled
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:shadow-md hover:scale-[1.02] cursor-pointer'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  link.bgColor,
                  link.color
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary">
                      {link.id === 'watchlist' && watchlistTerm ? (
                        <TooltipGlossary term={watchlistTerm} icon={false}>
                          <span>{link.label}</span>
                        </TooltipGlossary>
                      ) : (
                        link.label
                      )}
                    </h3>
                    {link.proOnly && (
                      <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-xs text-amber-300 font-medium">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {link.description}
                  </p>
                </div>
                <ArrowRight className={cn(
                  'w-4 h-4 flex-shrink-0 transition-transform',
                  isDisabled ? 'text-text-tertiary' : 'text-text-secondary group-hover:translate-x-1'
                )} />
              </div>
            </motion.div>
          );

          if (isDisabled || link.onClick) {
            return (
              <div
                key={link.id}
                onClick={link.onClick}
                className="group"
                role={isDisabled ? undefined : 'button'}
                tabIndex={isDisabled ? undefined : 0}
                onKeyDown={(e) => {
                  if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    link.onClick?.(e as any);
                  }
                }}
                aria-label={isDisabled ? `${link.label} (Richiede account Pro)` : link.label}
                aria-disabled={isDisabled}
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={link.id}
              href={link.href}
              className="group"
              aria-label={link.label}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
});

