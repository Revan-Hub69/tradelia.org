'use client';

import { useMemo, memo } from 'react';
import { INDICATOR_TOOLTIPS } from '@/lib/data/indicator-tooltips';
import { IndicatorCard } from './IndicatorCard';
import { IndicatorCardWrapper } from './IndicatorCardWrapper';
import { SectionBanner } from '../SectionBanner';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import type { IndicatorCategory, IndicatorType, ViewMode } from '../tabs/MarketDataTab';
import { cn } from '@/lib/utils/cn';

// Indicatori con nuovi componenti accademici implementati (Enhanced version)
// Indicatori che usano componenti accademici con drawer completo
// Include tutti gli indicatori in GENERIC_INDICATORS + componenti specifici
const ACADEMIC_INDICATORS = [
  // Componenti specifici implementati
  'vix',
  'yield-curve',
  'stock-indexes',
  // Tutti gli altri usano GenericIndicatorEnhanced (definito in IndicatorCardWrapper)
  // La lista completa è in IndicatorCardWrapper.GENERIC_INDICATORS
];

interface IndicatorGridProps {
  category: IndicatorCategory;
  type: IndicatorType;
  viewMode: ViewMode;
  searchQuery: string;
}

// Mapping indicatori per categoria - Allineato agli endpoint API implementati
// Export per uso in altri componenti (es. IndicatorGridOptimized)
export const INDICATOR_CATEGORIES: Record<string, string[]> = {
  // Stock & Market Indicators
  stock: [
    'vix',                    // ✅ /api/market-indicators/vix
    'spy',                    // ✅ S&P 500 ETF (dati da /api/market/data)
    'stock-indexes',          // ✅ /api/market-indicators/stock-indexes (S&P 500, Dow, NASDAQ)
    'yield-curve',            // ✅ /api/market-indicators/yield-curve
    'credit-spreads',         // ✅ /api/market-indicators/credit-spreads
    'put-call-ratio',         // ✅ /api/market-indicators/put-call-ratio
    'vix-term-structure',     // ✅ /api/market-indicators/vix-term-structure
    'market-breadth',         // ✅ /api/market-indicators/market-breadth
    'mcclellan-oscillator',   // ✅ /api/market-indicators/mcclellan-oscillator
    'arms-index',             // ✅ /api/market-indicators/arms-index
    'momentum-composite',     // ✅ /api/market-indicators/momentum-composite
    'volatility-composite',   // ✅ /api/market-indicators/volatility-composite
    'sentiment-composite',    // ✅ /api/market-indicators/sentiment-composite
    'short-interest',         // ✅ /api/market-indicators/short-interest
    'dxy',                    // ✅ /api/market-indicators/dxy
  ],
  
  // Economic & Macro Indicators
  economic: [
    'economic',                // ✅ /api/market-indicators/economic (GDP, CPI, Unemployment, Fed Rate)
    'bond-yields',             // ✅ /api/market-indicators/bond-yields (10Y, 2Y Treasury)
    'leading-economic-indicators', // ✅ /api/market-indicators/leading-economic-indicators
    'pmi',                     // ✅ /api/market-indicators/pmi
    'consumer-confidence',      // ✅ /api/market-indicators/consumer-confidence
    'retail-sales',            // ✅ /api/market-indicators/retail-sales
    'industrial-production',   // ✅ /api/market-indicators/industrial-production
    'global-pmi',             // ✅ /api/market-indicators/global-pmi
    'global-inflation',        // ✅ /api/market-indicators/global-inflation
    'global-central-bank-rates', // ✅ /api/market-indicators/global-central-bank-rates
    'european-economic-indicators', // ✅ /api/market-indicators/european-economic-indicators
  ],
  
  // Crypto Indicators
  crypto: [
    'bitcoin-dominance',       // ✅ /api/market-indicators/bitcoin-dominance
    'crypto-market-cap',       // ✅ /api/market-indicators/crypto-market-cap
    'fear-greed',              // ✅ /api/market-indicators/fear-greed
    'whale-analysis',         // ✅ /api/crypto/whale-analysis
    'exchange-flows',          // ✅ /api/crypto/exchange-flows
    'exchange-reserves',      // ✅ /api/crypto/exchange-reserves
    'funding-rates',          // ✅ /api/crypto/funding-rates
    'long-short-ratio',      // ✅ /api/crypto/long-short-ratio
    'stablecoin-supply-ratio', // ✅ /api/crypto/stablecoin-supply-ratio
    'exchange-netflows',      // ✅ /api/crypto/exchange-netflows
    'crypto-correlation-matrix', // ✅ /api/crypto/crypto-correlation-matrix
    'top-400-depth',          // ✅ /api/crypto/top-400-depth
    'top-movers',              // ✅ /api/crypto/top-movers
    'aggregated-depth',        // ✅ /api/crypto/aggregated-depth
    'multi-exchange-depth',    // ✅ /api/crypto/multi-exchange-depth
    'top-400-monitor',         // ✅ /api/crypto/top-400-monitor
    'social-sentiment',        // ✅ /api/crypto/social-sentiment
    'trending',                // ✅ /api/crypto/trending
    'developer-activity',      // ✅ /api/crypto/developer-activity
    'l400-history',            // ✅ /api/crypto/l400-history
    'nvt-ratio',               // ✅ /api/crypto/nvt-ratio
    'mvrv-ratio',              // ✅ /api/crypto/mvrv-ratio
    'active-addresses',        // ✅ /api/crypto/active-addresses
  ],
  
  // Forex Indicators
  forex: [
    'forex',                  // ✅ /api/market-indicators/forex (EUR/USD, GBP/USD, USD/JPY, USD/CHF)
    'eurusd',                 // ✅ EUR/USD (dati da /api/market/data)
    'dxy',                    // ✅ /api/market-indicators/dxy
    'currency-strength-index', // ✅ /api/market-indicators/currency-strength-index
  ],
  
  // Commodity Indicators
  commodity: [
    'commodities',            // ✅ /api/market-indicators/commodities (Gold, Oil, Silver)
    'gold',                   // ✅ Gold Price (dati da /api/market/data)
    'commodity-rotation',     // ✅ /api/market-indicators/commodity-rotation
    'futures-term-structure', // ✅ /api/market-indicators/futures-term-structure
    'cot-reports',            // ✅ /api/market-indicators/cot-reports
  ],
  
  // Market Data & Events
  market: [
    'ipo-calendar',           // ✅ /api/market/ipo-calendar
    'corporate-events',       // ✅ /api/market/corporate-events
    'sentiment',              // ✅ /api/market/sentiment
    'data',                   // ✅ /api/market/data
    'economic-calendar',      // ✅ /api/market/economic-calendar
    'insider-trading',        // ✅ /api/market/insider-trading
    'european-indexes',       // ✅ /api/market-indicators/european-indexes
    'asian-indexes',          // ✅ /api/market-indicators/asian-indexes
    'emerging-markets',       // ✅ /api/market-indicators/emerging-markets
    'italian-indexes',        // ✅ /api/market-indicators/italian-indexes
    'etf-sectoral',          // ✅ /api/market-indicators/etf-sectoral
    'etf-geographic',        // ✅ /api/market-indicators/etf-geographic
    'etf-rotations',         // ✅ /api/market-indicators/etf-rotations
    'technical-indicators',  // ✅ /api/market-indicators/technical-indicators
    'money-flow-index',      // ✅ /api/market-indicators/money-flow-index
    'on-balance-volume',     // ✅ /api/market-indicators/on-balance-volume
    'williams-r',            // ✅ /api/market-indicators/williams-r
    'commodity-channel-index', // ✅ /api/market-indicators/commodity-channel-index
    'average-true-range',    // ✅ /api/market-indicators/average-true-range
    'parabolic-sar',         // ✅ /api/market-indicators/parabolic-sar
    'adx',                   // ✅ /api/market-indicators/adx
    'rate-of-change',        // ✅ /api/market-indicators/rate-of-change
    'chaikin-money-flow',    // ✅ /api/market-indicators/chaikin-money-flow
    'accumulation-distribution', // ✅ /api/market-indicators/accumulation-distribution
    'percentage-price-oscillator', // ✅ /api/market-indicators/percentage-price-oscillator
    'ichimoku-cloud',        // ✅ /api/market-indicators/ichimoku-cloud
    'fibonacci-retracements', // ✅ /api/market-indicators/fibonacci-retracements
    'support-resistance-levels', // ✅ /api/market-indicators/support-resistance-levels
    'order-flow-imbalance',   // ✅ /api/market-indicators/order-flow-imbalance
    'cumulative-delta',       // ✅ /api/market-indicators/cumulative-delta
    'volume-profile',         // ✅ /api/market-indicators/volume-profile
    'market-breadth',        // ✅ /api/market-indicators/market-breadth
    'advance-decline-line',  // ✅ /api/market-indicators/advance-decline-line
    'high-low-index',        // ✅ /api/market-indicators/high-low-index
    'aaii-sentiment',        // ✅ /api/market-indicators/aaii-sentiment
  ],
};

