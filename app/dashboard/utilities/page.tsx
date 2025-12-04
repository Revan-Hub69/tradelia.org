'use client';

import { useState, lazy, Suspense } from 'react';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { Calculator, TrendingUp, BookOpen, Shield, Target, BarChart3, TrendingDown, Zap, PieChart, Link2, Activity } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProBadge } from '@/components/ui/ProBadge';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { cn } from '@/lib/utils/cn';
import styles from './utilities.module.css';

// Lazy load components for better performance
const FinancialCalculator = lazy(() => 
  import('@/components/dashboard/utilities/FinancialCalculator').then(m => ({ default: m.FinancialCalculator }))
);
const PACSimulator = lazy(() => 
  import('@/components/dashboard/utilities/PACSimulator').then(m => ({ default: m.PACSimulator }))
);
const TradingJournal = lazy(() => 
  import('@/components/dashboard/utilities/TradingJournal').then(m => ({ default: m.TradingJournal }))
);
const HedgingCalculator = lazy(() => 
  import('@/components/dashboard/utilities/HedgingCalculator').then(m => ({ default: m.HedgingCalculator }))
);
const PositionSizingCalculator = lazy(() => 
  import('@/components/dashboard/utilities/PositionSizingCalculator').then(m => ({ default: m.PositionSizingCalculator }))
);
const RiskRewardCalculator = lazy(() => 
  import('@/components/dashboard/utilities/RiskRewardCalculator').then(m => ({ default: m.RiskRewardCalculator }))
);
const SharpeRatioCalculator = lazy(() => 
  import('@/components/dashboard/utilities/SharpeRatioCalculator').then(m => ({ default: m.SharpeRatioCalculator }))
);
const DrawdownCalculator = lazy(() => 
  import('@/components/dashboard/utilities/DrawdownCalculator').then(m => ({ default: m.DrawdownCalculator }))
);
const OptionsCalculator = lazy(() => 
  import('@/components/dashboard/utilities/OptionsCalculator').then(m => ({ default: m.OptionsCalculator }))
);
const KellyCriterionCalculator = lazy(() => 
  import('@/components/dashboard/utilities/KellyCriterionCalculator').then(m => ({ default: m.KellyCriterionCalculator }))
);
const PortfolioOptimizer = lazy(() => 
  import('@/components/dashboard/utilities/PortfolioOptimizer').then(m => ({ default: m.PortfolioOptimizer }))
);
const CorrelationCalculator = lazy(() => 
  import('@/components/dashboard/utilities/CorrelationCalculator').then(m => ({ default: m.CorrelationCalculator }))
);
const VolatilityCalculator = lazy(() => 
  import('@/components/dashboard/utilities/VolatilityCalculator').then(m => ({ default: m.VolatilityCalculator }))
);

// Loading fallback component
const CalculatorSkeleton = () => (
  <div className="space-y-6">
    <Skeleton variant="rectangular" height={80} />
    <Skeleton variant="rectangular" height={200} />
    <Skeleton variant="rectangular" height={300} />
  </div>
);

type UtilityTab = 'calculator' | 'pac' | 'journal' | 'hedging' | 'position' | 'riskreward' | 'sharpe' | 'drawdown' | 'options' | 'kelly' | 'portfolio' | 'correlation' | 'volatility';

interface Utility {
  id: UtilityTab;
  label: string;
  icon: typeof Calculator;
  category: 'base' | 'pro';
  group?: 'risk' | 'performance' | 'advanced';
  description: string;
  available: boolean;
}

