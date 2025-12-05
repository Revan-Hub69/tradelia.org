import { NextRequest, NextResponse } from "next/server";

/**
 * Forex Major Pairs API
 *
 * Major Currency Pairs
 * - EUR/USD
 * - GBP/USD
 * - USD/JPY
 * - USD/CHF
 *
 * Academic Reference: Foreign Exchange Theory, Interest Rate Parity
 * Data Source: Finnhub API (FREE, 60 calls/min)
 * Updates: Every 5 minutes
 */

interface ForexPair {
  symbol: string;
  name: string;
  rate: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface ForexResponse {
  pairs: ForexPair[];
  timestamp: string;
  aiReading: string;
}

// Finnhub symbols for major forex pairs
const FOREX_PAIRS = {
  EURUSD: "OANDA:EUR_USD",
  GBPUSD: "OANDA:GBP_USD",
  USDJPY: "OANDA:USD_JPY",
  USDCHF: "OANDA:USD_CHF",
} as const;

/**
 * Get forex pair quote from Finnhub
 */
async function getForexPairQuote(
  symbol: string,
  apiKey: string
): Promise<{ rate: number; change: number; changePercent: number } | null> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/forex/rates?base=USD&token=${apiKey}`,
      {
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    // Finnhub returns rates in different format, we need to parse based on pair
    // For simplicity, using quote endpoint instead
    const quoteResponse = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!quoteResponse.ok) {
      return null;
    }

    const quoteData = await quoteResponse.json();

    if (!quoteData || quoteData.c === 0) {
      return null;
    }

    const currentRate = quoteData.c;
    const previousClose = quoteData.pc;
    const change = currentRate - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      rate: currentRate,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching forex pair ${symbol}:`, error);
    return null;
  }
}

/**
 * Get all forex pairs
 */
async function getAllForexPairs(): Promise<ForexPair[]> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!finnhubApiKey) {
    console.warn("FINNHUB_API_KEY not configured");
    return [];
  }

  const [eurusdData, gbpusdData, usdjpyData, usdchfData] = await Promise.all([
    getForexPairQuote(FOREX_PAIRS.EURUSD, finnhubApiKey),
    getForexPairQuote(FOREX_PAIRS.GBPUSD, finnhubApiKey),
    getForexPairQuote(FOREX_PAIRS.USDJPY, finnhubApiKey),
    getForexPairQuote(FOREX_PAIRS.USDCHF, finnhubApiKey),
  ]);

  const pairs: ForexPair[] = [];

  if (eurusdData) {
    pairs.push({
      symbol: "EURUSD",
      name: "EUR/USD",
      rate: eurusdData.rate,
      change: eurusdData.change,
      changePercent: eurusdData.changePercent,
      timestamp: new Date().toISOString(),
    });
  }

  if (gbpusdData) {
    pairs.push({
      symbol: "GBPUSD",
      name: "GBP/USD",
      rate: gbpusdData.rate,
      change: gbpusdData.change,
      changePercent: gbpusdData.changePercent,
      timestamp: new Date().toISOString(),
    });
  }

  if (usdjpyData) {
    pairs.push({
      symbol: "USDJPY",
      name: "USD/JPY",
      rate: usdjpyData.rate,
      change: usdjpyData.change,
      changePercent: usdjpyData.changePercent,
      timestamp: new Date().toISOString(),
    });
  }

  if (usdchfData) {
    pairs.push({
      symbol: "USDCHF",
      name: "USD/CHF",
      rate: usdchfData.rate,
      change: usdchfData.change,
      changePercent: usdchfData.changePercent,
      timestamp: new Date().toISOString(),
    });
  }

  return pairs;
}

/**
 * Get Groq AI reading for Forex
 */
async function getForexAIReading(pairs: ForexPair[]): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi del mercato forex.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessivamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Foreign Exchange Theory - Interest Rate Parity
- Currency pairs riflettono differenze di tassi di interesse e sentiment economico`;

  const pairsSummary = pairs
    .map(
      (pair) =>
        `${pair.name}: ${pair.rate.toFixed(4)} (${pair.change >= 0 ? "+" : ""}${pair.changePercent.toFixed(2)}%)`
    )
    .join(", ");

  const userPrompt = `Leggi i dati Forex Major Pairs forniti.

DATI FORNITI:
${pairsSummary}

RIFERIMENTO ACCADEMICO:
- Foreign Exchange Theory - Interest Rate Parity
- I tassi di cambio riflettono differenze di tassi di interesse, inflazione, e sentiment economico tra paesi

INTERPRETAZIONE ACCADEMICA:
- EUR/USD: Coppia più scambiata. Aumenti: debolezza USD o forza EUR. Diminuzioni: forza USD o debolezza EUR.
- GBP/USD: Sensibile a Brexit, politica UK. Aumenti: debolezza USD o forza GBP. Diminuzioni: forza USD o debolezza GBP.
- USD/JPY: Riflette sentiment risk-on/risk-off. Aumenti: risk-on, debolezza JPY. Diminuzioni: risk-off, forza JPY.
- USD/CHF: Considerato safe haven. Aumenti: debolezza CHF. Diminuzioni: fuga verso qualità (CHF).

Fornisci una lettura SEMPLICE (3-4 frasi) dello stato attuale delle coppie forex basata sui dati forniti.
MENTIONA i valori principali e le loro variazioni.
NO predizioni, NO consigli, solo lettura descrittiva.`;

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
        max_tokens: 250,
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
    if (error?.message?.includes("401") || error?.message?.includes("Unauthorized")) {
      return "AI analysis unavailable: Invalid API key.";
    }
    if (error?.message?.includes("429") || error?.message?.includes("rate limit")) {
      return "AI analysis temporarily unavailable: Rate limit exceeded.";
    }
    return "Error generating AI reading. Please try again later.";
  }
}

export async function GET(_request: NextRequest) {
  try {
    const pairs = await getAllForexPairs();

    if (pairs.length === 0) {
      return NextResponse.json(
        {
          error: "Forex pairs not available. Configure FINNHUB_API_KEY environment variable.",
          pairs: [],
        },
        { status: 503 }
      );
    }

    const aiReading = await getForexAIReading(pairs);

    const response: ForexResponse = {
      pairs,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/market-indicators/forex:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
