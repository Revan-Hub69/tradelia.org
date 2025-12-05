/**
 * Professional SVG Icons for Pro Analysis Tabs
 * 
 * Standard Tradelia AI - High-quality SVG icons
 * All icons are optimized, accessible, and professional
 * Designed for financial/trading context
 */

interface IconProps {
  className?: string;
  size?: number;
}

// Crypto Whale - Large transaction/volume icon
export function CryptoWhaleIcon({ className = 'w-5 h-5', size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d="M3 12h18M12 3v18" />
      <circle cx="8" cy="8" r="2" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="8" cy="16" r="2" />
      <circle cx="16" cy="16" r="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

// Depth Aggregated - Order book depth visualization
export function DepthAggregatedIcon({ className = 'w-5 h-5', size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
      <rect x="5" y="8" width="4" height="8" rx="0.5" />
      <rect x="10" y="5" width="4" height="14" rx="0.5" />
      <rect x="15" y="10" width="4" height="4" rx="0.5" />
    </svg>
  );
}

// Top Movers - Trending chart with arrows
export function TopMoversIcon({ className = 'w-5 h-5', size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <polyline points="3 17 8 12 13 17 21 9" />
      <polyline points="17 6 21 9 17 12" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  );
}

// Futures - Calendar/contract layers
export function FuturesIcon({ className = 'w-5 h-5', size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <path d="M7 14h10M7 18h10" />
    </svg>
  );
}

// Options - Target/bullseye with strike prices
export function OptionsIcon({ className = 'w-5 h-5', size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  );
}

// Forex - Currency exchange arrows
export function ForexIcon({ className = 'w-5 h-5', size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="5" />
      <circle cx="15" cy="15" r="5" />
      <path d="M9 9h6v6" />
      <path d="M15 15H9V9" />
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
    </svg>
  );
}
