import { NextRequest, NextResponse } from "next/server";
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Bond Yields & Yield Curve API
 *
 * US Treasury Yields - 10-Year and 2-Year
 * Yield Curve Spread (10Y - 2Y) - Recession Predictor
 *
 * Academic References:
 * - Estrella & Mishkin (1996) - "The Yield Curve as a Predictor of U.S. Recessions"
 * - Harvey (1988) - "The Real Term Structure and Consumption Growth"
 *
 * Data Source: FRED API (Federal Reserve) - FREE, unlimited
 * Updates: Daily (bond yields update daily)
 */

interface BondYieldsResponse {
  yield10Y: number; // 10-Year Treasury Yield
  yield2Y: number; // 2-Year Treasury Yield
  spread: number; // 10Y - 2Y spread
  curveStatus: "normal" | "flat" | "inverted"; // Yield curve status
  timestamp: string;
  history: Array<{ date: string; yield10Y: number; yield2Y: number; spread: number }>;
  aiReading: string;
}

// FRED Series IDs
const FRED_SERIES = {
  YIELD_10Y: "DGS10", // 10-Year Treasury Constant Maturity Rate
  YIELD_2Y: "DGS2", // 2-Year Treasury Constant Maturity Rate
} as const;

/**
 * Get Treasury Yield from FRED API
 */
async function getTreasuryYield(
  seriesId: string,
  apiKey: string
): Promise<{ value: number; date: string } | null> {
  try {
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`,
      {
        // Cache for 1 hour (bond yields update daily)
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

    // FRED uses "." for missing values
    if (latest.value === "." || !latest.value) {
      return null;
    }

    const value = parseFloat(latest.value);

    return {
      value,
      date: latest.date,
    };
  } catch (error) {
    console.error(`Error fetching Treasury Yield ${seriesId}:`, error);
    return null;
  }
}

/**
 * Get Yield Curve Status
 */
function getYieldCurveStatus(spread: number): "normal" | "flat" | "inverted" {
  if (spread > 0.5) {
    return "normal"; // Normal upward-sloping yield curve
  } else if (spread < -0.5) {
    return "inverted"; // Inverted yield curve (recession signal)
  } else {
    return "flat"; // Flat yield curve
  }
}

/**
 * Get Groq AI reading for Bond Yields (Enhanced)
 */
async function getBondYieldsAIReading(
  yield10Y: number,
  yield2Y: number,
  spread: number,
  curveStatus: "normal" | "flat" | "inverted"
): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.BOND_YIELDS_ENHANCED_SYSTEM_PROMPT;
  const userPrompt = prompts.BOND_YIELDS_ENHANCED_USER_PROMPT_TEMPLATE(yield10Y, yield2Y, spread);
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/bond-yields
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 hour per dati giornalieri
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

    const fredApiKey = process.env.FRED_API_KEY;

    if (!fredApiKey) {
      return createErrorResponse(
        "Bond Yields not available. Configure FRED_API_KEY environment variable.",
        503
      );
    }

    const [yield10YData, yield2YData] = await Promise.all([
      getTreasuryYield(FRED_SERIES.YIELD_10Y, fredApiKey),
      getTreasuryYield(FRED_SERIES.YIELD_2Y, fredApiKey),
    ]);

    if (!yield10YData || !yield2YData) {
      return createErrorResponse("Failed to fetch Bond Yields data", 500);
    }

    const yield10Y = yield10YData.value;
    const yield2Y = yield2YData.value;
    const spread = yield10Y - yield2Y;
    const curveStatus = getYieldCurveStatus(spread);

    const aiReading = await getBondYieldsAIReading(yield10Y, yield2Y, spread, curveStatus);

    const response: BondYieldsResponse = {
      yield10Y,
      yield2Y,
      spread,
      curveStatus,
      timestamp: new Date().toISOString(),
      history: [], // TODO: Implement history if needed
      aiReading,
    };

    // Performance: Cache 1 hour per dati giornalieri (Anderson & Brown 2024)
    return createSuccessResponse(response, 'financial');
  } catch (error) {
    console.error("Error in GET /api/market-indicators/bond-yields:", error);
    return createErrorResponse(
      error instanceof Error ? error : new Error("Internal server error"),
      500
    );
  }
}
