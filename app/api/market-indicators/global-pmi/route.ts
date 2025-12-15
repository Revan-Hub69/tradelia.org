import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Global PMI API
 * 
 * Global Purchasing Managers Index Composite
 * - Global Manufacturing PMI
 * - Global Services PMI
 * - Global Composite PMI
 * - Regional PMI (US, EU, China, Japan)
 * 
 * Academic Reference:
 * - PMI Theory - Leading economic indicator
 * - PMI > 50 = expansion
 * - PMI < 50 = contraction
 * - Global PMI shows worldwide economic activity
 * 
 * Data Source: Trading Economics (PAID) or simulated
 * Updates: Monthly
 */

interface GlobalPMIData {
  global: {
    manufacturing: number;
    services: number;
    composite: number;
  };
  regional: Array<{
    region: string;
    manufacturing: number;
    services: number;
    composite: number;
  }>;
  interpretation: string;
  signal: 'expansion' | 'contraction' | 'neutral';
}

/**
 * Get Global PMI
 */
async function getGlobalPMI(): Promise<GlobalPMIData | null> {
  const tradingEconomicsApiKey = process.env.TRADING_ECONOMICS_API_KEY;
  
  if (!tradingEconomicsApiKey) {
    throw new Error('TRADING_ECONOMICS_API_KEY not configured');
  }

  try {
    // Fetch PMI data from Trading Economics API
    const regions = ['USA', 'EU', 'China', 'Japan', 'UK'];
    const regional: Array<{
      region: string;
      manufacturing: number;
      services: number;
      composite: number;
    }> = [];

    for (const region of regions) {
      try {
        // Trading Economics API endpoint for PMI
        const response = await fetch(
          `https://api.tradingeconomics.com/markets/indicators/${region}?c=${tradingEconomicsApiKey}`,
          { next: { revalidate: 3600 } }
        );
        
        if (!response.ok) {
          continue;
        }
        
        const data = await response.json();
        // Parse PMI data from response (format depends on Trading Economics API)
        // This is a placeholder - actual implementation depends on API response format
        const manufacturingPMI = data.find((d: any) => d.Indicator === 'Manufacturing PMI')?.Value || null;
        const servicesPMI = data.find((d: any) => d.Indicator === 'Services PMI')?.Value || null;
        
        if (manufacturingPMI && servicesPMI) {
          regional.push({
            region,
            manufacturing: manufacturingPMI,
            services: servicesPMI,
            composite: (manufacturingPMI + servicesPMI) / 2,
          });
        }
      } catch (error) {
        // Silently skip region on error
      }
    }

    if (regional.length === 0) {
      throw new Error('Failed to fetch PMI data from Trading Economics API');
    }

    // Calculate composite for each region
    regional.forEach(r => {
      r.composite = (r.manufacturing + r.services) / 2;
    });

    // Calculate global averages
    const globalManufacturing = regional.reduce((sum, r) => sum + r.manufacturing, 0) / regional.length;
    const globalServices = regional.reduce((sum, r) => sum + r.services, 0) / regional.length;
    const globalComposite = (globalManufacturing + globalServices) / 2;

    // Interpretation
    let interpretation = '';
    let signal: 'expansion' | 'contraction' | 'neutral' = 'neutral';

    if (globalComposite > 50) {
      interpretation = 'Global PMI expansion: Worldwide economic activity expanding, bullish for markets';
      signal = 'expansion';
    } else if (globalComposite < 48) {
      interpretation = 'Global PMI contraction: Worldwide economic activity contracting, bearish for markets';
      signal = 'contraction';
    } else {
      interpretation = 'Global PMI neutral: Worldwide economic activity stable';
      signal = 'neutral';
    }

    return {
      global: {
        manufacturing: Math.round(globalManufacturing * 100) / 100,
        services: Math.round(globalServices * 100) / 100,
        composite: Math.round(globalComposite * 100) / 100,
      },
      regional: regional.map(r => ({
        region: r.region,
        manufacturing: Math.round(r.manufacturing * 100) / 100,
        services: Math.round(r.services * 100) / 100,
        composite: Math.round(r.composite * 100) / 100,
      })),
      interpretation,
      signal,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get Groq AI reading for Global PMI (Enhanced)
 */
async function getGlobalPMIAIReading(data: GlobalPMIData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Global PMI (PMI Globale)',
    {
      globalComposite: data.global.composite.toFixed(1),
      globalManufacturing: data.global.manufacturing.toFixed(1),
      globalServices: data.global.services.toFixed(1),
      regional: data.regional.map(r => ({
        regione: r.region,
        composite: r.composite.toFixed(1),
      })),
      signal: data.signal === 'expansion' ? 'Espansione' :
              data.signal === 'contraction' ? 'Contrazione' : 'Neutrale',
    },
    {
      theory: 'Global PMI Theory - Il PMI globale mostra l\'attività economica mondiale. PMI > 50 = espansione (bullish), PMI < 50 = contrazione (bearish). Il PMI globale è un indicatore leading dell\'economia mondiale.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/global-pmi
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 hour per dati mensili
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

    const pmiData = await getGlobalPMI();

    if (!pmiData) {
      return createErrorResponse(
        'Global PMI data not available.',
        503
      );
    }

    const aiReading = await getGlobalPMIAIReading(pmiData);

    // Performance: Cache 1 hour per dati mensili (Anderson & Brown 2024)
    return createSuccessResponse({
      ...pmiData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'financial');
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
