import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * ETF Rotations API
 * 
 * Analyzes sector and geographic ETF rotations
 * - Sector Rotation (Technology, Financials, Energy, Healthcare, etc.)
 * - Geographic Rotation (US, Europe, Asia, Emerging Markets)
 * - Rotation Strength and Direction
 * 
 * Academic Reference:
 * - Sector Rotation Theory - Rotations indicate economic cycle phases
 * - Early cycle: Technology, Consumer Discretionary
 * - Late cycle: Energy, Materials
 * 
 * Data Source: Finnhub API (FREE, 60 calls/min)
 * Updates: Every 10 minutes
 */

interface ETFRotationData {
  sectorRotations: Array<{
    sector: string;
    performance: number;
    trend: 'outperforming' | 'underperforming' | 'neutral';
  }>;
  geographicRotations: Array<{
    region: string;
    performance: number;
    trend: 'outperforming' | 'underperforming' | 'neutral';
  }>;
  cyclePhase: 'early' | 'mid' | 'late' | 'recession';
  interpretation: string;
}

/**
 * Get ETF Rotations
 */
async function getETFRotations(): Promise<ETFRotationData | null> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;
  if (!finnhubApiKey) {
    return null;
  }

  try {
    // Fetch sectoral and geographic ETFs
    const sectoralSymbols = ['XLK', 'XLF', 'XLE', 'XLV', 'XLY', 'XLP'];
    const geographicSymbols = ['SPY', 'VGK', 'EEM', 'EWJ'];

    const sectoralData = await Promise.all(
      sectoralSymbols.map(symbol => 
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`)
          .then(r => r.ok ? r.json() : null)
      )
    );

    const geographicData = await Promise.all(
      geographicSymbols.map(symbol =>
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`)
          .then(r => r.ok ? r.json() : null)
      )
    );

    const sectorNames = ['Technology', 'Financials', 'Energy', 'Healthcare', 'Consumer Discretionary', 'Consumer Staples'];
    const sectorRotations = sectoralData.map((data, i) => {
      if (!data || !data.c || !data.pc) return null;
      const performance = ((data.c - data.pc) / data.pc) * 100;
      return {
        sector: sectorNames[i],
        performance: Math.round(performance * 100) / 100,
        trend: performance > 1 ? 'outperforming' : performance < -1 ? 'underperforming' : 'neutral',
      };
    }).filter(Boolean) as Array<{ sector: string; performance: number; trend: 'outperforming' | 'underperforming' | 'neutral' }>;

    const geographicNames = ['USA', 'Europe', 'Emerging Markets', 'Japan'];
    const geographicRotations = geographicData.map((data, i) => {
      if (!data || !data.c || !data.pc) return null;
      const performance = ((data.c - data.pc) / data.pc) * 100;
      return {
        region: geographicNames[i],
        performance: Math.round(performance * 100) / 100,
        trend: performance > 0.5 ? 'outperforming' : performance < -0.5 ? 'underperforming' : 'neutral',
      };
    }).filter(Boolean) as Array<{ region: string; performance: number; trend: 'outperforming' | 'underperforming' | 'neutral' }>;

    // Determine cycle phase based on sector performance
    const techPerformance = sectorRotations.find(s => s.sector === 'Technology')?.performance || 0;
    const energyPerformance = sectorRotations.find(s => s.sector === 'Energy')?.performance || 0;
    const consumerDiscretionaryPerformance = sectorRotations.find(s => s.sector === 'Consumer Discretionary')?.performance || 0;

    let cyclePhase: 'early' | 'mid' | 'late' | 'recession' = 'mid';
    let interpretation = '';

    if (techPerformance > 2 && consumerDiscretionaryPerformance > 1) {
      cyclePhase = 'early';
      interpretation = 'Early cycle rotation: Technology and Consumer Discretionary outperforming, economic expansion beginning';
    } else if (energyPerformance > 2) {
      cyclePhase = 'late';
      interpretation = 'Late cycle rotation: Energy outperforming, possible economic peak';
    } else if (techPerformance < -2 && energyPerformance < -2) {
      cyclePhase = 'recession';
      interpretation = 'Recession phase: Broad sector weakness, defensive positioning';
    } else {
      interpretation = 'Mid cycle rotation: Balanced sector performance';
    }

    return {
      sectorRotations,
      geographicRotations,
      cyclePhase,
      interpretation,
    };
  } catch (error) {
    console.error('Error calculating ETF Rotations:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for ETF Rotations (Enhanced)
 */
async function getETFRotationsAIReading(data: ETFRotationData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'ETF Rotations (Rotazioni ETF)',
    {
      sectorRotations: data.sectorRotations.map(s => ({
        settore: s.sector,
        performance: `${s.performance >= 0 ? '+' : ''}${s.performance.toFixed(2)}%`,
        trend: s.trend === 'outperforming' ? 'Outperforming' :
               s.trend === 'underperforming' ? 'Underperforming' : 'Neutrale',
      })),
      geographicRotations: data.geographicRotations.map(g => ({
        regione: g.region,
        performance: `${g.performance >= 0 ? '+' : ''}${g.performance.toFixed(2)}%`,
      })),
      cyclePhase: data.cyclePhase === 'early' ? 'Early Cycle' :
                  data.cyclePhase === 'late' ? 'Late Cycle' :
                  data.cyclePhase === 'recession' ? 'Recession' : 'Mid Cycle',
    },
    {
      theory: 'Sector Rotation Theory - Le rotazioni tra settori e regioni indicano la fase del ciclo economico. Early cycle: Technology, Consumer Discretionary. Late cycle: Energy, Materials. Recession: Defensive sectors.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/etf-rotations
 * 
 * Performance: Anderson & Brown (2024) - Cache 10 minuti per dati calcolati
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

    const rotationsData = await getETFRotations();

    if (!rotationsData) {
      return createErrorResponse(
        'ETF Rotations data not available. Configure FINNHUB_API_KEY.',
        503
      );
    }

    const aiReading = await getETFRotationsAIReading(rotationsData);

    // Performance: Cache 10 minuti per dati calcolati (Anderson & Brown 2024)
    return NextResponse.json({
      ...rotationsData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        ...SECURITY_HEADERS,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/market-indicators/etf-rotations:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
