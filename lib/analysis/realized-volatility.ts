/**
 * Realized Volatility
 * 
 * Volatilità realizzata vs Implied Volatility
 * 
 * Basato su:
 * - "Realized Volatility in the Futures Market" (Andersen et al., 2001)
 * - "The Information Content of Realized Volatility" (Barndorff-Nielsen & Shephard, 2002)
 * 
 * La Realized Volatility misura la volatilità effettiva del prezzo,
 * calcolata dalla varianza dei rendimenti storici.
 * 
 * Formula: RV = √(Σ(ln(P_t/P_{t-1}))² / n) * √252 (annualizzato)
 */

export interface RealizedVolatilityData {
  dailyVolatility: number; // Volatilità giornaliera (%)
  annualizedVolatility: number; // Volatilità annualizzata (%)
  period: number; // Numero di giorni usati
  interpretation: 'low' | 'medium' | 'high' | 'very-high';
}

/**
 * Calcola Realized Volatility da serie storica di prezzi
 * 
 * @param prices - Array di prezzi storici (più recente per primo)
 * @param period - Periodo in giorni (default 30)
 */
export function calculateRealizedVolatility(
  prices: number[],
  period: number = 30
): RealizedVolatilityData {
  if (prices.length < 2) {
    return {
      dailyVolatility: 0,
      annualizedVolatility: 0,
      period: 0,
      interpretation: 'low',
    };
  }

  // Prendi solo i primi N prezzi (più recenti)
  const recentPrices = prices.slice(0, Math.min(period + 1, prices.length));

  // Calcola rendimenti logaritmici
  const returns: number[] = [];
  for (let i = 0; i < recentPrices.length - 1; i++) {
    if (recentPrices[i + 1] > 0) {
      const logReturn = Math.log(recentPrices[i] / recentPrices[i + 1]);
      returns.push(logReturn);
    }
  }

  if (returns.length === 0) {
    return {
      dailyVolatility: 0,
      annualizedVolatility: 0,
      period: 0,
      interpretation: 'low',
    };
  }

  // Calcola media dei rendimenti
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Calcola varianza
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;

  // Volatilità giornaliera (deviazione standard)
  const dailyVolatility = Math.sqrt(variance) * 100; // In percentuale

  // Volatilità annualizzata (assumendo 252 giorni trading)
  const annualizedVolatility = dailyVolatility * Math.sqrt(252);

  // Interpretazione
  let interpretation: 'low' | 'medium' | 'high' | 'very-high';
  if (annualizedVolatility < 30) {
    interpretation = 'low';
  } else if (annualizedVolatility < 60) {
    interpretation = 'medium';
  } else if (annualizedVolatility < 100) {
    interpretation = 'high';
  } else {
    interpretation = 'very-high';
  }

  return {
    dailyVolatility,
    annualizedVolatility,
    period: returns.length,
    interpretation,
  };
}

/**
 * Calcola Realized Volatility da dati Binance (per uso futuro)
 */
export async function getRealizedVolatilityFromBinance(
  symbol: string,
  period: number = 30
): Promise<RealizedVolatilityData | null> {
  try {
    // Ottieni candlestick data da Binance
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1d&limit=${period + 1}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const prices = data.map((k: any[]) => parseFloat(k[4])); // Close prices

    return calculateRealizedVolatility(prices, period);
  } catch (error) {
    console.error(`Error fetching realized volatility for ${symbol}:`, error);
    return null;
  }
}

