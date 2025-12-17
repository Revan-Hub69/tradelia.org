/**
 * Minimal indicator -> endpoint mapping.
 * This file provides `getIndicatorEndpoint` used by client components
 * to fetch indicator data. Extend mapping as needed.
 */

export const INDICATOR_ENDPOINTS: Record<string, string> = {
  // Examples; real endpoints live in `app/api/market-indicators/*`
  'vix': '/api/market-indicators/vix',
  'price': '/api/market-indicators/price',
  'volume': '/api/market-indicators/volume',
  'stock-indexes': '/api/market-indicators/stock-indexes',
};

export function getIndicatorEndpoint(indicatorId: string): string | undefined {
  if (!indicatorId) return undefined;
  // prefer explicit mapping
  if (INDICATOR_ENDPOINTS[indicatorId]) return INDICATOR_ENDPOINTS[indicatorId];
  // fallback convention: try a standard API path
  return `/api/market-indicators/${indicatorId}`;
}

export default getIndicatorEndpoint;
