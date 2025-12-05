import { NextRequest, NextResponse } from "next/server";

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
 * Get Groq AI reading for Economic Indicators
 */
async function getEconomicIndicatorsAIReading(indicators: EconomicIndicator[]): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista economico esperto di Tradelia, specializzato nell'analisi di indicatori economici ufficiali.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- National Bureau of Economic Research (NBER) - GDP
- Bureau of Labor Statistics (BLS) - CPI, Unemployment
- Federal Reserve - Monetary Policy`;

  const indicatorsSummary = indicators
    .map(
      (ind) =>
        `${ind.name}: ${ind.value}${ind.unit}${
          ind.change !== undefined
            ? ` (${ind.change >= 0 ? "+" : ""}${ind.change.toFixed(2)}${ind.unit})`
            : ""
        }`
    )
    .join(", ");

  const userPrompt = `Leggi i dati Economic Indicators forniti.

DATI FORNITI:
${indicatorsSummary}

RIFERIMENTI ACCADEMICI:
- GDP: National Bureau of Economic Research (NBER) - Misura crescita economica
- CPI: Bureau of Labor Statistics (BLS) - Misura inflazione
- Unemployment: Bureau of Labor Statistics (BLS) - Misura salute mercato del lavoro
- Fed Funds Rate: Federal Reserve - Tasso di interesse centrale

INTERPRETAZIONE ACCADEMICA:
- GDP positivo: Crescita economica. Negativo: Recessione.
- CPI in aumento: Inflazione. Target Fed: ~2% annuo.
- Unemployment basso: Mercato del lavoro forte. Alto: Debolezza economica.
- Fed Funds Rate: Tasso di interesse centrale. Influenza costi di finanziamento.

Fornisci una lettura SEMPLICE (3-4 frasi) dello stato attuale degli indicatori economici basata sui dati forniti.
MENTIONA i valori principali e la loro interpretazione accademica.
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
    const indicators = await getAllEconomicIndicators();

    if (indicators.length === 0) {
      return NextResponse.json(
        {
          error: "Economic indicators not available. Configure FRED_API_KEY environment variable.",
          indicators: [],
        },
        { status: 503 }
      );
    }

    const aiReading = await getEconomicIndicatorsAIReading(indicators);

    const response: EconomicIndicatorsResponse = {
      indicators,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/market-indicators/economic:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
