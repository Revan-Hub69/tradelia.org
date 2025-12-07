'use client';

import { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { Calculator, TrendingUp, BookOpen, Shield, Target, BarChart3, TrendingDown, Zap, PieChart, Link2, Activity, Eye, Bell, Layout, Settings, Clock, ChevronRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProBadge } from '@/components/ui/ProBadge';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { FeatureComingSoon } from '@/components/ui/FeatureComingSoon';
import { ProLockOverlay } from '@/components/dashboard/utilities/ProLockOverlay';
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
const StrategyBuilder = lazy(() => 
  import('@/components/dashboard/utilities/StrategyBuilder').then(m => ({ default: m.StrategyBuilder }))
);
const PaperTrading = lazy(() => 
  import('@/components/dashboard/utilities/PaperTrading').then(m => ({ default: m.PaperTrading }))
);

// Loading fallback component
const CalculatorSkeleton = () => (
  <div className="space-y-6">
    <Skeleton variant="rectangular" height={80} />
    <Skeleton variant="rectangular" height={200} />
    <Skeleton variant="rectangular" height={300} />
  </div>
);

type UtilityTab = 'calculator' | 'pac' | 'journal' | 'paper-trading' | 'hedging' | 'position' | 'riskreward' | 'sharpe' | 'drawdown' | 'options' | 'kelly' | 'portfolio' | 'correlation' | 'volatility' | 'strategy-builder' | 'watchlist' | 'portfolio-manager' | 'alerts' | 'widgets';

interface Utility {
  id: UtilityTab;
  label: string;
  icon: typeof Calculator;
  category: 'base' | 'pro' | 'coming-soon';
  group?: 'risk' | 'performance' | 'advanced' | 'real-time';
  description: string;
  available: boolean;
  comingSoon?: boolean;
  reason?: string;
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
    {
      id: 'paper-trading',
      label: 'Paper Trading',
      icon: Target,
      category: 'coming-soon',
      group: 'performance',
      description: 'Simula operazioni di trading in tempo reale con ordini avanzati e risk management',
      available: false,
      comingSoon: true,
      reason: 'Richiede integrazione con API real-time per prezzi di mercato e ordini',
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
    {
      id: 'strategy-builder',
      label: 'Strategy Simulator',
      icon: Settings,
      category: 'pro',
      group: 'advanced',
      description: 'Simula e esplora strategie di trading (dati simulati - educativo). Usa Paper Trading per test reali.',
      available: true,
    },
    // Coming Soon - Real-time Tools
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: Eye,
      category: 'coming-soon',
      group: 'real-time',
      description: 'Monitora i tuoi asset preferiti con alert personalizzati',
      available: false,
      comingSoon: true,
      reason: 'Richiede integrazione con API real-time per prezzi di mercato',
    },
    {
      id: 'portfolio-manager',
      label: 'Portfolio Manager',
      icon: PieChart,
      category: 'coming-soon',
      group: 'real-time',
      description: 'Gestisci il tuo portafoglio con aggiornamenti real-time',
      available: false,
      comingSoon: true,
      reason: 'Richiede integrazione con API real-time per prezzi di mercato',
    },
    {
      id: 'alerts',
      label: 'Sistema di Alert',
      icon: Bell,
      category: 'coming-soon',
      group: 'real-time',
      description: 'Notifiche personalizzate per i tuoi asset',
      available: false,
      comingSoon: true,
      reason: 'Richiede integrazione con API real-time per prezzi di mercato',
    },
  ];

  const handleUtilityClick = (utility: Utility) => {
    // Permetti a tutti di vedere gli strumenti Pro, ma bloccali se non Pro
    if (utility.category === 'pro' && !isPro) {
      // Mostra lo strumento ma bloccato (per anteprima)
      setSelectedUtility(utility.id);
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
  // Best Practice: Separare strumenti disponibili da quelli in arrivo
  const baseUtilities = allUtilities.filter(u => u.category === 'base' && u.available);
  const riskUtilities = allUtilities.filter(u => u.category === 'pro' && u.group === 'risk' && u.available);
  const performanceUtilities = allUtilities.filter(u => u.category === 'pro' && u.group === 'performance' && u.available);
  const advancedUtilities = allUtilities.filter(u => u.category === 'pro' && u.group === 'advanced' && u.available);
  // Coming Soon utilities - sezione separata con design distintivo
  // Rimossi widgets - ora disponibili nella sezione dedicata
  const comingSoonUtilities = allUtilities.filter(u => (u.category === 'coming-soon' || u.comingSoon) && u.id !== 'widgets');

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 container-mobile max-w-7xl">
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
            <div className="bg-bg-surface border-premium shadow-premium rounded-xl p-4 md:p-6 card-mobile">
              <Suspense fallback={<CalculatorSkeleton />}>
                {selectedUtility === 'calculator' && <FinancialCalculator />}
                {selectedUtility === 'pac' && <PACSimulator />}
                {/* Pro Tools - Mostrati a tutti ma bloccati se non Pro */}
                {selectedUtility === 'journal' && (
                  isPro ? <TradingJournal /> : <ProLockOverlay><TradingJournal /></ProLockOverlay>
                )}
                {selectedUtility === 'paper-trading' && (
                  <div className="relative">
                    <div className="opacity-50 pointer-events-none">
                      <ComingSoon 
                        title="Paper Trading" 
                        description="Simula operazioni di trading in tempo reale con ordini avanzati e risk management" 
                        reason="Richiede integrazione con API real-time per prezzi di mercato e ordini" 
                        estimatedDate="Q2 2025" 
                      />
                    </div>
                    <FeatureComingSoon
                      featureName="Paper Trading"
                      description="Simula operazioni di trading in tempo reale con ordini avanzati e risk management"
                      reason="Richiede integrazione con API real-time per prezzi di mercato e ordini"
                      estimatedDate="Q2 2025"
                      variant="overlay"
                    />
                  </div>
                )}
                {selectedUtility === 'hedging' && (
                  isPro ? <HedgingCalculator /> : <ProLockOverlay><HedgingCalculator /></ProLockOverlay>
                )}
                {selectedUtility === 'position' && (
                  isPro ? <PositionSizingCalculator /> : <ProLockOverlay><PositionSizingCalculator /></ProLockOverlay>
                )}
                {selectedUtility === 'riskreward' && (
                  isPro ? <RiskRewardCalculator /> : <ProLockOverlay><RiskRewardCalculator /></ProLockOverlay>
                )}
                {selectedUtility === 'sharpe' && (
                  isPro ? <SharpeRatioCalculator /> : <ProLockOverlay><SharpeRatioCalculator /></ProLockOverlay>
                )}
                {selectedUtility === 'drawdown' && (
                  isPro ? <DrawdownCalculator /> : <ProLockOverlay><DrawdownCalculator /></ProLockOverlay>
                )}
                {selectedUtility === 'options' && (
                  isPro ? <OptionsCalculator /> : <ProLockOverlay><OptionsCalculator /></ProLockOverlay>
                )}
                {selectedUtility === 'kelly' && (
                  isPro ? <KellyCriterionCalculator /> : <ProLockOverlay><KellyCriterionCalculator /></ProLockOverlay>
                )}
                {selectedUtility === 'portfolio' && (
                  isPro ? <PortfolioOptimizer /> : <ProLockOverlay><PortfolioOptimizer /></ProLockOverlay>
                )}
                {selectedUtility === 'correlation' && (
                  isPro ? <CorrelationCalculator /> : <ProLockOverlay><CorrelationCalculator /></ProLockOverlay>
                )}
                {selectedUtility === 'volatility' && (
                  isPro ? <VolatilityCalculator /> : <ProLockOverlay><VolatilityCalculator /></ProLockOverlay>
                )}
                {selectedUtility === 'strategy-builder' && (
                  isPro ? <StrategyBuilder /> : <ProLockOverlay><StrategyBuilder /></ProLockOverlay>
                )}
                {selectedUtility === 'watchlist' && (
                  <div className="relative">
                    <div className="opacity-50 pointer-events-none">
                      <ComingSoon title="Watchlist" description="Monitora i tuoi asset preferiti con alert personalizzati" reason="Richiede integrazione con API real-time per prezzi di mercato" estimatedDate="Q2 2025" />
                    </div>
                    <FeatureComingSoon
                      featureName="Watchlist"
                      description="Monitora i tuoi asset preferiti con alert personalizzati"
                      reason="Richiede integrazione con API real-time per prezzi di mercato"
                      estimatedDate="Q2 2025"
                      variant="overlay"
                    />
                  </div>
                )}
                {selectedUtility === 'portfolio-manager' && (
                  <div className="relative">
                    <div className="opacity-50 pointer-events-none">
                      <ComingSoon title="Portfolio Manager" description="Gestisci il tuo portafoglio con aggiornamenti real-time" reason="Richiede integrazione con API real-time per prezzi di mercato" estimatedDate="Q2 2025" />
                    </div>
                    <FeatureComingSoon
                      featureName="Portfolio Manager"
                      description="Gestisci il tuo portafoglio con aggiornamenti real-time"
                      reason="Richiede integrazione con API real-time per prezzi di mercato"
                      estimatedDate="Q2 2025"
                      variant="overlay"
                    />
                  </div>
                )}
                {selectedUtility === 'alerts' && (
                  <div className="relative">
                    <div className="opacity-50 pointer-events-none">
                      <ComingSoon title="Sistema di Alert" description="Notifiche personalizzate per i tuoi asset" reason="Richiede integrazione con API real-time per prezzi di mercato" estimatedDate="Q2 2025" />
                    </div>
                    <FeatureComingSoon
                      featureName="Sistema di Alert"
                      description="Notifiche personalizzate per i tuoi asset"
                      reason="Richiede integrazione con API real-time per prezzi di mercato"
                      estimatedDate="Q2 2025"
                      variant="overlay"
                    />
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        ) : (
          // Vista griglia strumenti
          <div className="space-y-8">
            {/* Brokers - Link a sezione dedicata */}
            <section className="mb-8">
              <Link
                href="/dashboard/brokers"
                className="block bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-premium shadow-premium rounded-xl p-6 hover:border-accent/40 hover:shadow-premium-hover transition-all group interaction-smooth card-mobile"
                aria-label="Vai alla sezione Brokers"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 group-hover:bg-accent/30 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Target className="w-6 h-6 text-accent" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-text-primary mb-2 flex items-center gap-2">
                      Brokers Disponibili
                      <ChevronRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </h2>
                    <p className="text-text-secondary">Strumento informativo per confrontare broker regolamentati. Trova il broker ideale attraverso un percorso guidato basato su criteri accademici e conformità MiFID II</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-accent font-medium underline-selection">
                  <span>Esplora i Broker</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </Link>
            </section>

            {/* Strumenti Base */}
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">Strumenti Base</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 spacing-mobile">
                {baseUtilities.map((utility) => {
                  const Icon = utility.icon;
                  return (
                    <button
                      key={utility.id}
                      onClick={() => handleUtilityClick(utility)}
                      className={cn(
                        'bg-bg-surface border-premium shadow-premium rounded-xl p-4 md:p-6 text-left',
                        'hover:border-border-strong shadow-premium-hover interaction-smooth',
                        'flex flex-col gap-3 group card-mobile',
                        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base'
                      )}
                      aria-label={`Apri ${utility.label}. ${utility.description}`}
                      aria-describedby={`utility-${utility.id}-desc`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-lg bg-accent/20 group-hover:bg-accent/30 flex items-center justify-center transition-colors">
                          <Icon className="w-6 h-6 text-accent" aria-hidden="true" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">{utility.label}</h3>
                        <p id={`utility-${utility.id}-desc`} className="text-sm text-text-secondary">{utility.description}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 spacing-mobile">
                {riskUtilities.map((utility) => {
                  const Icon = utility.icon;
                  const canAccess = isPro && utility.available;
                  return (
                    <div
                      key={utility.id}
                      className={cn(
                        'bg-bg-surface border rounded-xl p-6 text-left relative group',
                        'transition-all duration-200',
                        canAccess
                          ? 'border-premium shadow-premium hover:border-border-strong shadow-premium-hover interaction-smooth cursor-pointer'
                          : 'border-border-subtle/40 opacity-60 cursor-not-allowed',
                        'flex flex-col gap-3',
                        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base'
                      )}
                      onClick={() => canAccess && handleUtilityClick(utility)}
                      role={canAccess ? 'button' : 'presentation'}
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
                          'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                          canAccess ? 'bg-accent/20 group-hover:bg-accent/30' : 'bg-bg-soft/50'
                        )}>
                          <Icon className={cn(
                            'w-6 h-6 transition-colors',
                            canAccess ? 'text-accent' : 'text-text-tertiary/60'
                          )} aria-hidden="true" />
                        </div>
                        {!canAccess && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => e.stopPropagation()}
                            className="relative z-10"
                          >
                            <ProBadge size="sm" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className={cn(
                          'font-semibold mb-1 transition-colors',
                          canAccess ? 'text-text-primary' : 'text-text-secondary'
                        )}>{utility.label}</h3>
                        <p className={cn(
                          'text-sm transition-colors',
                          canAccess ? 'text-text-secondary' : 'text-text-tertiary'
                        )}>{utility.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Strumenti Pro - Performance */}
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Performance {!isPro && <span className="text-sm font-normal text-text-tertiary">(Pro)</span>}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 spacing-mobile">
                {performanceUtilities.map((utility) => {
                  const Icon = utility.icon;
                  const canAccess = isPro && utility.available;
                  return (
                    <div
                      key={utility.id}
                      className={cn(
                        'bg-bg-surface border rounded-xl p-6 text-left relative group',
                        'transition-all duration-200',
                        canAccess
                          ? 'border-premium shadow-premium hover:border-border-strong shadow-premium-hover interaction-smooth cursor-pointer'
                          : 'border-border-subtle/40 opacity-60 cursor-not-allowed',
                        'flex flex-col gap-3',
                        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base'
                      )}
                      onClick={() => canAccess && handleUtilityClick(utility)}
                      role={canAccess ? 'button' : 'presentation'}
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
                          'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                          canAccess ? 'bg-accent/20 group-hover:bg-accent/30' : 'bg-bg-soft/50'
                        )}>
                          <Icon className={cn(
                            'w-6 h-6 transition-colors',
                            canAccess ? 'text-accent' : 'text-text-tertiary/60'
                          )} aria-hidden="true" />
                        </div>
                        {!canAccess && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => e.stopPropagation()}
                            className="relative z-10"
                          >
                            <ProBadge size="sm" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className={cn(
                          'font-semibold mb-1 transition-colors',
                          canAccess ? 'text-text-primary' : 'text-text-secondary'
                        )}>{utility.label}</h3>
                        <p className={cn(
                          'text-sm transition-colors',
                          canAccess ? 'text-text-secondary' : 'text-text-tertiary'
                        )}>{utility.description}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 spacing-mobile">
                {advancedUtilities.map((utility) => {
                  const Icon = utility.icon;
                  const canAccess = isPro && utility.available;
                  return (
                    <div
                      key={utility.id}
                      className={cn(
                        'bg-bg-surface border rounded-xl p-6 text-left relative group',
                        'transition-all duration-200',
                        canAccess
                          ? 'border-premium shadow-premium hover:border-border-strong shadow-premium-hover interaction-smooth cursor-pointer'
                          : 'border-border-subtle/40 opacity-60 cursor-not-allowed',
                        'flex flex-col gap-3',
                        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base'
                      )}
                      onClick={() => canAccess && handleUtilityClick(utility)}
                      role={canAccess ? 'button' : 'presentation'}
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
                          'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                          canAccess ? 'bg-accent/20 group-hover:bg-accent/30' : 'bg-bg-soft/50'
                        )}>
                          <Icon className={cn(
                            'w-6 h-6 transition-colors',
                            canAccess ? 'text-accent' : 'text-text-tertiary/60'
                          )} aria-hidden="true" />
                        </div>
                        {!canAccess && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => e.stopPropagation()}
                            className="relative z-10"
                          >
                            <ProBadge size="sm" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className={cn(
                          'font-semibold mb-1 transition-colors',
                          canAccess ? 'text-text-primary' : 'text-text-secondary'
                        )}>{utility.label}</h3>
                        <p className={cn(
                          'text-sm transition-colors',
                          canAccess ? 'text-text-secondary' : 'text-text-tertiary'
                        )}>{utility.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Coming Soon - Sezione separata con design distintivo */}
            {comingSoonUtilities.length > 0 && (
              <section className="mt-12">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    In Arrivo
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Questi strumenti richiedono integrazione con API real-time e saranno disponibili a breve
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 spacing-mobile">
                  {comingSoonUtilities.map((utility) => {
                    const Icon = utility.icon;
                    return (
                      <div
                        key={utility.id}
                        className={cn(
                          'bg-gradient-to-br from-amber-500/5 via-amber-500/3 to-transparent',
                          'border border-amber-500/20 rounded-xl p-6',
                          'flex flex-col gap-3',
                          'relative overflow-hidden',
                          'cursor-not-allowed'
                        )}
                        role="presentation"
                        aria-label={`${utility.label} - In arrivo`}
                      >
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0" style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(251, 191, 36, 0.1) 10px, rgba(251, 191, 36, 0.1) 20px)`
                          }} />
                        </div>
                        
                        <div className="relative z-10 flex items-start justify-between">
                          <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-amber-400" aria-hidden="true" />
                          </div>
                          <div className="px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/30">
                            <Clock className="w-4 h-4 text-amber-400" />
                          </div>
                        </div>
                        
                        <div className="relative z-10">
                          <h3 className="font-semibold text-text-primary mb-1 flex items-center gap-2">
                            {utility.label}
                            <span className="text-xs font-normal text-amber-400">Coming Soon</span>
                          </h3>
                          <p className="text-sm text-text-secondary mb-3">{utility.description}</p>
                          {utility.reason && (
                            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                              <p className="text-xs text-text-tertiary leading-relaxed">
                                {utility.reason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
