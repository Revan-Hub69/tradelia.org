/**
 * Indicator Icons - SVG Professionali Tradelia
 * 
 * SVG inline professionali per tutti gli indicatori
 * Stile: minimal, modern, professional
 * Supporto dark/light mode
 */

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * VIX Icon - Volatility Index
 */
export function VIXIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
      <path d="M6 3v18M18 3v18" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/**
 * Stock Indexes Icon
 */
export function StockIndexesIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="21 7 21 3 17 3" />
      <polyline points="3 17 3 21 7 21" />
    </svg>
  );
}

/**
 * Yield Curve Icon
 */
export function YieldCurveIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 21l9-9 9 9" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </svg>
  );
}

/**
 * Bitcoin Dominance Icon
 */
export function BitcoinDominanceIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  );
}

/**
 * Fear & Greed Icon
 */
export function FearGreedIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v20M2 12h20" />
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 1 1 0 16" />
    </svg>
  );
}

/**
 * Forex Icon
 */
export function ForexIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/**
 * Commodities Icon
 */
export function CommoditiesIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 3h12l4 6-10 12L2 9z" />
      <path d="M11 12l5-6" />
    </svg>
  );
}

/**
 * Whale Analysis Icon
 */
export function WhaleAnalysisIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v20M2 12h20" />
      <circle cx="12" cy="12" r="3" />
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}

/**
 * Market Breadth Icon
 */
export function MarketBreadthIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M3 12h18M12 3v18" />
    </svg>
  );
}

/**
 * RSS Feed Icon
 */
export function RSSIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}

/**
 * Economic Calendar Icon
 */
export function EconomicCalendarIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

/**
 * Momentum Icon
 */
export function MomentumIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12h18M12 3v18" />
      <path d="M6 6l6 6 6-6" />
      <path d="M6 18l6-6 6 6" />
    </svg>
  );
}

/**
 * ETF Icon
 */
export function ETFIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  );
}

/**
 * Generic Indicator Icon (fallback)
 */
export function IndicatorIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20M2 12h20" />
    </svg>
  );
}

/**
 * Icon mapping per indicatori
 */
export const INDICATOR_ICONS: Record<string, React.ComponentType<IconProps>> = {
  'vix': VIXIcon,
  'stock-indexes': StockIndexesIcon,
  'yield-curve': YieldCurveIcon,
  'bitcoin-dominance': BitcoinDominanceIcon,
  'fear-greed': FearGreedIcon,
  'forex': ForexIcon,
  'commodities': CommoditiesIcon,
  'whale-analysis': WhaleAnalysisIcon,
  'market-breadth': MarketBreadthIcon,
  'mcclellan-oscillator': MarketBreadthIcon,
  'arms-index': MarketBreadthIcon,
  'momentum-composite': MomentumIcon,
  'volatility-composite': VIXIcon,
  'european-indexes': StockIndexesIcon,
  'asian-indexes': StockIndexesIcon,
  'etf-sectoral': ETFIcon,
  'short-interest': MarketBreadthIcon,
  'rss': RSSIcon,
  'economic-calendar': EconomicCalendarIcon,
};

/**
 * Ottiene l'icona per un indicatore
 */
export function getIndicatorIcon(indicatorId: string): React.ComponentType<IconProps> {
  return INDICATOR_ICONS[indicatorId] || IndicatorIcon;
}
