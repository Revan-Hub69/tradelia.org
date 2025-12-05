import { NextRequest, NextResponse } from "next/server";

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

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi della volatilità.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Whaley (1993) - "Derivatives on Market Volatility"`;

  const userPrompt = `Leggi i dati VIX forniti.

DATI FORNITI:
- VIX Value: ${vixValue.toFixed(2)}
- Change: ${change >= 0 ? "+" : ""}${change.toFixed(2)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)

RIFERIMENTO ACCADEMICO:
- Whaley (1993) - "Derivatives on Market Volatility"
- Indice di volatilità implicita calcolato dalle opzioni S&P 500
- Misura le aspettative di volatilità del mercato per i prossimi 30 giorni

INTERPRETAZIONE ACCADEMICA:
- < 12 (Low Volatility): Mercato calmo, bassa paura. Storicamente associato a trend rialzisti, ma può precedere correzioni.
- 12-20 (Normal Volatility): Range normale. Mercato in equilibrio, volatilità fisiologica.
- 20-30 (Elevated Volatility): Volatilità elevata, aumento della paura. Possibile instabilità, attenzione a movimenti ampi.
- > 30 (High Volatility/Fear): Volatilità molto alta, paura estrema. Storicamente zone di acquisto potenziali, ma richiede gestione del rischio.

Fornisci una lettura SEMPLICE (2-3 frasi) dello stato attuale del VIX basata sui dati forniti.
MENTIONA il valore attuale (${vixValue.toFixed(2)}) e la sua interpretazione accademica.
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
        max_tokens: 200,
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

export async function GET(_request: NextRequest) {
  try {
    const [vixData, history] = await Promise.all([getVIXFromYahoo(), getVIXHistory()]);

    if (!vixData) {
      return NextResponse.json({ error: "Failed to fetch VIX data" }, { status: 500 });
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/market-indicators/vix:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
