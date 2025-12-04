'use client';

import { useState } from 'react';
import { FinancialCalculator } from '@/components/dashboard/utilities/FinancialCalculator';
import { PACSimulator } from '@/components/dashboard/utilities/PACSimulator';
import { TradingJournal } from '@/components/dashboard/utilities/TradingJournal';
import { HedgingCalculator } from '@/components/dashboard/utilities/HedgingCalculator';
import { PositionSizingCalculator } from '@/components/dashboard/utilities/PositionSizingCalculator';
import { RiskRewardCalculator } from '@/components/dashboard/utilities/RiskRewardCalculator';
import { SharpeRatioCalculator } from '@/components/dashboard/utilities/SharpeRatioCalculator';
import { DrawdownCalculator } from '@/components/dashboard/utilities/DrawdownCalculator';
import { OptionsCalculator } from '@/components/dashboard/utilities/OptionsCalculator';
import { KellyCriterionCalculator } from '@/components/dashboard/utilities/KellyCriterionCalculator';
import { PortfolioOptimizer } from '@/components/dashboard/utilities/PortfolioOptimizer';
import { CorrelationCalculator } from '@/components/dashboard/utilities/CorrelationCalculator';
import { VolatilityCalculator } from '@/components/dashboard/utilities/VolatilityCalculator';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { Calculator, TrendingUp, BookOpen, Shield, Target, BarChart3, TrendingDown, Zap, PieChart, Link2, Activity } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import styles from './utilities.module.css';

type UtilityTab = 'calculator' | 'pac' | 'journal' | 'hedging' | 'position' | 'riskreward' | 'sharpe' | 'drawdown' | 'options' | 'kelly' | 'portfolio' | 'correlation' | 'volatility';

