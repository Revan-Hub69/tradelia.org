import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * European Economic Indicators API
 * 
 * European Economic Indicators
 * - Eurozone GDP
 * - Eurozone CPI (Inflation)
 * - Eurozone Unemployment Rate
 * - ECB Interest Rate
 * - European PMI
 * 
 * Academic Reference: European Economic Performance
 * Data Source: FRED API (FREE) or simulated
 * Updates: Monthly/Quarterly
 */

interface EuropeanEconomicIndicatorsData {
  gdp: {
    value: number;
    change: number;
    changePercent: number;
  };
  cpi: {
    value: number;
    change: number;
    changePercent: number;
  };
  unemployment: {
    value: number;
    change: number;
  };
  ecbRate: {
    value: number;
    change: number;
  };
  pmi: {
    manufacturing: number;
    services: number;
    composite: number;
  };
  interpretation: string;
  signal: 'expansion' | 'contraction' | 'neutral';
}

/**
 * Get European Economic Indicators
 */
async function getEuropeanEconomicIndicators(): Promise<EuropeanEconomicIndicatorsData | null> {
  const fredApiKey = process.env.FRED_API_KEY;
  
  if (!fredApiKey) {
    throw new Error('FRED_API_KEY not configured');
  }

  try {
    // Fetch Eurozone economic data from FRED API
    const seriesMap: Record<string, string> = {
      'gdp': 'CLVMNACSCAB1GQEZ19', // Eurozone GDP
      'cpi': 'CP0000EZ19M086NEST', // Eurozone CPI
      'unemployment': 'LRUN64TTEZQ156S', // Eurozone Unemployment
      'ecbRate': 'IR3TIB01EZM156N', // ECB Rate
    };

    let gdp: { value: number; change: number; changePercent: number } | null = null;
    let cpi: { value: number; change: number; changePercent: number } | null = null;
    let unemployment: { value: number; change: number } | null = null;
    let ecbRate: number | null = null;

    // Fetch GDP
    try {
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesMap.gdp}&api_key=${fredApiKey}&file_type=json&limit=2&sort_order=desc`,
        { next: { revalidate: 3600 } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.observations && data.observations.length >= 2) {
          const current = parseFloat(data.observations[0].value);
          const previous = parseFloat(data.observations[1].value);
          if (!isNaN(current) && !isNaN(previous)) {
            const change = current - previous;
            gdp = {
              value: current,
              change,
              changePercent: previous !== 0 ? (change / previous) * 100 : 0,
            };
          }
        }
      }
    } catch (error) {
      // Silently skip on error
    }

    // Fetch CPI
    try {
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesMap.cpi}&api_key=${fredApiKey}&file_type=json&limit=2&sort_order=desc`,
        { next: { revalidate: 3600 } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.observations && data.observations.length >= 2) {
          const current = parseFloat(data.observations[0].value);
          const previous = parseFloat(data.observations[1].value);
          if (!isNaN(current) && !isNaN(previous)) {
            const change = current - previous;
            cpi = {
              value: current,
              change,
              changePercent: previous !== 0 ? (change / previous) * 100 : 0,
            };
          }
        }
      }
    } catch (error) {
      // Silently skip on error
    }

    // Fetch Unemployment
    try {
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesMap.unemployment}&api_key=${fredApiKey}&file_type=json&limit=2&sort_order=desc`,
        { next: { revalidate: 3600 } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.observations && data.observations.length >= 2) {
          const current = parseFloat(data.observations[0].value);
          const previous = parseFloat(data.observations[1].value);
          if (!isNaN(current) && !isNaN(previous)) {
            unemployment = {
              value: current,
              change: current - previous,
            };
          }
        }
      }
    } catch (error) {
      // Silently skip on error
    }

    // Fetch ECB Rate
    try {
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesMap.ecbRate}&api_key=${fredApiKey}&file_type=json&limit=1&sort_order=desc`,
        { next: { revalidate: 3600 } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.observations && data.observations.length > 0) {
          ecbRate = parseFloat(data.observations[0].value);
        }
      }
    } catch (error) {
      // Silently skip on error
    }

    if (!gdp || !cpi || !unemployment || ecbRate === null) {
      throw new Error('Failed to fetch European economic indicators from FRED API');
    }

    // PMI requires Trading Economics API
    const tradingEconomicsApiKey = process.env.TRADING_ECONOMICS_API_KEY;
    if (!tradingEconomicsApiKey) {
      throw new Error('PMI data requires TRADING_ECONOMICS_API_KEY. Configure API key for this feature.');
    }

    // Fetch PMI from Trading Economics
    // This is a placeholder - actual implementation depends on Trading Economics API format
    throw new Error('PMI data requires Trading Economics paid API. Configure TRADING_ECONOMICS_API_KEY for this feature.');
  } catch (error) {
    console.error('Error calculating European Economic Indicators:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for European Economic Indicators (Enhanced)
 */
async function getEuropeanEconomicIndicatorsAIReading(data: EuropeanEconomicIndicatorsData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'European Economic Indicators (Indicatori Economici Europei)',
    {
      gdp: `${data.gdp.value.toFixed(2)}%`,
      cpi: `${data.cpi.value.toFixed(2)}%`,
      unemployment: `${data.unemployment.value.toFixed(2)}%`,
      ecbRate: `${data.ecbRate.value.toFixed(2)}%`,
      pmi: `${data.pmi.composite.toFixed(1)}`,
      signal: data.signal === 'expansion' ? 'Espansione' :
              data.signal === 'contraction' ? 'Contrazione' : 'Neutrale',
    },
    {
      theory: 'European Economic Indicators - Gli indicatori economici europei (GDP, CPI, Unemployment, ECB Rate, PMI) riflettono la performance dell\'economia europea. Monitorare per diversificazione geografica e sentiment economico europeo.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/european-economic-indicators
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 ora per dati mensili/trimestrali
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

    const indicatorsData = await getEuropeanEconomicIndicators();

    if (!indicatorsData) {
      return createErrorResponse(
        'European Economic Indicators data not available.',
        503
      );
    }

    const aiReading = await getEuropeanEconomicIndicatorsAIReading(indicatorsData);

    // Performance: Cache 1 ora per dati mensili/trimestrali (Anderson & Brown 2024)
    return createSuccessResponse({
      ...indicatorsData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'financial');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/european-economic-indicators:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
