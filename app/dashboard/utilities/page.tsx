'use client';

import { useState } from 'react';
import { FinancialCalculator } from '@/components/dashboard/utilities/FinancialCalculator';
import { PACSimulator } from '@/components/dashboard/utilities/PACSimulator';
import { ExpenseTracker } from '@/components/dashboard/utilities/ExpenseTracker';
import { Calculator, TrendingUp, Receipt } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import styles from './utilities.module.css';

type UtilityTab = 'calculator' | 'pac' | 'expenses';

export default function UtilitiesPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<UtilityTab>('calculator');

  const tabs: Array<{ id: UtilityTab; label: string; icon: typeof Calculator }> = [
    {
      id: 'calculator',
      label: t('dashboard.utilities.calculator') || 'Calcolatore Finanziario',
      icon: Calculator,
    },
    {
      id: 'pac',
      label: t('dashboard.utilities.pac') || 'Simulatore PAC',
      icon: TrendingUp,
    },
    {
      id: 'expenses',
      label: t('dashboard.utilities.expenses') || 'Tracker Spese',
      icon: Receipt,
    },
  ];

  return (
    <div className={styles.utilitiesContainer}>
      <header className={styles.utilitiesHeader}>
        <h1 className={styles.utilitiesTitle}>
          {t('dashboard.utilities.title') || 'Utilities'}
        </h1>
        <p className={styles.utilitiesSubtitle}>
          {t('dashboard.utilities.subtitle') || 'Strumenti finanziari e calcolatori'}
        </p>
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

        <div
          id="expenses-panel"
          role="tabpanel"
          aria-labelledby="expenses-tab"
          hidden={activeTab !== 'expenses'}
          className={styles.utilitiesPanel}
        >
          <ExpenseTracker />
        </div>
      </main>
    </div>
  );
}

