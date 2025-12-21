import { MODE_CONFIGS, TIER_CONFIGS } from './types';

export function calculateOBI(bids: [string, string][], asks: [string, string][], depth: number = 5): number {
  const bidVolume = bids.slice(0, depth).reduce((sum, [, qty]) => sum + parseFloat(qty), 0);
  const askVolume = asks.slice(0, depth).reduce((sum, [, qty]) => sum + parseFloat(qty), 0);
  
  if (bidVolume + askVolume === 0) return 0;
  return (bidVolume - askVolume) / (bidVolume + askVolume);
}

export function calculateATR(klines: any[], period: number = 14): number {
  if (klines.length < period + 1) return 0;
  
  const trs = [];
  for (let i = 1; i < klines.length; i++) {
    const high = parseFloat(klines[i].high);
    const low = parseFloat(klines[i].low);
    const prevClose = parseFloat(klines[i - 1].close);
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trs.push(tr);
  }
  
  return trs.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;
}

export function calculateEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema = [values[0]];
  
  for (let i = 1; i < values.length; i++) {
    ema.push(values[i] * k + ema[i - 1] * (1 - k));
  }
  
  return ema;
}

export function calculateSlope(values: number[], period: number = 8): number {
  if (values.length < period) return 0;
  
  const recent = values.slice(-period);
  const n = recent.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = recent.reduce((sum, val) => sum + val, 0);
  const sumXY = recent.reduce((sum, val, i) => sum + val * i, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

export function getTierForSymbol(atr: number): 'TIER1' | 'TIER2' | 'TIER3' {
  if (atr <= TIER_CONFIGS.TIER1.atr_max) return 'TIER1';
  if (atr <= TIER_CONFIGS.TIER2.atr_max) return 'TIER2';
  return 'TIER3';
}

export function calculateSizing(
  equity: number,
  entryPrice: number,
  stopLoss: number,
  mode: keyof typeof MODE_CONFIGS
): { quantity: number; leverage: number } {
  const config = MODE_CONFIGS[mode];
  const risk = Math.abs(entryPrice - stopLoss);
  const riskAmount = equity * config.risk_pct;
  
  const rawQuantity = riskAmount / risk;
  const rawLeverage = (rawQuantity * entryPrice) / equity;
  
  const leverage = Math.min(rawLeverage, config.leverage_cap);
  const quantity = leverage === rawLeverage ? rawQuantity : (equity * leverage) / entryPrice;
  
  return { quantity, leverage };
}

export function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}