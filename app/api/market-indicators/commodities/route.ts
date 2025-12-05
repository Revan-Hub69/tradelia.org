import { NextRequest, NextResponse } from "next/server";

/**
 * Commodities Indicator API
 *
 * Major Commodities
 * - Gold (XAU/USD)
 * - Oil (WTI Crude)
 * - Silver
 *
 * Academic Reference: Commodity Futures Theory, Inflation Hedging
 * Data Source: Alpha Vantage API (FREE, 5 calls/min)
 * Updates: Every 5 minutes
 */

interface Commodity {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  timestamp: string;
}

interface CommoditiesResponse {
  commodities: Commodity[];
  timestamp: string;
  aiReading: string;
}

// Alpha Vantage symbols for commodities
const COMMODITY_SYMBOLS = {
  GOLD: "GC=F", // Gold Futures
  OIL: "CL=F", // WTI Crude Oil Futures
  SILVER: "SI=F", // Silver Futures
} as const;

/**
 * Get commodity quote from Alpha Vantage
 */
async function getCommodityQuote(
  symbol: string,
  apiKey: string
): Promise<{ price: number; change: number; changePercent: number } | null> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
      {
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    if (data["Error Message"] || data["Note"]) {
      console.warn(`Alpha Vantage API warning for ${symbol}:`, data["Error Message"] || data["Note"]);
      return null;
    }

    const quote = data["Global Quote"];

    if (!quote || !quote["05. price"]) {
      return null;
    }

    const currentPrice = parseFloat(quote["05. price"]);
    const previousClose = parseFloat(quote["08. previous close"]);
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      price: currentPrice,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching commodity ${symbol}:`, error);
    return null;
  }
}

/**
 * Get all commodities
 */
async function getAllCommodities(): Promise<Commodity[]> {
  const alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!alphaVantageApiKey) {
    console.warn("ALPHA_VANTAGE_API_KEY not configured");
    return [];
  }

  // Sequential calls to respect rate limit (5 calls/min)
  const goldData = await getCommodityQuote(COMMODITY_SYMBOLS.GOLD, alphaVantageApiKey);
  await new Promise((resolve) => setTimeout(resolve, 12000)); // Wait 12 seconds between calls

  const oilData = await getCommodityQuote(COMMODITY_SYMBOLS.OIL, alphaVantageApiKey);
  await new Promise((resolve) => setTimeout(resolve, 12000)); // Wait 12 seconds between calls

  const silverData = await getCommodityQuote(COMMODITY_SYMBOLS.SILVER, alphaVantageApiKey);

  const commodities: Commodity[] = [];

  if (goldData) {
    commodities.push({
      symbol: "GOLD",
      name: "Gold",
      price: goldData.price,
      change: goldData.change,
      changePercent: goldData.changePercent,
      unit: "USD/oz",
      timestamp: new Date().toISOString(),
    });
  }

  if (oilData) {
    commodities.push({
      symbol: "OIL",
      name: "WTI Crude Oil",
      price: oilData.price,
      change: oilData.change,
      changePercent: oilData.changePercent,
      unit: "USD/bbl",
      timestamp: new Date().toISOString(),
    });
  }

  if (silverData) {
    commodities.push({
      symbol: "SILVER",
      name: "Silver",
      price: silverData.price,
      change: silverData.change,
      changePercent: silverData.changePercent,
      unit: "USD/oz",
      timestamp: new Date().toISOString(),
    });
  }

  return commodities;
}

/**
 * Get Groq AI reading for Commodities
 */
async function getCommoditiesAIReading(commodities: Commodity[]): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi delle commodities.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessivamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Commodity Futures Theory
- Inflation Hedging Theory`;

  const commoditiesSummary = commodities
    .map(
      (cmd) =>
        `${cmd.name}: $${cmd.price.toFixed(2)}/${cmd.unit} (${cmd.change >= 0 ? "+" : ""}${cmd.changePercent.toFixed(2)}%)`
    )
    .join(", ");

  const userPrompt = `Leggi i dati Commodities forniti.

DATI FORNITI:
${commoditiesSummary}

RIFERIMENTO ACCADEMICO:
- Commodity Futures Theory - Inflation Hedging
- Le commodities (oro, petrolio, argento) sono considerate hedge contro inflazione e indicatori di sentiment macroeconomico

INTERPRETAZIONE ACCADEMICA:
- Gold: Considerato safe haven e hedge contro inflazione. Aumenti: possibile fuga verso qualità, inflazione, debolezza dollaro.
- Oil: Indicatore di domanda economica globale. Aumenti: crescita economica, tensioni geopolitiche. Diminuzioni: debolezza economica.
- Silver: Correlato a gold ma più volatile. Usato in industria e come investimento.

Fornisci una lettura SEMPLICE (3-4 frasi) dello stato attuale delle commodities basata sui dati forniti.
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
    const commodities = await getAllCommodities();

    if (commodities.length === 0) {
      return NextResponse.json(
        {
          error:
            "Commodities not available. Configure ALPHA_VANTAGE_API_KEY environment variable.",
          commodities: [],
        },
        { status: 503 }
      );
    }

    const aiReading = await getCommoditiesAIReading(commodities);

    const response: CommoditiesResponse = {
      commodities,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/market-indicators/commodities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
