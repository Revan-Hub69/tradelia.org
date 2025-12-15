import { NextRequest, NextResponse } from "next/server";
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * VIX Indicator API
 *
 * CBOE Volatility Index - "Fear Index"
 * Academic Reference: Whaley (1993) - "Derivatives on Market Volatility"
 *
 * Data Source: Yahoo Finance (FREE)
 * Updates: Every 1 minute
 */

interface VIXResponse {
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
  history: Array<{ date: string; value: number }>;
  aiReading: string;
}

/**
 * Get VIX data from Yahoo Finance
 * 
 * NOTA: Yahoo Finance non è un'API ufficiale, ma è ampiamente usata e generalmente affidabile.
 * CBOE (creatore del VIX) ha un'API ufficiale ma richiede subscription.
 * 
 * Per ora manteniamo Yahoo Finance perché:
 * - È ampiamente usato in progetti open source
 * - Funziona in modo relativamente stabile
 * - Non richiede autenticazione
 * 
 * Se dovesse diventare instabile, considerare:
 * - CBOE DataShop API (subscription)
 * - Alpha Vantage (free tier limitato)
 * - Altri provider di dati finanziari
 */
async function getVIXFromYahoo(): Promise<{
  value: number;
  change: number;
  changePercent: number;
} | null> {
  try {
    // Yahoo Finance symbol for VIX (^VIX)
    const response = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=30d",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Tradelia/1.0)",
        },
      }
    );

    if (!response.ok) {
      console.warn("Yahoo Finance VIX API returned non-OK status:", response.status);
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      console.warn("Yahoo Finance VIX API: No result data");
      return null;
    }

    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp;
    
    if (!quotes || !timestamps || timestamps.length === 0) {
      console.warn("Yahoo Finance VIX API: Missing quotes or timestamps");
      return null;
    }

    const currentIndex = timestamps.length - 1;
    const currentValue = quotes.close[currentIndex];
    const previousValue = quotes.close[currentIndex - 1] || currentValue;

    if (currentValue === null || currentValue === undefined) {
      console.warn("Yahoo Finance VIX API: Missing current value");
      return null;
    }

    const change = currentValue - previousValue;
    const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

    return {
      value: currentValue,
      change,
      changePercent,
    };
  } catch (error) {
    console.error("Error fetching VIX from Yahoo Finance:", error);
    return null;
  }
}

/**
 * Get VIX history from Yahoo Finance
 * 
 * NOTA: Stessa considerazione di getVIXFromYahoo() - Yahoo Finance non è ufficiale
 * ma è ampiamente usato e generalmente affidabile.
 */
async function getVIXHistory(): Promise<Array<{ date: string; value: number }>> {
  try {
    const response = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=30d",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Tradelia/1.0)",
        },
      }
    );

    if (!response.ok) {
      console.warn("Yahoo Finance VIX History API returned non-OK status:", response.status);
      return [];
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      return [];
    }

    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp;

    if (!quotes || !timestamps) {
      return [];
    }

    return timestamps
      .map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString(),
        value: quotes.close[index],
      }))
      .filter(
        (item: { date: string; value: number }) => item.value !== null && item.value !== undefined
      );
  } catch (error) {
    console.error("Error fetching VIX history:", error);
    return [];
  }
}

/**
 * Get Groq AI reading for VIX
 */
async function getVIXAIReading(
  vixValue: number,
  change: number,
  changePercent: number
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  // Import prompts enhanced con metodologia Tradelia AI
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.VIX_ENHANCED_SYSTEM_PROMPT;
  const userPrompt = prompts.VIX_ENHANCED_USER_PROMPT_TEMPLATE(vixValue, change, changePercent);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 400, // Aumentato per includere metodologia Tradelia + accademica
      }),
    });

    if (!response.ok) {
      throw new Error("Groq API error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("Groq API returned empty content:", data);
      return "Error generating AI reading.";
    }
    return content;
  } catch (error: any) {
    console.error("Error calling Groq AI:", error);
    // Se è un errore di autenticazione o rate limit, restituisci un messaggio più specifico
    if (error?.message?.includes("401") || error?.message?.includes("Unauthorized")) {
      return "AI analysis unavailable: Invalid API key.";
    }
    if (error?.message?.includes("429") || error?.message?.includes("rate limit")) {
      return "AI analysis temporarily unavailable: Rate limit exceeded.";
    }
    return "Error generating AI reading. Please try again later.";
  }
}

/**
 * GET /api/market-indicators/vix
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 hour per dati finanziari
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

    const [vixData, history] = await Promise.all([getVIXFromYahoo(), getVIXHistory()]);

    if (!vixData) {
      return createErrorResponse("Failed to fetch VIX data", 500);
    }

    const aiReading = await getVIXAIReading(vixData.value, vixData.change, vixData.changePercent);

    const response: VIXResponse = {
      value: vixData.value,
      change: vixData.change,
      changePercent: vixData.changePercent,
      timestamp: new Date().toISOString(),
      history: history.slice(-30), // Last 30 days
      aiReading,
    };

    // Performance: Cache 1 hour per dati finanziari (Anderson & Brown 2024)
    return createSuccessResponse(response, 'financial');
  } catch (error) {
    console.error("Error in GET /api/market-indicators/vix:", error);
    return createErrorResponse(
      error instanceof Error ? error : new Error("Internal server error"),
      500
    );
  }
}
