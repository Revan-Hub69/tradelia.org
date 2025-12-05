import { NextRequest, NextResponse } from "next/server";

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
 * Get Groq AI reading for Bond Yields
 */
async function getBondYieldsAIReading(
  yield10Y: number,
  yield2Y: number,
  spread: number,
  curveStatus: "normal" | "flat" | "inverted"
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista economico esperto di Tradelia, specializzato nell'analisi della yield curve e dei tassi di interesse.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Estrella & Mishkin (1996) - "The Yield Curve as a Predictor of U.S. Recessions"
- Harvey (1988) - "The Real Term Structure and Consumption Growth"`;

  const curveStatusText =
    curveStatus === "inverted"
      ? "Invertita (Inverted)"
      : curveStatus === "flat"
        ? "Piatta (Flat)"
        : "Normale (Normal)";

  const userPrompt = `Leggi i dati Bond Yields e Yield Curve forniti.

DATI FORNITI:
- 10-Year Treasury Yield: ${yield10Y.toFixed(2)}%
- 2-Year Treasury Yield: ${yield2Y.toFixed(2)}%
- Yield Curve Spread (10Y - 2Y): ${spread >= 0 ? "+" : ""}${spread.toFixed(2)}%
- Yield Curve Status: ${curveStatusText}

RIFERIMENTO ACCADEMICO:
- Estrella & Mishkin (1996) - "The Yield Curve as a Predictor of U.S. Recessions"
- La yield curve (curva dei rendimenti) mostra la differenza tra tassi a lungo termine (10Y) e breve termine (2Y)
- Spread positivo: curva normale (normale). Spread negativo: curva invertita (inverted)

INTERPRETAZIONE ACCADEMICA:
- Normal Curve (Spread > 0.5%): Curva normale, economia in crescita. Tassi a lungo termine più alti riflettono aspettative di crescita e inflazione.
- Flat Curve (Spread -0.5% to 0.5%): Curva piatta, incertezza. Possibile transizione verso inversione o normalizzazione.
- Inverted Curve (Spread < -0.5%): Curva invertita, SEGNALE RECESSIONE. Storicamente, yield curve invertita ha predetto tutte le recessioni USA dal 1950. Indica aspettative di rallentamento economico.

IMPORTANTE: Yield curve invertita è un predittore accademico riconosciuto di recessioni, ma non predice timing preciso (tipicamente 6-18 mesi prima).

Fornisci una lettura SEMPLICE (3-4 frasi) dello stato attuale della yield curve basata sui dati forniti.
MENTIONA il valore dello spread (${spread >= 0 ? "+" : ""}${spread.toFixed(2)}%) e lo status della curva (${curveStatusText}).
NO predizioni precise, NO consigli, solo lettura descrittiva.`;

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
    const fredApiKey = process.env.FRED_API_KEY;

    if (!fredApiKey) {
      return NextResponse.json(
        {
          error: "Bond Yields not available. Configure FRED_API_KEY environment variable.",
        },
        { status: 503 }
      );
    }

    const [yield10YData, yield2YData] = await Promise.all([
      getTreasuryYield(FRED_SERIES.YIELD_10Y, fredApiKey),
      getTreasuryYield(FRED_SERIES.YIELD_2Y, fredApiKey),
    ]);

    if (!yield10YData || !yield2YData) {
      return NextResponse.json({ error: "Failed to fetch Bond Yields data" }, { status: 500 });
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/market-indicators/bond-yields:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