export default function UtilitiesPage() {
  const { t } = useTranslations();
  const isPro = useIsPro();
  const [selectedUtility, setSelectedUtility] = useState<UtilityTab | null>(null);

  // Tutti gli strumenti (base + pro)
  const allUtilities: Utility[] = [
    // Base Tools
    {
      id: 'calculator',
      label: t('dashboard.utilities.calculator') || 'Calcolatore Finanziario',
      icon: Calculator,
      category: 'base',
      description: 'Calcoli finanziari base: interesse composto, valore futuro, rendite',
      available: true,
    },
    {
      id: 'pac',
      label: t('dashboard.utilities.pac') || 'Simulatore PAC',
      icon: TrendingUp,
      category: 'base',
      description: 'Simula investimenti periodici con interesse composto',
      available: true,
    },
    // Pro Tools - Risk Management
    {
      id: 'position',
      label: 'Position Sizing',
      icon: Target,
      category: 'pro',
      group: 'risk',
      description: 'Calcola la dimensione ottimale della posizione in base al rischio',
      available: true,
    },
    {
      id: 'riskreward',
      label: 'Risk/Reward',
      icon: BarChart3,
      category: 'pro',
      group: 'risk',
      description: 'Valuta la qualità del trade in base al rapporto rischio/rendimento',
      available: true,
    },
    {
      id: 'hedging',
      label: 'Hedging',
      icon: Shield,
      category: 'pro',
      group: 'risk',
      description: 'Calcola strategie di copertura per ridurre il rischio del portafoglio',
      available: true,
    },
    {
      id: 'drawdown',
      label: 'Drawdown',
      icon: TrendingDown,
      category: 'pro',
      group: 'risk',
      description: 'Analizza il drawdown massimo e il tempo di recupero',
      available: true,
    },
    {
      id: 'volatility',
      label: 'Volatility',
      icon: Activity,
      category: 'pro',
      group: 'risk',
      description: 'Calcola la volatilità annualizzata dai rendimenti periodici',
      available: true,
    },
    // Pro Tools - Performance
    {
      id: 'sharpe',
      label: 'Sharpe Ratio',
      icon: BarChart3,
      category: 'pro',
      group: 'performance',
      description: 'Misura il rendimento aggiustato per il rischio',
      available: true,
    },
    {
      id: 'journal',
      label: 'Trading Journal',
      icon: BookOpen,
      category: 'pro',
      group: 'performance',
      description: 'Registra e analizza le tue operazioni di trading',
      available: true,
    },
    // Pro Tools - Advanced
    {
      id: 'options',
      label: 'Options',
      icon: Zap,
      category: 'pro',
      group: 'advanced',
      description: 'Calcola prezzi teorici delle opzioni e Greeks (Black-Scholes)',
      available: true,
    },
    {
      id: 'kelly',
      label: 'Kelly Criterion',
      icon: Target,
      category: 'pro',
      group: 'advanced',
      description: 'Determina la percentuale ottimale di capitale da allocare',
      available: true,
    },
    {
      id: 'portfolio',
      label: 'Portfolio Optimizer',
      icon: PieChart,
      category: 'pro',
      group: 'advanced',
      description: 'Ottimizza l\'allocazione del portafoglio (Markowitz)',
      available: true,
    },
    {
      id: 'correlation',
      label: 'Correlation',
      icon: Link2,
      category: 'pro',
      group: 'advanced',
      description: 'Calcola la correlazione tra due serie di rendimenti',
      available: true,
    },
  ];

  const handleUtilityClick = (utility: Utility) => {
    if (utility.category === 'pro' && !isPro) {
      // Il badge Pro gestirà il click, ma possiamo anche prevenire la navigazione
      // Il badge mostrerà il modal "Passa a Pro"
      return;
    }
    if (!utility.available) {
      return;
    }
    setSelectedUtility(utility.id);
  };

  const selectedUtilityData = selectedUtility 
    ? allUtilities.find(u => u.id === selectedUtility)
    : null;

  // Raggruppa per categoria
  const baseUtilities = allUtilities.filter(u => u.category === 'base');
  const riskUtilities = allUtilities.filter(u => u.category === 'pro' && u.group === 'risk');
  const performanceUtilities = allUtilities.filter(u => u.category === 'pro' && u.group === 'performance');
  const advancedUtilities = allUtilities.filter(u => u.category === 'pro' && u.group === 'advanced');

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            {t('dashboard.utilities.title') || 'Utilities'}
          </h1>
          <p className="text-text-secondary">
            {t('dashboard.utilities.subtitle') || 'Strumenti finanziari professionali per analisi e trading'}
          </p>
        </header>

        {selectedUtilityData ? (
          // Vista dettaglio strumento
          <div className="space-y-6">
            <button
              onClick={() => setSelectedUtility(null)}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
            >
              <span>←</span>
              <span>Torna alla lista</span>
            </button>
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
              <Suspense fallback={<CalculatorSkeleton />}>
                {selectedUtility === 'calculator' && <FinancialCalculator />}
                {selectedUtility === 'pac' && <PACSimulator />}
                {selectedUtility === 'journal' && isPro && <TradingJournal />}
                {selectedUtility === 'hedging' && isPro && <HedgingCalculator />}
                {selectedUtility === 'position' && isPro && <PositionSizingCalculator />}
                {selectedUtility === 'riskreward' && isPro && <RiskRewardCalculator />}
                {selectedUtility === 'sharpe' && isPro && <SharpeRatioCalculator />}
                {selectedUtility === 'drawdown' && isPro && <DrawdownCalculator />}
                {selectedUtility === 'options' && isPro && <OptionsCalculator />}
                {selectedUtility === 'kelly' && isPro && <KellyCriterionCalculator />}
                {selectedUtility === 'portfolio' && isPro && <PortfolioOptimizer />}
                {selectedUtility === 'correlation' && isPro && <CorrelationCalculator />}
                {selectedUtility === 'volatility' && isPro && <VolatilityCalculator />}
              </Suspense>
            </div>
          </div>
        ) : (
          // Vista griglia strumenti
          <div className="space-y-8">
            {/* Strumenti Base */}
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">Strumenti Base</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {baseUtilities.map((utility) => {
                  const Icon = utility.icon;
                  return (
                    <button
                      key={utility.id}
                      onClick={() => handleUtilityClick(utility)}
                      className={cn(
                        'bg-bg-surface border border-border-subtle rounded-xl p-6 text-left',
                        'hover:border-accent/40 hover:shadow-md transition-all',
                        'flex flex-col gap-3',
                        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                      )}
                      aria-label={`${utility.label} - ${utility.description}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-accent" aria-hidden="true" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">{utility.label}</h3>
                        <p className="text-sm text-text-secondary">{utility.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Strumenti Pro - Risk Management */}
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Risk Management {!isPro && <span className="text-sm font-normal text-text-tertiary">(Pro)</span>}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {riskUtilities.map((utility) => {
                  const Icon = utility.icon;
                  const canAccess = isPro && utility.available;
                  return (
                    <button
                      key={utility.id}
                      onClick={() => handleUtilityClick(utility)}
                      disabled={!canAccess}
                      className={cn(
                        'bg-bg-surface border rounded-xl p-6 text-left relative',
                        'transition-all',
                        canAccess
                          ? 'border-border-subtle hover:border-accent/40 hover:shadow-md'
                          : 'border-border-subtle/50 opacity-75 cursor-not-allowed',
                        'flex flex-col gap-3'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          canAccess ? 'bg-accent/20' : 'bg-bg-soft'
                        )}>
                          <Icon className={cn(
                            'w-6 h-6',
                            canAccess ? 'text-accent' : 'text-text-tertiary'
                          )} />
                        </div>
                        <ProBadge size="sm" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">{utility.label}</h3>
                        <p className="text-sm text-text-secondary">{utility.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Strumenti Pro - Performance */}
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Performance {!isPro && <span className="text-sm font-normal text-text-tertiary">(Pro)</span>}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {performanceUtilities.map((utility) => {
                  const Icon = utility.icon;
                  const canAccess = isPro && utility.available;
                  return (
                    <div
                      key={utility.id}
                      className={cn(
                        'bg-bg-surface border rounded-xl p-6 text-left relative',
                        'transition-all',
                        canAccess
                          ? 'border-border-subtle hover:border-accent/40 hover:shadow-md cursor-pointer'
                          : 'border-border-subtle/50 opacity-75',
                        'flex flex-col gap-3'
                      )}
                      onClick={() => handleUtilityClick(utility)}
                      role={canAccess ? 'button' : undefined}
                      tabIndex={canAccess ? 0 : -1}
                      onKeyDown={(e) => {
                        if (canAccess && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleUtilityClick(utility);
                        }
                      }}
                      aria-label={`${utility.label} - ${utility.description}`}
                      aria-disabled={!canAccess}
                    >
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          canAccess ? 'bg-accent/20' : 'bg-bg-soft'
                        )}>
                          <Icon className={cn(
                            'w-6 h-6',
                            canAccess ? 'text-accent' : 'text-text-tertiary'
                          )} />
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <ProBadge size="sm" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">{utility.label}</h3>
                        <p className="text-sm text-text-secondary">{utility.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Strumenti Pro - Advanced */}
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Advanced {!isPro && <span className="text-sm font-normal text-text-tertiary">(Pro)</span>}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedUtilities.map((utility) => {
                  const Icon = utility.icon;
                  const canAccess = isPro && utility.available;
                  return (
                    <div
                      key={utility.id}
                      className={cn(
                        'bg-bg-surface border rounded-xl p-6 text-left relative',
                        'transition-all',
                        canAccess
                          ? 'border-border-subtle hover:border-accent/40 hover:shadow-md cursor-pointer'
                          : 'border-border-subtle/50 opacity-75',
                        'flex flex-col gap-3'
                      )}
                      onClick={() => handleUtilityClick(utility)}
                      role={canAccess ? 'button' : undefined}
                      tabIndex={canAccess ? 0 : -1}
                      onKeyDown={(e) => {
                        if (canAccess && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleUtilityClick(utility);
                        }
                      }}
                      aria-label={`${utility.label} - ${utility.description}`}
                      aria-disabled={!canAccess}
                    >
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          canAccess ? 'bg-accent/20' : 'bg-bg-soft'
                        )}>
                          <Icon className={cn(
                            'w-6 h-6',
                            canAccess ? 'text-accent' : 'text-text-tertiary'
                          )} />
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <ProBadge size="sm" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">{utility.label}</h3>
                        <p className="text-sm text-text-secondary">{utility.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
