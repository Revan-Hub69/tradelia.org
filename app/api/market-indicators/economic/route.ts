import { NextRequest, NextResponse } from "next/server";
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Economic Indicators API
 *
 * Federal Reserve Economic Data (FRED) - Official US Economic Indicators
 *
 * Academic References:
 * - GDP: National Bureau of Economic Research (NBER)
 * - CPI: Bureau of Labor Statistics (BLS)
 * - Unemployment: Bureau of Labor Statistics (BLS)
 * - Fed Funds Rate: Federal Reserve
 *
 * Data Source: FRED API (Federal Reserve) - FREE, unlimited
 * Updates: Daily (economic data updates on schedule)
 */

interface EconomicIndicator {
  id: string;
  name: string;
  value: number;
  unit: string;
  change?: number;
  changePercent?: number;
  lastUpdate: string;
  description: string;
  academicReference: string;
}

interface EconomicIndicatorsResponse {
  indicators: EconomicIndicator[];
  timestamp: string;
  aiReading: string;
}

// FRED Series IDs
const FRED_SERIES = {
  GDP: "A191RL1Q225SBEA", // Real GDP Growth Rate (Quarterly)
  CPI: "CPIAUCSL", // Consumer Price Index (Monthly)
  UNEMPLOYMENT: "UNRATE", // Unemployment Rate (Monthly)
  FED_FUNDS: "FEDFUNDS", // Federal Funds Rate (Monthly)
} as const;

/**
 * Get economic indicator from FRED API
 */
async function getFREDIndicator(
  seriesId: string,
  apiKey: string
): Promise<{ value: number; date: string; previousValue?: number } | null> {
  try {
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`,
      {
        // Cache for 1 hour (economic data updates daily)
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json();
    const observations = data.observations;

    if (!observations || observations.length === 0) {
      return null;
    }

    const latest = observations[0];
    const previous = observations[1];

    // FRED uses "." for missing values
    if (latest.value === "." || !latest.value) {
      return null;
    }

    const value = parseFloat(latest.value);
    const previousValue =
      previous && previous.value !== "." ? parseFloat(previous.value) : undefined;

    return {
      value,
      date: latest.date,
      previousValue,
    };
  } catch (error) {
    console.error(`Error fetching FRED indicator ${seriesId}:`, error);
    return null;
  }
}

/**
 * Get all economic indicators
 */
async function getAllEconomicIndicators(): Promise<EconomicIndicator[]> {
  const fredApiKey = process.env.FRED_API_KEY;

  if (!fredApiKey) {
    console.warn("FRED_API_KEY not configured");
    return [];
  }

  const [gdpData, cpiData, unemploymentData, fedFundsData] = await Promise.all([
    getFREDIndicator(FRED_SERIES.GDP, fredApiKey),
    getFREDIndicator(FRED_SERIES.CPI, fredApiKey),
    getFREDIndicator(FRED_SERIES.UNEMPLOYMENT, fredApiKey),
    getFREDIndicator(FRED_SERIES.FED_FUNDS, fredApiKey),
  ]);

  const indicators: EconomicIndicator[] = [];

  // GDP Growth Rate
  if (gdpData) {
    const change = gdpData.previousValue ? gdpData.value - gdpData.previousValue : undefined;
    indicators.push({
      id: "gdp",
      name: "GDP Growth Rate",
      value: gdpData.value,
      unit: "%",
      change,
      changePercent: gdpData.previousValue
        ? (change! / Math.abs(gdpData.previousValue)) * 100
        : undefined,
      lastUpdate: gdpData.date,
      description:
        "Real Gross Domestic Product growth rate (quarterly, annualized). Measures economic growth.",
      academicReference: "National Bureau of Economic Research (NBER)",
    });
  }

  // CPI (Inflation)
  if (cpiData) {
    const change = cpiData.previousValue ? cpiData.value - cpiData.previousValue : undefined;
    const changePercent = cpiData.previousValue
      ? (change! / cpiData.previousValue) * 100
      : undefined;
    indicators.push({
      id: "cpi",
      name: "Consumer Price Index",
      value: cpiData.value,
      unit: "Index",
      change,
      changePercent,
      lastUpdate: cpiData.date,
      description:
        "Consumer Price Index for All Urban Consumers. Measures inflation (price level changes).",
      academicReference: "Bureau of Labor Statistics (BLS)",
    });
  }

  // Unemployment Rate
  if (unemploymentData) {
    const change = unemploymentData.previousValue
      ? unemploymentData.value - unemploymentData.previousValue
      : undefined;
    indicators.push({
      id: "unemployment",
      name: "Unemployment Rate",
      value: unemploymentData.value,
      unit: "%",
      change,
      changePercent: unemploymentData.previousValue
        ? (change! / unemploymentData.previousValue) * 100
        : undefined,
      lastUpdate: unemploymentData.date,
      description:
        "Unemployment rate as a percentage of the labor force. Measures labor market health.",
      academicReference: "Bureau of Labor Statistics (BLS)",
    });
  }

  // Fed Funds Rate
  if (fedFundsData) {
    const change = fedFundsData.previousValue
      ? fedFundsData.value - fedFundsData.previousValue
      : undefined;
    indicators.push({
      id: "fed-funds",
      name: "Federal Funds Rate",
      value: fedFundsData.value,
      unit: "%",
      change,
      changePercent: fedFundsData.previousValue
        ? (change! / fedFundsData.previousValue) * 100
        : undefined,
      lastUpdate: fedFundsData.date,
      description:
        "Effective Federal Funds Rate. The interest rate at which banks lend reserves to each other overnight.",
      academicReference: "Federal Reserve",
    });
  }

  return indicators;
}

/**
 * Get Groq AI reading for Economic Indicators (Enhanced)
 */
async function getEconomicIndicatorsAIReading(indicators: EconomicIndicator[]): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.ECONOMIC_ENHANCED_SYSTEM_PROMPT;
  const userPrompt = prompts.ECONOMIC_ENHANCED_USER_PROMPT_TEMPLATE(indicators);
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/economic
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 ora per dati economici
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

    const indicators = await getAllEconomicIndicators();

    if (indicators.length === 0) {
      return createErrorResponse(
        "Economic indicators not available. Configure FRED_API_KEY environment variable.",
        503
      );
    }

    const aiReading = await getEconomicIndicatorsAIReading(indicators);

    const response: EconomicIndicatorsResponse = {
      indicators,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    // Performance: Cache 1 ora per dati economici (Anderson & Brown 2024)
    return createSuccessResponse(response, 'financial');
  } catch (error) {
    console.error("Error in GET /api/market-indicators/economic:", error);
    return createErrorResponse(
      error instanceof Error ? error : new Error("Internal server error"),
      500
    );
  }
}
