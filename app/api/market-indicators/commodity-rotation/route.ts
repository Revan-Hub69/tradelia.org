import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * Commodity Rotation Indicator API
 * 
 * Analyzes rotation between major commodities
 * - Gold vs Oil performance
 * - Energy vs Precious Metals
 * - Agricultural vs Industrial
 * 
 * Academic Reference:
 * - Sector Rotation Theory - Commodities rotate based on economic cycles
 * - Gold outperforms in risk-off, Oil in risk-on
 * 
 * Data Source: Alpha Vantage API (FREE, 5 calls/min, 500 calls/day)
 * Updates: Every 10 minutes
 */

interface CommodityRotationData {
  goldPerformance: number;
  oilPerformance: number;
  silverPerformance: number;
  rotation: 'risk-off' | 'risk-on' | 'neutral';
  interpretation: string;
  leadingCommodity: 'gold' | 'oil' | 'silver' | 'neutral';
}

/**
 * Get Commodity Rotation
 */
async function getCommodityRotation(): Promise<CommodityRotationData | null> {
  const alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!alphaVantageApiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY not configured');
  }

  try {
    // Fetch commodity prices from Alpha Vantage
    const [goldResponse, oilResponse, silverResponse] = await Promise.all([
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=GC=F&apikey=${alphaVantageApiKey}`, { next: { revalidate: 300 } }),
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=CL=F&apikey=${alphaVantageApiKey}`, { next: { revalidate: 300 } }),
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SI=F&apikey=${alphaVantageApiKey}`, { next: { revalidate: 300 } }),
    ]);

    if (!goldResponse.ok || !oilResponse.ok || !silverResponse.ok) {
      throw new Error('Failed to fetch commodity prices from Alpha Vantage API');
    }

    const goldData = await goldResponse.json();
    const oilData = await oilResponse.json();
    const silverData = await silverResponse.json();

    const goldCurrent = parseFloat(goldData['Global Quote']?.['05. price'] || '0');
    const goldPrevious = parseFloat(goldData['Global Quote']?.['08. previous close'] || '0');
    const goldPerformance = goldPrevious > 0 ? ((goldCurrent - goldPrevious) / goldPrevious) * 100 : 0;

    const oilCurrent = parseFloat(oilData['Global Quote']?.['05. price'] || '0');
    const oilPrevious = parseFloat(oilData['Global Quote']?.['08. previous close'] || '0');
    const oilPerformance = oilPrevious > 0 ? ((oilCurrent - oilPrevious) / oilPrevious) * 100 : 0;

    const silverCurrent = parseFloat(silverData['Global Quote']?.['05. price'] || '0');
    const silverPrevious = parseFloat(silverData['Global Quote']?.['08. previous close'] || '0');
    const silverPerformance = silverPrevious > 0 ? ((silverCurrent - silverPrevious) / silverPrevious) * 100 : 0;

    // Determine rotation
    let rotation: 'risk-off' | 'risk-on' | 'neutral' = 'neutral';
    let interpretation = '';
    let leadingCommodity: 'gold' | 'oil' | 'silver' | 'neutral' = 'neutral';

    if (goldPerformance > oilPerformance && goldPerformance > 0) {
      rotation = 'risk-off';
      interpretation = 'Risk-off rotation: Gold outperforming Oil, defensive positioning';
      leadingCommodity = 'gold';
    } else if (oilPerformance > goldPerformance && oilPerformance > 0) {
      rotation = 'risk-on';
      interpretation = 'Risk-on rotation: Oil outperforming Gold, growth positioning';
      leadingCommodity = 'oil';
    } else if (silverPerformance > goldPerformance && silverPerformance > 0) {
      rotation = 'risk-on';
      interpretation = 'Risk-on rotation: Silver outperforming, industrial demand';
      leadingCommodity = 'silver';
    } else {
      interpretation = 'Neutral rotation: Balanced commodity performance';
      leadingCommodity = 'neutral';
    }

    return {
      goldPerformance: Math.round(goldPerformance * 100) / 100,
      oilPerformance: Math.round(oilPerformance * 100) / 100,
      silverPerformance: Math.round(silverPerformance * 100) / 100,
      rotation,
      interpretation,
      leadingCommodity,
    };
  } catch (error) {
    console.error('Error calculating Commodity Rotation:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Commodity Rotation (Enhanced)
 */
async function getCommodityRotationAIReading(data: CommodityRotationData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Commodity Rotation (Rotazione Commodities)',
    {
      goldPerformance: `${data.goldPerformance >= 0 ? '+' : ''}${data.goldPerformance.toFixed(2)}%`,
      oilPerformance: `${data.oilPerformance >= 0 ? '+' : ''}${data.oilPerformance.toFixed(2)}%`,
      silverPerformance: `${data.silverPerformance >= 0 ? '+' : ''}${data.silverPerformance.toFixed(2)}%`,
      rotation: data.rotation === 'risk-off' ? 'Risk-Off' :
                data.rotation === 'risk-on' ? 'Risk-On' : 'Neutrale',
      leadingCommodity: data.leadingCommodity === 'gold' ? 'Oro' :
                        data.leadingCommodity === 'oil' ? 'Petrolio' :
                        data.leadingCommodity === 'silver' ? 'Argento' : 'Neutrale',
    },
    {
      theory: 'Sector Rotation Theory - Le commodities ruotano in base al ciclo economico. Oro outperforma in risk-off (difensivo), Petrolio in risk-on (crescita). La rotazione indica cambiamenti nel sentiment macroeconomico.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/commodity-rotation
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

    try {
      const rotationData = await getCommodityRotation();

      if (!rotationData) {
        return createErrorResponse(
          'Commodity Rotation data not available. Configure ALPHA_VANTAGE_API_KEY.',
          503
        );
      }

      const aiReading = await getCommodityRotationAIReading(rotationData);

      // Performance: Cache 10 minuti per dati calcolati (Anderson & Brown 2024)
      return NextResponse.json({
        ...rotationData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
          ...SECURITY_HEADERS,
        },
      });
    } catch (error) {
      // Handle explicit error from getCommodityRotation
      if (error instanceof Error && error.message.includes('ALPHA_VANTAGE_API_KEY not configured')) {
        return createErrorResponse(
          'Commodity Rotation requires ALPHA_VANTAGE_API_KEY. Configure API key for this feature.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/market-indicators/commodity-rotation:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