export default function UtilitiesPage() {
  const { t } = useTranslations();
  const isPro = useIsPro();
  const [activeTab, setActiveTab] = useState<UtilityTab>('calculator');

  // Strumenti base (disponibili a tutti)
  const baseTabs: Array<{ id: UtilityTab; label: string; icon: typeof Calculator; category: 'base' }> = [
    {
      id: 'calculator',
      label: t('dashboard.utilities.calculator') || 'Calcolatore Finanziario',
      icon: Calculator,
      category: 'base',
    },
    {
      id: 'pac',
      label: t('dashboard.utilities.pac') || 'Simulatore PAC',
      icon: TrendingUp,
      category: 'base',
    },
  ];

  // Strumenti Pro (solo per utenti Pro)
  // Organizzati per categoria logica
  const proTabs: Array<{ id: UtilityTab; label: string; icon: typeof Calculator; category: 'pro' }> = [
    // Risk Management
    {
      id: 'position',
      label: 'Position Sizing',
      icon: Target,
      category: 'pro',
    },
    {
      id: 'riskreward',
      label: 'Risk/Reward',
      icon: BarChart3,
      category: 'pro',
    },
    {
      id: 'hedging',
      label: 'Hedging',
      icon: Shield,
      category: 'pro',
    },
    {
      id: 'drawdown',
      label: 'Drawdown',
      icon: TrendingDown,
      category: 'pro',
    },
    {
      id: 'volatility',
      label: 'Volatility',
      icon: Activity,
      category: 'pro',
    },
    // Performance
    {
      id: 'sharpe',
      label: 'Sharpe Ratio',
      icon: BarChart3,
      category: 'pro',
    },
    {
      id: 'journal',
      label: 'Trading Journal',
      icon: BookOpen,
      category: 'pro',
    },
    // Advanced
    {
      id: 'options',
      label: 'Options',
      icon: Zap,
      category: 'pro',
    },
    {
      id: 'kelly',
      label: 'Kelly Criterion',
      icon: Target,
      category: 'pro',
    },
    {
      id: 'portfolio',
      label: 'Portfolio Optimizer',
      icon: PieChart,
      category: 'pro',
    },
    {
      id: 'correlation',
      label: 'Correlation',
      icon: Link2,
      category: 'pro',
    },
  ];

  const tabs = [...baseTabs, ...(isPro ? proTabs : [])];

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className={styles.utilitiesContainer}>
        <header className={styles.utilitiesHeader}>
        <h1 className={styles.utilitiesTitle}>
          {t('dashboard.utilities.title') || 'Utilities'}
        </h1>
        <p className={styles.utilitiesSubtitle}>
          {t('dashboard.utilities.subtitle') || 'Strumenti finanziari e calcolatori per analisi e trading'}
        </p>
        {!isPro && (
          <div className="mt-4 bg-accent/10 border border-accent/20 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-text-secondary">
              <strong className="text-text-primary">Upgrade a Pro</strong> per accedere a 11 strumenti avanzati: 
              Position Sizing, Risk/Reward, Hedging, Drawdown, Volatility, Sharpe Ratio, Trading Journal, 
              Options Calculator, Kelly Criterion, Portfolio Optimizer e Correlation Calculator.
            </p>
          </div>
        )}
      </header>

      <nav className={styles.utilitiesTabs} role="tablist" aria-label="Utility sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              className={`${styles.utilitiesTab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className={styles.tabIcon} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className={styles.utilitiesContent}>
        {/* Base Tools */}
        <div
          id="calculator-panel"
          role="tabpanel"
          aria-labelledby="calculator-tab"
          hidden={activeTab !== 'calculator'}
          className={styles.utilitiesPanel}
        >
          <FinancialCalculator />
        </div>

        <div
          id="pac-panel"
          role="tabpanel"
          aria-labelledby="pac-tab"
          hidden={activeTab !== 'pac'}
          className={styles.utilitiesPanel}
        >
          <PACSimulator />
        </div>

        {/* Pro Tools */}
        {isPro && (
          <>
            <div
              id="journal-panel"
              role="tabpanel"
              aria-labelledby="journal-tab"
              hidden={activeTab !== 'journal'}
              className={styles.utilitiesPanel}
            >
              <TradingJournal />
            </div>

            <div
              id="hedging-panel"
              role="tabpanel"
              aria-labelledby="hedging-tab"
              hidden={activeTab !== 'hedging'}
              className={styles.utilitiesPanel}
            >
              <HedgingCalculator />
            </div>

            <div
              id="position-panel"
              role="tabpanel"
              aria-labelledby="position-tab"
              hidden={activeTab !== 'position'}
              className={styles.utilitiesPanel}
            >
              <PositionSizingCalculator />
            </div>

            <div
              id="riskreward-panel"
              role="tabpanel"
              aria-labelledby="riskreward-tab"
              hidden={activeTab !== 'riskreward'}
              className={styles.utilitiesPanel}
            >
              <RiskRewardCalculator />
            </div>

            <div
              id="sharpe-panel"
              role="tabpanel"
              aria-labelledby="sharpe-tab"
              hidden={activeTab !== 'sharpe'}
              className={styles.utilitiesPanel}
            >
              <SharpeRatioCalculator />
            </div>

            <div
              id="drawdown-panel"
              role="tabpanel"
              aria-labelledby="drawdown-tab"
              hidden={activeTab !== 'drawdown'}
              className={styles.utilitiesPanel}
            >
              <DrawdownCalculator />
            </div>

            <div
              id="options-panel"
              role="tabpanel"
              aria-labelledby="options-tab"
              hidden={activeTab !== 'options'}
              className={styles.utilitiesPanel}
            >
              <OptionsCalculator />
            </div>

            <div
              id="kelly-panel"
              role="tabpanel"
              aria-labelledby="kelly-tab"
              hidden={activeTab !== 'kelly'}
              className={styles.utilitiesPanel}
            >
              <KellyCriterionCalculator />
            </div>

            <div
              id="portfolio-panel"
              role="tabpanel"
              aria-labelledby="portfolio-tab"
              hidden={activeTab !== 'portfolio'}
              className={styles.utilitiesPanel}
            >
              <PortfolioOptimizer />
            </div>

            <div
              id="correlation-panel"
              role="tabpanel"
              aria-labelledby="correlation-tab"
              hidden={activeTab !== 'correlation'}
              className={styles.utilitiesPanel}
            >
              <CorrelationCalculator />
            </div>

            <div
              id="volatility-panel"
              role="tabpanel"
              aria-labelledby="volatility-tab"
              hidden={activeTab !== 'volatility'}
              className={styles.utilitiesPanel}
            >
              <VolatilityCalculator />
            </div>
          </>
        )}
      </main>
      </div>
    </div>
  );
}