// Indicatori PRO - Solo indicatori avanzati/compositi/microstruttura
// Logica: FREE = indicatori base/semplici, PRO = indicatori avanzati/compositi/complex
const PRO_INDICATORS = [
  // Composite Indicators (avanzati)
  'momentum-composite',
  'volatility-composite',
  'sentiment-composite',
  
  // Advanced Market Breadth (richiedono calcoli complessi)
  'mcclellan-oscillator',
  'arms-index',
  'advance-decline-line',
  'high-low-index',
  
  // Advanced Volatility (term structure, spreads)
  'vix-term-structure',
  'credit-spreads',
  'futures-term-structure',
  
  // Advanced Options (richiedono dati opzioni)
  'put-call-ratio',
  
  // Crypto Microstructure (richiedono dati real-time/WebSocket)
  'whale-analysis',
  'exchange-flows',
  'top-400-depth',
  'aggregated-depth',
  'multi-exchange-depth',
  'top-400-monitor',
  'order-flow-imbalance',
  'cumulative-delta',
  'l400-history',
  
  // Advanced Technical Analysis
  'ichimoku-cloud',
  'fibonacci-retracements',
  'support-resistance-levels',
  'volume-profile',
  
  // Advanced Sentiment (richiedono API paid)
  'aaii-sentiment',
  'social-sentiment',
  
  // Advanced Market Data (richiedono API paid)
  'short-interest',
  'insider-trading',
  'cot-reports',
  
  // Advanced Crypto Metrics (richiedono blockchain APIs)
  'exchange-reserves',
  'exchange-netflows',
  'funding-rates',
  'long-short-ratio',
  'nvt-ratio',
  'mvrv-ratio',
  'active-addresses',
  'developer-activity',
];

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
      economic: [],
      crypto: [],
      forex: [],
      commodity: [],
      market: [],
    };

    filteredIndicators.forEach(id => {
      if (INDICATOR_CATEGORIES.stock?.includes(id)) {
        groups.stock.push(id);
      } else if (INDICATOR_CATEGORIES.economic?.includes(id)) {
        groups.economic.push(id);
      } else if (INDICATOR_CATEGORIES.crypto?.includes(id)) {
        groups.crypto.push(id);
      } else if (INDICATOR_CATEGORIES.forex?.includes(id)) {
        groups.forex.push(id);
      } else if (INDICATOR_CATEGORIES.commodity?.includes(id)) {
        groups.commodity.push(id);
      } else if (INDICATOR_CATEGORIES.market?.includes(id)) {
        groups.market.push(id);
      }
    });

    return groups;
  }, [filteredIndicators]);

  const categoryLabels: Record<string, string> = {
    stock: 'Indicatori Stock & Market',
    economic: 'Indicatori Economici & Macro',
    crypto: 'Indicatori Crypto',
    forex: 'Indicatori Forex',
    commodity: 'Indicatori Commodity',
    market: 'Market Data & Events',
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
    <div className="space-y-6">
      {Object.entries(groupedIndicators).map(([cat, indicators]) => {
        if (indicators.length === 0) return null;

        return (
          <section key={cat} className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              {categoryLabels[cat] || cat}
            </h2>
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4'
                  : 'space-y-3'
              )}
            >
              {indicators.map(id => {
                // Usa IndicatorCardWrapper per tutti gli indicatori che supportano drawer completo
                // IndicatorCardWrapper gestisce internamente IMPLEMENTED_INDICATORS e GENERIC_INDICATORS
                return <IndicatorCardWrapper key={id} indicatorId={id} viewMode={viewMode} />;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
});
