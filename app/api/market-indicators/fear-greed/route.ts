import { NextRequest, NextResponse } from "next/server";

/**
 * Fear & Greed Index API
 *
 * Supporta sia Crypto che Stock Market Fear & Greed Index
 *
 * 1. Crypto Fear & Greed Index (Bitcoin & Cryptocurrencies)
 *    - Data Source: Alternative.me API (FREE)
 *    - https://alternative.me/crypto/fear-and-greed-index/
 *
 * 2. Stock Market Fear & Greed Index (S&P 500)
 *    - Data Source: CNN Money (scraping o API se disponibile)
 *    - https://www.cnn.com/markets/fear-and-greed
 *
 * Academic Reference: Behavioral Finance principles
 * Updates: Every 5 minutes
 */

interface FearGreedResponse {
  value: number; // 0-100
  classification: string;
  timestamp: string;
  history: Array<{ date: string; value: number }>;
  aiReading: string;
  market: "crypto" | "stock"; // Tipo di mercato
}

/**
 * Get CNN Fear & Greed Index for Stock Market (S&P 500)
 *
 * NOTA IMPORTANTE: CNN non fornisce un'API pubblica per il Fear & Greed Index.
 * 
 * Opzioni valide per implementazione futura:
 * 1. Servizio terzo dedicato (se disponibile e affidabile)
 * 2. Proxy server-side con scraping controllato (richiede infrastruttura dedicata)
 * 3. Integrazione con provider di dati finanziari (Bloomberg, Reuters, etc.)
 * 
 * Per ora, questa funzione restituisce null perché:
 * - Scraping diretto non è affidabile (CORS, rate limiting, ToS)
 * - Non vogliamo codice fragile in produzione
 * - Meglio implementare quando avremo una soluzione solida
 */
async function getStockMarketFearGreedIndex(): Promise<{
  value: number;
  classification: string;
} | null> {
  // TODO: Implementare quando avremo un'API affidabile o servizio terzo dedicato
  // Per ora, restituiamo null per evitare codice fragile
  return null;
}

/**
 * Get Fear & Greed Index from Alternative.me (Crypto)
 */
async function getCryptoFearGreedIndex(): Promise<{
  value: number;
  classification: string;
} | null> {
  try {
    const response = await fetch("https://api.alternative.me/fng/", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Alternative.me API error");
    }

    const data = await response.json();
    const current = data.data?.[0];

    if (!current) {
      return null;
    }

    const value = parseInt(current.value, 10);
    const classification = current.value_classification;

    return { value, classification };
  } catch (error) {
    console.error("Error fetching Fear & Greed Index:", error);
    return null;
  }
}

/**
 * Get Fear & Greed History (Crypto)
 */
async function getCryptoFearGreedHistory(): Promise<Array<{ date: string; value: number }>> {
  try {
    const response = await fetch("https://api.alternative.me/fng/?limit=30", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const history = data.data || [];

    return history
      .map((item: { timestamp: string; value: string }) => ({
        date: new Date(parseInt(item.timestamp, 10) * 1000).toISOString(),
        value: parseInt(item.value, 10),
      }))
      .reverse(); // Oldest first
  } catch (error) {
    console.error("Error fetching Fear & Greed history:", error);
    return [];
  }
}

/**
 * Get Groq AI reading for Stock Market Fear & Greed
 * 
 * NOTA: Questa funzione non è attualmente utilizzata perché getStockMarketFearGreedIndex
 * restituisce null. Manteniamo il codice per uso futuro quando avremo i dati.
 */
async function getStockMarketFearGreedAIReading(
  value: number,
  classification: string
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi del sentiment di mercato azionario.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Behavioral Finance - Market Sentiment Analysis (Stock Market)`;

  const userPrompt = `Leggi i dati Fear & Greed Index per il mercato azionario (S&P 500) forniti.

DATI FORNITI:
- Fear & Greed Value: ${value} (0-100)
- Classification: ${classification}
- Mercato: Stock Market (S&P 500)
- Fonte: CNN Fear & Greed Index

IMPORTANTE: Questo è l'indice Fear & Greed specifico per il mercato azionario (CNN).
Non è l'indice per il mercato crypto (quello è Alternative.me).

INTERPRETAZIONE:
- 0-24: Extreme Fear
- 25-44: Fear
- 45-55: Neutral
- 56-75: Greed
- 76-100: Extreme Greed

Fornisci una lettura SEMPLICE (2-3 frasi) dello stato attuale del sentiment del mercato azionario basata sui dati forniti.
MENTIONA che si tratta del mercato azionario (S&P 500).
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
 * Get Groq AI reading for Fear & Greed (Crypto)
 */
async function getFearGreedAIReading(value: number, classification: string): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi del sentiment di mercato.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Behavioral Finance - Market Sentiment Analysis`;

  const userPrompt = `Leggi i dati Fear & Greed Index per il mercato crypto forniti.

DATI FORNITI:
- Fear & Greed Value: ${value} (0-100)
- Classification: ${classification}
- Mercato: Crypto (Bitcoin & Criptovalute)

RIFERIMENTO ACCADEMICO:
- Behavioral Finance - Analisi Sentiment di Mercato
- Indice sintetico che combina 7 fattori: volatilità, volume, social media, surveys, dominance, Google Trends, momentum

INTERPRETAZIONE ACCADEMICA:
- 0-24 (Extreme Fear): Sentiment estremamente negativo. Storicamente zone di acquisto potenziali, ma richiede conferma.
- 25-44 (Fear): Sentiment negativo. Mercato in fase di paura, possibile overselling.
- 45-55 (Neutral): Sentiment bilanciato. Nessun segnale estremo, mercato in equilibrio.
- 56-75 (Greed): Sentiment positivo. Mercato in fase di avidità, possibile overbuying.
- 76-100 (Extreme Greed): Sentiment estremamente positivo. Storicamente zone di vendita potenziali. Attenzione a possibili correzioni.

IMPORTANTE: Questo è l'indice Fear & Greed specifico per il mercato crypto (Alternative.me).
Non è l'indice per il mercato azionario (quello è il CNN Fear & Greed Index per S&P 500).

Fornisci una lettura SEMPLICE (2-3 frasi) dello stato attuale del sentiment del mercato crypto basata sui dati forniti.
MENTIONA il valore attuale (${value}) e la sua interpretazione accademica (${classification}).
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get("market") || "crypto"; // Default: crypto

    if (market === "stock") {
      // Stock Market Fear & Greed Index (CNN)
      // NOTA: Non ancora implementato - richiede API affidabile o servizio terzo
      return NextResponse.json(
        {
          error:
            "Stock Market Fear & Greed Index (CNN) not yet available. Implementation requires a reliable API or third-party service. Coming soon.",
          market: "stock",
        },
        { status: 503 }
      );
    } else {
      // Crypto Fear & Greed Index (default)
      const [fearGreedData, history] = await Promise.all([
        getCryptoFearGreedIndex(),
        getCryptoFearGreedHistory(),
      ]);

      if (!fearGreedData) {
        return NextResponse.json({ error: "Failed to fetch Fear & Greed Index" }, { status: 500 });
      }

      const aiReading = await getFearGreedAIReading(
        fearGreedData.value,
        fearGreedData.classification
      );

      const response: FearGreedResponse = {
        value: fearGreedData.value,
        classification: fearGreedData.classification,
        timestamp: new Date().toISOString(),
        history: history.slice(-30), // Last 30 days
        aiReading,
        market: "crypto",
      };

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("Error in GET /api/market-indicators/fear-greed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
