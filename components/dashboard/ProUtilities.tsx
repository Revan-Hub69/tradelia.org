'use client';

import { useState, useEffect } from 'react';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  FileText, 
  BarChart3, 
  Users, 
  TrendingUp,
  PieChart,
  Calculator,
  Bell,
  ArrowLeft,
  ArrowRight,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useSafeRouter } from '@/lib/hooks/useSafeRouter';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';

// Lazy load heavy utilities
const PortfolioManager = lazy(() => 
  import('./utilities/PortfolioManager').then(module => ({ default: module.PortfolioManager }))
);

        const FinancialCalculator = lazy(() => 
          import('./utilities/FinancialCalculator').then(module => ({ default: module.FinancialCalculator }))
        );

        const AlertSystem = lazy(() => 
          import('./utilities/AlertSystem').then(module => ({ default: module.AlertSystem }))
        );

        const PACSimulator = lazy(() => 
          import('./utilities/PACSimulator').then(module => ({ default: module.PACSimulator }))
        );

interface Utility {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  action?: () => void;
  comingSoon?: boolean;
}

export function ProUtilities() {
  const isPro = useIsPro();
  const { t } = useTranslations();
  const router = useSafeRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null);

  // Blocca scroll quando drawer è aperto
  useBodyScrollLock(isOpen);

  // Ascolta evento per aprire da QuickLinks/QuickActions
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    
    const handleSelectUtility = (e: CustomEvent) => {
      setIsOpen(true);
      setTimeout(() => {
        setSelectedUtility(e.detail);
      }, 300);
    };

    window.addEventListener('open-pro-utilities', handleOpen);
    window.addEventListener('select-utility', handleSelectUtility as EventListener);
    
    return () => {
      window.removeEventListener('open-pro-utilities', handleOpen);
      window.removeEventListener('select-utility', handleSelectUtility as EventListener);
    };
  }, []);

  // Mostra sempre il pulsante, ma alcune utilities saranno limitate ai Pro
  // if (!isPro) {
  //   return null;
  // }

  // Utilities disponibili - logica Pro vs Gratuito
  const utilities: Utility[] = [
    // PRO ONLY - Utilities complete
    {
      id: 'portfolio',
      icon: <PieChart className="w-5 h-5" />,
      label: t('proUtilities.portfolio.label') || 'Gestione Portafoglio',
      description: t('proUtilities.portfolio.description') || 'Monitora e gestisci le tue posizioni',
      // Component rendered conditionally with Suspense
      // requiresPro: true (implicito, controllato in onClick)
    },
    {
      id: 'calculator',
      icon: <Calculator className="w-5 h-5" />,
      label: t('proUtilities.calculator.label') || 'Calcolatrice Finanziaria',
      description: t('proUtilities.calculator.description') || 'Calcoli avanzati per investimenti',
      // Component rendered conditionally with Suspense
      // requiresPro: true
    },
            {
              id: 'alerts',
              icon: <Bell className="w-5 h-5" />,
              label: t('proUtilities.alerts.label') || 'Sistema di Alert',
              description: t('proUtilities.alerts.description') || 'Notifiche personalizzate per i tuoi asset',
              // Component rendered conditionally with Suspense
              // requiresPro: true
            },
            {
              id: 'pac-simulator',
              icon: <TrendingUp className="w-5 h-5" />,
              label: t('proUtilities.pacSimulator.label') || 'Simulatore PAC',
              description: t('proUtilities.pacSimulator.description') || 'Simula investimenti periodici con interesse composto',
              // Component rendered conditionally with Suspense
            },
    // PRO ONLY - Azioni
    {
      id: 'download-pdf',
      icon: <FileText className="w-5 h-5" />,
      label: t('proUtilities.downloadPdf.label') || 'Scarica PDF',
      description: t('proUtilities.downloadPdf.description') || 'Scarica report e documenti in formato PDF',
      action: () => {
        if (!isPro) {
          // Mostra messaggio upgrade
          return;
        }
        // Apri modal download PDF
        window.dispatchEvent(new CustomEvent('open-download-pdf-modal'));
      },
      // requiresPro: true
    },
    {
      id: 'request-analysis',
      icon: <BarChart3 className="w-5 h-5" />,
      label: t('proUtilities.requestAnalysis.label') || 'Richiedi Analisi',
      description: t('proUtilities.requestAnalysis.description') || 'Richiedi analisi personalizzate su misura',
      action: () => {
        if (!isPro) {
          // Mostra messaggio upgrade
          return;
        }
        // Apri modal richiesta analisi
        window.dispatchEvent(new CustomEvent('open-request-analysis-modal'));
      },
      // requiresPro: true
    },
    {
      id: 'community',
      icon: <Users className="w-5 h-5" />,
      label: t('proUtilities.community.label') || 'Community Proposals',
      description: t('proUtilities.community.description') || 'Proponi e vota analisi della community',
      action: () => {
        if (!isPro) {
          // Mostra messaggio upgrade
          return;
        }
        // TODO: Navigare a community proposals
        router.push('/dashboard/voting');
      },
      // requiresPro: true
    },
  ];

  const currentUtility = selectedUtility ? utilities.find(u => u.id === selectedUtility) : null;

  return (
    <>
      {/* Floating Button - sempre visibile */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-accent via-accent to-accent-hover shadow-lg hover:shadow-xl border border-accent/30 flex items-center justify-center text-white transition-all duration-200 group"
        aria-label={t('proUtilities.open') || 'Apri utilities Pro'}
      >
        <Sparkles className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform duration-200" />
        {isPro ? (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-bg-base animate-pulse" />
        ) : (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-bg-base" />
        )}
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setSelectedUtility(null);
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md sm:w-96 bg-bg-surface border-l border-border-subtle shadow-2xl z-50 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-gradient-to-r from-accent/10 via-transparent to-accent/10">
                <div className="flex items-center gap-3">
                  {selectedUtility && (
                    <button
                      onClick={() => setSelectedUtility(null)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
                      aria-label={t('proUtilities.back') || 'Indietro'}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      {currentUtility ? currentUtility.label : (t('proUtilities.title') || 'Utilities Pro')}
                    </h2>
                    <p className="text-xs text-text-tertiary">
                      {currentUtility ? currentUtility.description : (t('proUtilities.subtitle') || 'Strumenti avanzati per utenti Pro')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedUtility(null);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
                  aria-label={t('proUtilities.close') || 'Chiudi'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {!isPro && (
                  <div className="p-6 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">
                          {t('proUtilities.proRequired') || 'Account Pro Richiesto'}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {t('proUtilities.proRequiredDesc') || 'Alcune utilities sono disponibili solo per utenti Pro. Aggiorna il tuo account per sbloccare tutte le funzionalità.'}
                        </p>
                        <Link
                          href="/pricing"
                          className="mt-3 inline-flex items-center gap-2 text-amber-200 hover:text-amber-100 underline text-xs font-medium"
                        >
                          {t('proUtilities.upgradeCta') || 'Vedi piani e prezzi'}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                {selectedUtility && currentUtility ? (
                  <div className="p-6">
                    <Suspense fallback={
                      <div className="space-y-4">
                        <Skeleton variant="rectangular" height={200} />
                        <Skeleton variant="rectangular" height={100} />
                      </div>
                    }>
                      {selectedUtility === 'portfolio' && <PortfolioManager />}
                      {selectedUtility === 'calculator' && <FinancialCalculator />}
                      {selectedUtility === 'alerts' && <AlertSystem />}
                      {selectedUtility === 'pac-simulator' && <PACSimulator />}
                    </Suspense>
                  </div>
                ) : (
                  <div className="p-6 space-y-3">
                    {utilities.map((utility, index) => (
                      <motion.button
                        key={utility.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          if (!utility.comingSoon) {
                            // Tutte le utilities richiedono Pro (tranne quelle future)
                            if (!isPro) {
                              // Banner già mostrato sopra, non fare nulla
                              return;
                            }
                            // All utilities with id have components (portfolio, calculator, alerts, pac-simulator)
                            if (['portfolio', 'calculator', 'alerts', 'pac-simulator'].includes(utility.id)) {
                              setSelectedUtility(utility.id);
                            } else if (utility.action) {
                              utility.action();
                            }
                          }
                        }}
                        disabled={utility.comingSoon || !isPro}
                        className={cn(
                          'w-full p-4 rounded-xl border transition-all duration-200 text-left group',
                          'bg-bg-soft hover:bg-bg-surface border-border-subtle hover:border-accent/40',
                          'hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
                          utility.comingSoon && 'relative overflow-hidden'
                        )}
                      >
                        {utility.comingSoon && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-md text-xs text-amber-300 font-medium">
                            {t('proUtilities.comingSoon') || 'Prossimamente'}
                          </div>
                        )}
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                            utility.comingSoon
                              ? 'bg-bg-surface text-text-tertiary'
                              : 'bg-accent/20 text-accent group-hover:bg-accent/30'
                          )}>
                            {utility.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-text-primary mb-1">
                              {utility.label}
                            </h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              {utility.description}
                            </p>
                          </div>
                          {!utility.comingSoon && (
                            <div className="flex-shrink-0 text-text-tertiary group-hover:text-accent transition-colors">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!selectedUtility && (
                <div className="p-6 border-t border-border-subtle bg-bg-soft/50">
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>
                      {t('proUtilities.footer') || 'Funzionalità esclusive per utenti Pro'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
