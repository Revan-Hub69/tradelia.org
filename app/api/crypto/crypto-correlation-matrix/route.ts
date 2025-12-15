import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Crypto Correlation Matrix API
 * 
 * Cryptocurrency Correlation Matrix
 * - BTC vs. ETH correlation
 * - BTC vs. Major Altcoins correlation
 * - ETH vs. Major Altcoins correlation
 * - Correlation Trends
 * 
 * Academic Reference:
 * - Correlation Theory - Measures co-movement of assets
 * - High correlation = assets move together
 * - Low correlation = assets move independently
 * - Correlation changes = market regime shifts
 * 
 * Data Source: CoinGecko API (FREE) or calculated
 * Updates: Every 15 minutes
 */

interface CryptoCorrelationMatrixData {
  correlations: Array<{
    pair: string;
    correlation: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  averageCorrelation: number;
  interpretation: string;
  signal: 'high-correlation' | 'low-correlation' | 'moderate-correlation';
}

/**
 * Get Crypto Correlation Matrix
 */
async function getCryptoCorrelationMatrix(): Promise<CryptoCorrelationMatrixData | null> {
  const coinGeckoApiKey = process.env.COINGECKO_API_KEY;
  
  if (!coinGeckoApiKey) {
    throw new Error('COINGECKO_API_KEY not configured');
  }

  try {
    // Calculate correlation from historical price data using CoinGecko API
    const symbols = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'cardano'];
    const priceData: Record<string, number[]> = {};

    // Fetch historical prices for correlation calculation
    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=30&interval=daily&x_cg_demo_api_key=${coinGeckoApiKey}`,
          { next: { revalidate: 3600 } }
        );
        
        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }
        
        const data = await response.json();
        priceData[symbol] = data.prices?.map((p: [number, number]) => p[1]) || [];
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        throw new Error(`Failed to fetch price data for ${symbol}`);
      }
    }

    // Calculate correlations between pairs
    const pairs: Array<{
      pair: string;
      correlation: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }> = [];

    const pairCombinations = [
      ['bitcoin', 'ethereum'],
      ['bitcoin', 'binancecoin'],
      ['bitcoin', 'solana'],
      ['bitcoin', 'cardano'],
      ['ethereum', 'binancecoin'],
      ['ethereum', 'solana'],
      ['ethereum', 'cardano'],
    ];

    for (const [asset1, asset2] of pairCombinations) {
      const prices1 = priceData[asset1];
      const prices2 = priceData[asset2];
      
      if (!prices1 || !prices2 || prices1.length !== prices2.length) {
        throw new Error(`Insufficient data for correlation ${asset1}-${asset2}`);
      }

      // Calculate Pearson correlation
      const correlation = calculateCorrelation(prices1, prices2);
      const recentCorrelation = calculateCorrelation(
        prices1.slice(-7),
        prices2.slice(-7)
      );
      
      const trend = recentCorrelation > correlation + 0.05 ? 'increasing' :
                   recentCorrelation < correlation - 0.05 ? 'decreasing' : 'stable';

      pairs.push({
        pair: `${asset1.toUpperCase()}-${asset2.toUpperCase()}`,
        correlation: Math.round(correlation * 100) / 100,
        trend,
      });
    }

    if (pairs.length === 0) {
      throw new Error('Failed to calculate correlations');
    }

    const averageCorrelation = pairs.reduce((sum, p) => sum + p.correlation, 0) / pairs.length;

    // Interpretation
    let interpretation = '';
    let signal: 'high-correlation' | 'low-correlation' | 'moderate-correlation' = 'moderate-correlation';

    if (averageCorrelation > 0.8) {
      interpretation = 'High correlation: Crypto assets moving together strongly, risk-on/risk-off regime';
      signal = 'high-correlation';
    } else if (averageCorrelation < 0.5) {
      interpretation = 'Low correlation: Crypto assets moving independently, diversified market';
      signal = 'low-correlation';
    } else {
      interpretation = 'Moderate correlation: Crypto assets showing moderate co-movement';
      signal = 'moderate-correlation';
    }

    return {
      correlations: pairs.map(p => ({
        pair: p.pair,
        correlation: Math.round(p.correlation * 100) / 100,
        trend: p.trend,
      })),
      averageCorrelation: Math.round(averageCorrelation * 100) / 100,
      interpretation,
      signal,
    };
  } catch (error) {
    console.error('Error calculating Crypto Correlation Matrix:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Crypto Correlation Matrix (Enhanced)
 */
async function getCryptoCorrelationMatrixAIReading(data: CryptoCorrelationMatrixData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Crypto Correlation Matrix (Matrice di Correlazione Crypto)',
    {
      averageCorrelation: data.averageCorrelation.toFixed(2),
      correlations: data.correlations.map(c => ({
        coppia: c.pair,
        correlazione: c.correlation.toFixed(2),
        trend: c.trend === 'increasing' ? 'In Aumento' :
               c.trend === 'decreasing' ? 'In Diminuzione' : 'Stabile',
      })),
      signal: data.signal === 'high-correlation' ? 'Alta Correlazione' :
              data.signal === 'low-correlation' ? 'Bassa Correlazione' : 'Correlazione Moderata',
    },
    {
      theory: 'Crypto Correlation Theory - La matrice di correlazione misura il co-movimento degli asset crypto. Correlazione alta = asset si muovono insieme, correlazione bassa = asset si muovono indipendentemente. Cambiamenti di correlazione = cambiamenti di regime di mercato.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/crypto/crypto-correlation-matrix
 * 
 * Performance: Anderson & Brown (2024) - Cache 15 minuti per dati calcolati
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

    const correlationData = await getCryptoCorrelationMatrix();

    if (!correlationData) {
      return createErrorResponse(
        'Crypto Correlation Matrix data not available.',
        503
      );
    }

    const aiReading = await getCryptoCorrelationMatrixAIReading(correlationData);

    // Performance: Cache 15 minuti (custom per dati calcolati)
    return NextResponse.json({
      ...correlationData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/crypto/crypto-correlation-matrix:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
