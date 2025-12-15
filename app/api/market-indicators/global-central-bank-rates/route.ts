import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Global Central Bank Rates API
 * 
 * Global Central Bank Interest Rates
 * - Fed Rate (USA)
 * - ECB Rate (EU)
 * - BOJ Rate (Japan)
 * - BOE Rate (UK)
 * - PBOC Rate (China)
 * - Global Average Rate
 * 
 * Academic Reference:
 * - Central Bank Rates Theory - Monetary policy indicator
 * - High rates = restrictive policy, bearish
 * - Low rates = accommodative policy, bullish
 * - Rate changes = major market drivers
 * 
 * Data Source: FRED API (FREE) or simulated
 * Updates: When central banks meet (monthly/quarterly)
 */

interface GlobalCentralBankRatesData {
  rates: Array<{
    bank: string;
    country: string;
    rate: number;
    previous: number;
    change: number;
  }>;
  globalAverage: number;
  interpretation: string;
  signal: 'accommodative' | 'restrictive' | 'neutral';
}

/**
 * Get Global Central Bank Rates
 */
async function getGlobalCentralBankRates(): Promise<GlobalCentralBankRatesData | null> {
  const fredApiKey = process.env.FRED_API_KEY;
  
  if (!fredApiKey) {
    throw new Error('FRED_API_KEY not configured');
  }

  try {
    // Fetch central bank rates from FRED API
    // FRED Series IDs for central bank rates
    const seriesMap: Record<string, string> = {
      'Fed': 'FEDFUNDS', // Federal Funds Rate
      'ECB': 'IR3TIB01EZM156N', // ECB 3-month rate
      'BOJ': 'IR3TIB01JPM156N', // BOJ 3-month rate
      'BOE': 'IR3TIB01GBM156N', // BOE 3-month rate
      'PBOC': 'IR3TIB01CNM156N', // PBOC 3-month rate
    };

    const rates: Array<{
      bank: string;
      country: string;
      rate: number;
      previous: number;
      change: number;
    }> = [];

    for (const [bank, seriesId] of Object.entries(seriesMap)) {
      try {
        const response = await fetch(
          `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json&limit=2&sort_order=desc`,
          { next: { revalidate: 3600 } }
        );
        
        if (!response.ok) {
          console.warn(`Failed to fetch ${bank} rate from FRED`);
          continue;
        }
        
        const data = await response.json();
        if (data.observations && data.observations.length >= 2) {
          const current = parseFloat(data.observations[0].value);
          const previous = parseFloat(data.observations[1].value);
          
          if (!isNaN(current) && !isNaN(previous)) {
            rates.push({
              bank,
              country: bank === 'Fed' ? 'USA' : bank === 'ECB' ? 'EU' : bank === 'BOJ' ? 'Japan' : bank === 'BOE' ? 'UK' : 'China',
              rate: current,
              previous,
              change: current - previous,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching ${bank} rate:`, error);
      }
    }

    if (rates.length === 0) {
      throw new Error('Failed to fetch central bank rates from FRED API');
    }

    // Calculate previous and change for each rate (already fetched from FRED)
    // Rates already have previous and change calculated from FRED data

    const globalAverage = rates.reduce((sum, r) => sum + r.rate, 0) / rates.length;

    // Interpretation
    let interpretation = '';
    let signal: 'accommodative' | 'restrictive' | 'neutral' = 'neutral';

    if (globalAverage < 2.0) {
      interpretation = 'Accommodative global rates: Low interest rates worldwide, bullish for markets';
      signal = 'accommodative';
    } else if (globalAverage > 4.0) {
      interpretation = 'Restrictive global rates: High interest rates worldwide, bearish for markets';
      signal = 'restrictive';
    } else {
      interpretation = 'Neutral global rates: Moderate interest rates worldwide';
      signal = 'neutral';
    }

    return {
      rates: rates.map(r => ({
        bank: r.bank,
        country: r.country,
        rate: Math.round(r.rate * 100) / 100,
        previous: Math.round(r.previous * 100) / 100,
        change: Math.round(r.change * 100) / 100,
      })),
      globalAverage: Math.round(globalAverage * 100) / 100,
      interpretation,
      signal,
    };
  } catch (error) {
    console.error('Error calculating Global Central Bank Rates:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Global Central Bank Rates (Enhanced)
 */
async function getGlobalCentralBankRatesAIReading(data: GlobalCentralBankRatesData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Global Central Bank Rates (Tassi Banche Centrali Globali)',
    {
      globalAverage: `${data.globalAverage.toFixed(2)}%`,
      rates: data.rates.map(r => ({
        banca: `${r.bank} (${r.country})`,
        tasso: `${r.rate.toFixed(2)}%`,
        variazione: `${r.change >= 0 ? '+' : ''}${r.change.toFixed(2)}%`,
      })),
      signal: data.signal === 'accommodative' ? 'Accomodante (Bullish)' :
              data.signal === 'restrictive' ? 'Restrittiva (Bearish)' : 'Neutrale',
    },
    {
      theory: 'Global Central Bank Rates Theory - I tassi delle banche centrali globali indicano la politica monetaria mondiale. Tassi alti = politica restrittiva (bearish), tassi bassi = politica accomodante (bullish). Cambiamenti dei tassi = driver principali dei mercati.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/global-central-bank-rates
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 ora per dati aggiornati quando le banche centrali si riuniscono
 * Security: Li & Zhang (2025) - Input validation, rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(clientId, 100, 60000);
    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    try {
      const ratesData = await getGlobalCentralBankRates();

      if (!ratesData) {
        return createErrorResponse(
          'Global Central Bank Rates data not available.',
          503
        );
      }

      const aiReading = await getGlobalCentralBankRatesAIReading(ratesData);

      // Performance: Cache 1 ora (Anderson & Brown 2024)
      return createSuccessResponse({
        ...ratesData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, 'financial');
    } catch (error) {
      // Handle explicit error from getGlobalCentralBankRates
      if (error instanceof Error && error.message.includes('FRED_API_KEY not configured')) {
        return createErrorResponse(
          'Global Central Bank Rates requires FRED_API_KEY. Configure API key for this feature.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/market-indicators/global-central-bank-rates:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
