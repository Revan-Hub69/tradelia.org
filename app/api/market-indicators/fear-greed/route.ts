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
 * CNN Fear & Greed Index è disponibile su: https://www.cnn.com/markets/fear-and-greed
 *
 * Nota: CNN non ha un'API pubblica ufficiale, ma possiamo usare:
 * 1. Scraping leggero della pagina (non ideale per produzione)
 * 2. Servizio terzo se disponibile (es. Fear & Greed API)
 * 3. Proxy/CORS workaround
 *
 * Per ora implementiamo un tentativo di fetch diretto con fallback.
 */
async function getStockMarketFearGreedIndex(): Promise<{
  value: number;
  classification: string;
} | null> {
  try {
    // Tentativo 1: Usare un servizio terzo se disponibile
    // Alcuni servizi forniscono il CNN Fear & Greed Index via API
    // Esempio: https://api.fear-and-greed-index.com/ (se esiste)

    // Tentativo 2: Scraping leggero (solo per sviluppo/test)
    // In produzione, meglio usare un servizio dedicato o scraping server-side con rate limiting

    // Per ora, proviamo a fetchare direttamente la pagina CNN
    // Nota: Questo potrebbe fallire per CORS, quindi in produzione serve un proxy
    const response = await fetch("https://www.cnn.com/markets/fear-and-greed", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Tradelia/1.0)",
      },
    });

    if (!response.ok) {
      // Se il fetch diretto fallisce, proviamo un servizio alternativo
      // TODO: Implementare integrazione con servizio terzo dedicato
      console.warn("CNN Fear & Greed Index: Direct fetch not available, using fallback");
      return null;
    }

    const html = await response.text();

    // Estraiamo il valore dal JSON embedded nella pagina
    // CNN tipicamente include i dati in uno script tag con JSON
    const jsonMatch = html.match(
      /<script[^>]*>[\s\S]*?fearAndGreed[\s\S]*?({[\s\S]*?})[\s\S]*?<\/script>/i
    );

    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const value = parseInt(data.value || data.fearAndGreed?.value || "0", 10);
        const classification =
          data.classification || data.fearAndGreed?.classification || "Neutral";

        if (value >= 0 && value <= 100) {
          return { value, classification };
        }
      } catch (parseError) {
        console.error("Error parsing CNN Fear & Greed data:", parseError);
      }
    }

    // Fallback: proviamo a estrarre da altri pattern comuni nella pagina
    const valueMatch = html.match(/fear.*greed.*?(\d{1,3})/i);
    if (valueMatch) {
      const value = parseInt(valueMatch[1], 10);
      if (value >= 0 && value <= 100) {
        const classification = getClassificationFromValue(value);
        return { value, classification };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching Stock Market Fear & Greed Index:", error);
    return null;
  }
}

/**
 * Helper: Converti valore numerico in classificazione
 */
function getClassificationFromValue(value: number): string {
  if (value < 25) {
    return "Extreme Fear";
  }
  if (value < 45) {
    return "Fear";
  }
  if (value < 55) {
    return "Neutral";
  }
  if (value < 75) {
    return "Greed";
  }
  return "Extreme Greed";
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

IMPORTANTE: Questo è l'indice Fear & Greed specifico per il mercato crypto (Alternative.me).
Non è l'indice per il mercato azionario (quello è il CNN Fear & Greed Index per S&P 500).

INTERPRETAZIONE:
- 0-24: Extreme Fear
- 25-44: Fear
- 45-55: Neutral
- 56-75: Greed
- 76-100: Extreme Greed

Fornisci una lettura SEMPLICE (2-3 frasi) dello stato attuale del sentiment del mercato crypto basata sui dati forniti.
MENTIONA che si tratta del mercato crypto.
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
      const stockData = await getStockMarketFearGreedIndex();

      if (!stockData) {
        return NextResponse.json(
          {
            error:
              "Stock Market Fear & Greed Index temporarily unavailable. CNN integration may require proxy or third-party service.",
            market: "stock",
          },
          { status: 503 }
        );
      }

      // AI reading per stock market
      const aiReading = await getStockMarketFearGreedAIReading(
        stockData.value,
        stockData.classification
      );

      const response: FearGreedResponse = {
        value: stockData.value,
        classification: stockData.classification,
        timestamp: new Date().toISOString(),
        history: [], // TODO: Implementare history per stock market (richiede storage o API dedicata)
        aiReading,
        market: "stock",
      };

      return NextResponse.json(response);
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
