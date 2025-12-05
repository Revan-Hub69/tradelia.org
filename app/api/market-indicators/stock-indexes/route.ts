import { NextRequest, NextResponse } from "next/server";

/**
 * Stock Market Indexes API
 *
 * Major US Stock Market Indexes
 * - S&P 500 (^GSPC)
 * - Dow Jones Industrial Average (^DJI)
 * - NASDAQ Composite (^IXIC)
 *
 * Academic Reference: Market Index Theory, Modern Portfolio Theory
 * Data Source: Finnhub API (FREE, 60 calls/min)
 * Updates: Every 5 minutes
 */

interface StockIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface StockIndexesResponse {
  indexes: StockIndex[];
  timestamp: string;
  aiReading: string;
}

// Finnhub symbols for major indexes
const INDEX_SYMBOLS = {
  SP500: "^GSPC", // S&P 500
  DOW: "^DJI", // Dow Jones
  NASDAQ: "^IXIC", // NASDAQ
} as const;

/**
 * Get stock index quote from Finnhub
 */
async function getStockIndexQuote(
  symbol: string,
  apiKey: string
): Promise<{ price: number; change: number; changePercent: number } | null> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
      {
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.c === 0) {
      return null;
    }

    const currentPrice = data.c; // Current price
    const previousClose = data.pc; // Previous close
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      price: currentPrice,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching stock index ${symbol}:`, error);
    return null;
  }
}

/**
 * Get all stock indexes
 */
async function getAllStockIndexes(): Promise<StockIndex[]> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!finnhubApiKey) {
    console.warn("FINNHUB_API_KEY not configured");
    return [];
  }

  const [sp500Data, dowData, nasdaqData] = await Promise.all([
    getStockIndexQuote(INDEX_SYMBOLS.SP500, finnhubApiKey),
    getStockIndexQuote(INDEX_SYMBOLS.DOW, finnhubApiKey),
    getStockIndexQuote(INDEX_SYMBOLS.NASDAQ, finnhubApiKey),
  ]);

  const indexes: StockIndex[] = [];

  if (sp500Data) {
    indexes.push({
      symbol: "SP500",
      name: "S&P 500",
      price: sp500Data.price,
      change: sp500Data.change,
      changePercent: sp500Data.changePercent,
      timestamp: new Date().toISOString(),
    });
  }

  if (dowData) {
    indexes.push({
      symbol: "DOW",
      name: "Dow Jones",
      price: dowData.price,
      change: dowData.change,
      changePercent: dowData.changePercent,
      timestamp: new Date().toISOString(),
    });
  }

  if (nasdaqData) {
    indexes.push({
      symbol: "NASDAQ",
      name: "NASDAQ",
      price: nasdaqData.price,
      change: nasdaqData.change,
      changePercent: nasdaqData.changePercent,
      timestamp: new Date().toISOString(),
    });
  }

  return indexes;
}

/**
 * Get Groq AI reading for Stock Indexes
 */
async function getStockIndexesAIReading(indexes: StockIndex[]): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi degli indici azionari.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Modern Portfolio Theory - Market Index Analysis
- Efficient Market Hypothesis`;

  const indexesSummary = indexes
    .map(
      (idx) =>
        `${idx.name}: ${idx.price.toFixed(2)} (${idx.change >= 0 ? "+" : ""}${idx.changePercent.toFixed(2)}%)`
    )
    .join(", ");

  const userPrompt = `Leggi i dati Stock Market Indexes forniti.

DATI FORNITI:
${indexesSummary}

RIFERIMENTO ACCADEMICO:
- Modern Portfolio Theory - Market Index Analysis
- Gli indici azionari principali (S&P 500, Dow, NASDAQ) riflettono la performance complessiva del mercato azionario USA

INTERPRETAZIONE ACCADEMICA:
- S&P 500: Indice più rappresentativo (500 aziende large-cap). Benchmark principale per mercato azionario USA.
- Dow Jones: Indice storico (30 blue-chip companies). Più concentrato, meno rappresentativo ma molto seguito.
- NASDAQ: Indice tech-heavy. Riflette performance settore tecnologico e crescita.

Fornisci una lettura SEMPLICE (3-4 frasi) dello stato attuale degli indici azionari basata sui dati forniti.
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
    const indexes = await getAllStockIndexes();

    if (indexes.length === 0) {
      return NextResponse.json(
        {
          error:
            "Stock indexes not available. Configure FINNHUB_API_KEY environment variable.",
          indexes: [],
        },
        { status: 503 }
      );
    }

    const aiReading = await getStockIndexesAIReading(indexes);

    const response: StockIndexesResponse = {
      indexes,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/market-indicators/stock-indexes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
