'use client';

import { useMemo, memo } from 'react';
import { INDICATOR_TOOLTIPS } from '@/lib/data/indicator-tooltips';
import { IndicatorCard } from './IndicatorCard';
import { SectionBanner } from '../SectionBanner';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import type { IndicatorCategory, IndicatorType, ViewMode } from '../tabs/MarketDataTab';
import { cn } from '@/lib/utils/cn';

interface IndicatorGridProps {
  category: IndicatorCategory;
  type: IndicatorType;
  viewMode: ViewMode;
  searchQuery: string;
}

// Mapping indicatori per categoria
const INDICATOR_CATEGORIES: Record<string, string[]> = {
  stock: ['vix', 'spy', 'qqq', 'put-call-ratio', 'vix-term-structure', 'yield-curve', 'credit-spreads'],
  crypto: ['bitcoin-dominance', 'fear-greed', 'crypto-market-cap', 'whale-ratio', 'exchange-flow', 'l400-imbalance', 'top-mover'],
  forex: ['eurusd', 'dxy'],
  commodity: ['gold', 'oil'],
};

// Indicatori PRO
const PRO_INDICATORS = ['whale-ratio', 'exchange-flow', 'l400-imbalance', 'top-mover', 'vix-term-structure', 'put-call-ratio', 'credit-spreads'];

/**
 * Indicator Grid - Grid di tutti gli indicatori organizzati per categoria
 */
export const IndicatorGrid = memo(function IndicatorGrid({
  category,
  type,
  viewMode,
  searchQuery,
}: IndicatorGridProps) {
  const { t, locale } = useTranslations();

  // Filtra indicatori in base a categoria, tipo e search
  const filteredIndicators = useMemo(() => {
    let indicators = Object.keys(INDICATOR_TOOLTIPS);

    // Filtro per categoria
    if (category !== 'all') {
      const categoryIndicators = INDICATOR_CATEGORIES[category] || [];
      indicators = indicators.filter(id => categoryIndicators.includes(id));
    }

    // Filtro per tipo (free/pro)
    if (type !== 'all') {
      if (type === 'pro') {
        indicators = indicators.filter(id => PRO_INDICATORS.includes(id));
      } else {
        indicators = indicators.filter(id => !PRO_INDICATORS.includes(id));
      }
    }

    // Filtro per search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      indicators = indicators.filter(id => {
        const tooltip = INDICATOR_TOOLTIPS[id];
        return (
          tooltip.name.toLowerCase().includes(query) ||
          tooltip.description.toLowerCase().includes(query) ||
          id.toLowerCase().includes(query)
        );
      });
    }

    return indicators;
  }, [category, type, searchQuery]);

  // Raggruppa per categoria
  const groupedIndicators = useMemo(() => {
    const groups: Record<string, string[]> = {
      stock: [],
      crypto: [],
      forex: [],
      commodity: [],
    };

    filteredIndicators.forEach(id => {
      if (INDICATOR_CATEGORIES.stock.includes(id)) {
        groups.stock.push(id);
      } else if (INDICATOR_CATEGORIES.crypto.includes(id)) {
        groups.crypto.push(id);
      } else if (INDICATOR_CATEGORIES.forex.includes(id)) {
        groups.forex.push(id);
      } else if (INDICATOR_CATEGORIES.commodity.includes(id)) {
        groups.commodity.push(id);
      }
    });

    return groups;
  }, [filteredIndicators]);

  const categoryLabels: Record<string, string> = {
    stock: 'Indicatori Stock',
    crypto: 'Indicatori Crypto',
    forex: 'Indicatori Forex',
    commodity: 'Indicatori Commodity',
  };

  if (filteredIndicators.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-2">Nessun indicatore trovato.</p>
        <p className="text-sm text-text-tertiary">Prova a modificare i filtri o la ricerca.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedIndicators).map(([cat, indicators]) => {
        if (indicators.length === 0) return null;

        return (
          <section key={cat} className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">
              {categoryLabels[cat] || cat}
            </h2>
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}
            >
              {indicators.map(id => (
                <IndicatorCard key={id} indicatorId={id} viewMode={viewMode} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
});
