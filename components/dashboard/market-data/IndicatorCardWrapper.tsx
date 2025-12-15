'use client';

import { memo } from 'react';
import { VIXIndicator, VIXIndicatorEnhanced, StockIndexesIndicator } from '@/components/indicators';
import { GenericIndicatorEnhanced } from '@/components/indicators/GenericIndicatorEnhanced';
import { Skeleton } from '@/components/ui/Skeleton';
import { getIndicatorTooltip } from '@/lib/data/indicator-tooltips';

// Mapping indicatori implementati - Usa Enhanced quando disponibile
// NOTA: Usa nomi endpoint corretti, non nomi legacy
const IMPLEMENTED_INDICATORS: Record<string, React.ComponentType<any>> = {
  'vix': VIXIndicatorEnhanced,              // ✅ Enhanced version
  'stock-indexes': StockIndexesIndicator,    // ✅ Standard version (S&P 500, Dow, NASDAQ)
};

// Indicatori che usano GenericIndicatorEnhanced
// AGGIORNATO: Include tutti gli indicatori che devono avere drawer completo
const GENERIC_INDICATORS = [
  // Crypto Base
  'bitcoin-dominance',
  'crypto-market-cap',
  'fear-greed',
  // Yield Curve - Usa GenericIndicatorEnhanced con drawer
  'yield-curve',
  // Stock Base (dalla home)
  'spy',
  // Forex Base (dalla home)
  'eurusd',
  // Commodity Base (dalla home)
  'gold',
  // Crypto Avanzati (PRO)
  'whale-analysis',
  'exchange-flows',
  'top-400-depth',
  'top-movers',
  'aggregated-depth',
  'multi-exchange-depth',
  'top-400-monitor',
  'social-sentiment',
  'trending',
  'developer-activity',
  'l400-history',
  'nvt-ratio',
  'mvrv-ratio',
  'active-addresses',
  'exchange-reserves',
  'funding-rates',
  'long-short-ratio',
  'stablecoin-supply-ratio',
  'exchange-netflows',
  'crypto-correlation-matrix',
  // Forex
  'forex',
  'dxy',
  'currency-strength-index',
  // Commodities
  'commodities',
  'commodity-rotation',
  'futures-term-structure',
  'cot-reports',
  // Market Breadth & Advanced
  'market-breadth',
  'mcclellan-oscillator',
  'arms-index',
  'advance-decline-line',
  'high-low-index',
  // Composite Indicators
  'momentum-composite',
  'volatility-composite',
  'sentiment-composite',
  // Market Data & Events
  'ipo-calendar',
  'corporate-events',
  'sentiment',
  'data',
  'economic-calendar',
  'insider-trading',
  // Economic Indicators
  'economic',
  'bond-yields',
  'leading-economic-indicators',
  'pmi',
  'consumer-confidence',
  'retail-sales',
  'industrial-production',
  'global-pmi',
  'global-inflation',
  'global-central-bank-rates',
  'european-economic-indicators',
  // Indexes
  'european-indexes',
  'asian-indexes',
  'emerging-markets',
  'italian-indexes',
  // ETFs
  'etf-sectoral',
  'etf-geographic',
  'etf-rotations',
  // Advanced Market Indicators
  'vix-term-structure',
  'put-call-ratio',
  'credit-spreads',
  'short-interest',
  'aaii-sentiment',
  // Technical Indicators
  'technical-indicators',
  'money-flow-index',
  'on-balance-volume',
  'williams-r',
  'commodity-channel-index',
  'average-true-range',
  'parabolic-sar',
  'adx',
  'rate-of-change',
  'chaikin-money-flow',
  'accumulation-distribution',
  'percentage-price-oscillator',
  'ichimoku-cloud',
  'fibonacci-retracements',
  'support-resistance-levels',
  'order-flow-imbalance',
  'cumulative-delta',
  'volume-profile',
];

interface IndicatorCardWrapperProps {
  indicatorId: string;
  viewMode: 'grid' | 'list';
}

/**
 * Wrapper che mostra i nuovi componenti indicatori accademici
 * per quelli implementati, altrimenti mostra il componente base
 */
export const IndicatorCardWrapper = memo(function IndicatorCardWrapper({
  indicatorId,
  viewMode,
}: IndicatorCardWrapperProps) {
  const IndicatorComponent = IMPLEMENTED_INDICATORS[indicatorId];
  const tooltipData = getIndicatorTooltip(indicatorId);

  // Use specific component if available
  if (IndicatorComponent) {
    return (
      <div className={viewMode === 'list' ? 'w-full' : ''}>
        <IndicatorComponent />
      </div>
    );
  }

  // Use GenericIndicatorEnhanced for supported indicators
  if (GENERIC_INDICATORS.includes(indicatorId) && tooltipData) {
    // Map academicReferences array to AcademicReference (use first reference)
    const firstRef = tooltipData.academicReferences?.[0];
    const academicReference = firstRef ? {
      paper: firstRef.title,
      authors: firstRef.authors,
      year: firstRef.year,
      theory: firstRef.keyFindings || tooltipData.description,
      validity: 'medium' as const,
    } : {
      paper: tooltipData.name,
      authors: 'N/A',
      year: new Date().getFullYear(),
      theory: tooltipData.description,
      validity: 'medium' as const,
    };

    return (
      <div className={viewMode === 'list' ? 'w-full' : ''}>
        <GenericIndicatorEnhanced
          indicatorId={indicatorId}
          title={tooltipData.name}
          academicReference={academicReference}
        />
      </div>
    );
  }

  // Fallback: mostra skeleton per indicatori non ancora implementati
  return (
    <div className="bg-background-secondary/50 rounded-xl p-6 border border-border">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-48 w-full mb-4" />
      <Skeleton className="h-20 w-full" />
      <p className="text-sm text-text-tertiary mt-4 text-center">
        {indicatorId} - In arrivo
      </p>
    </div>
  );
});
