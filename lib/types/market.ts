/**
 * Market Types - Unified types for multi-market support
 * Supports: Crypto, Stocks, Forex, Commodities
 */

export type AssetType = 'crypto' | 'stock' | 'forex' | 'commodity';

export interface MarketAsset {
  symbol: string;
  name: string;
  type: AssetType;
  exchange?: string;
  currency?: string;
}

export interface MarketIndicator {
  id: string;
  name: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  status: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
  isPro?: boolean;
  badge?: string;
  assetType?: AssetType;
}

export interface PriceData {
  timestamp: string;
  price: number;
  volume?: number;
}

export interface MarketData {
  symbol: string;
  assetType: AssetType;
  currentPrice: number;
  change24h: number;
  change24hPercent: number;
  volume24h?: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
}

// Asset definitions
export const CRYPTO_ASSETS: MarketAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
  { symbol: 'BNB', name: 'Binance Coin', type: 'crypto' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto' },
  { symbol: 'ADA', name: 'Cardano', type: 'crypto' },
  { symbol: 'XRP', name: 'Ripple', type: 'crypto' },
  { symbol: 'DOT', name: 'Polkadot', type: 'crypto' },
  { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto' },
];

export const STOCK_ASSETS: MarketAsset[] = [
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'stock', exchange: 'NYSE' },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'DIA', name: 'Dow Jones ETF', type: 'stock', exchange: 'NYSE' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ' },
];

export const FOREX_ASSETS: MarketAsset[] = [
  { symbol: 'EURUSD', name: 'Euro / US Dollar', type: 'forex', currency: 'USD' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', type: 'forex', currency: 'USD' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', type: 'forex', currency: 'JPY' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', type: 'forex', currency: 'CHF' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', type: 'forex', currency: 'USD' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', type: 'forex', currency: 'CAD' },
];

export const COMMODITY_ASSETS: MarketAsset[] = [
  { symbol: 'GOLD', name: 'Gold', type: 'commodity', currency: 'USD' },
  { symbol: 'SILVER', name: 'Silver', type: 'commodity', currency: 'USD' },
  { symbol: 'OIL', name: 'Crude Oil', type: 'commodity', currency: 'USD' },
  { symbol: 'NATURAL_GAS', name: 'Natural Gas', type: 'commodity', currency: 'USD' },
  { symbol: 'COPPER', name: 'Copper', type: 'commodity', currency: 'USD' },
];

export const ALL_ASSETS: MarketAsset[] = [
  ...CRYPTO_ASSETS,
  ...STOCK_ASSETS,
  ...FOREX_ASSETS,
  ...COMMODITY_ASSETS,
];

export function getAssetBySymbol(symbol: string): MarketAsset | undefined {
  return ALL_ASSETS.find(asset => asset.symbol.toUpperCase() === symbol.toUpperCase());
}

export function getAssetsByType(type: AssetType): MarketAsset[] {
  switch (type) {
    case 'crypto':
      return CRYPTO_ASSETS;
    case 'stock':
      return STOCK_ASSETS;
    case 'forex':
      return FOREX_ASSETS;
    case 'commodity':
      return COMMODITY_ASSETS;
    default:
      return [];
  }
}
