/**
 * Groq AI Helper
 * 
 * Integrazione con Groq AI per generare spiegazioni accademiche
 * seguendo lo stile Tradelia AI Communication Style.
 * 
 * Groq API: https://console.groq.com/docs
 * Rate limits: Generosi per free tier
 */

import { TRADELIA_AI_COMMUNICATION_STYLE } from './tradelia-ai-communication-style';

interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Genera spiegazione accademica tramite Groq AI
 * 
 * @param prompt - Prompt specifico per la spiegazione
 * @param context - Contesto aggiuntivo (dati, metriche, etc.)
 * @returns Spiegazione generata da Groq
 */
export async function generateGroqExplanation(
  prompt: string,
  context?: Record<string, any>
): Promise<string | null> {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.warn('GROQ_API_KEY non configurata, ritorno null');
      return null;
    }

    const systemPrompt = `${TRADELIA_AI_COMMUNICATION_STYLE.systemPrompt}

CONTESTO AGGIUNTIVO:
${context ? JSON.stringify(context, null, 2) : 'Nessun contesto aggiuntivo'}

IMPORTANTE PER MICROSTRUTTURA DEL MERCATO:
- Spiega sempre cosa misura l'indicatore e perché è rilevante
- Includi sempre limitazioni e quando NON usare il segnale
- Spiega la relazione tra order book, bid/ask imbalance e movimenti di prezzo
- Cita sempre che gli effetti sono piccoli, locali nel tempo, e non garantiti
- Evita promesse di "previsioni" - parla di "relazioni statistiche deboli"
- Includi sempre note metodologiche esplicite`;

    const fullPrompt = `${systemPrompt}

${prompt}

GENERA:
Una spiegazione accademica, educativa, seguendo tutti i principi Tradelia AI sopra definiti.
Massimo 4 paragrafi per sezione.
Usa esempi concreti quando possibile.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile', // Modello Groq veloce e potente
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        temperature: 0.7, // Bilanciamento creatività/precisione
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data: GroqResponse = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }

    return null;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return null;
  }
}

/**
 * Genera spiegazione per Order Book / Market Depth
 */
export async function generateOrderBookExplanation(
  symbol: string,
  depth: number,
  exchange: string
): Promise<string | null> {
  const prompt = `Spiega cosa significa "Order Book" o "Market Depth" per ${symbol} su ${exchange} con profondità ${depth} livelli.

Includi:
1. Cosa rappresenta l'order book (bids e asks)
2. Perché la profondità (${depth} livelli) è importante
3. Come interpretare i dati per capire la liquidità
4. Limitazioni: quando i dati possono essere fuorvianti (fake liquidity, manipolazioni)`;

  return generateGroqExplanation(prompt, {
    symbol,
    depth,
    exchange,
    type: 'order_book',
  });
}

/**
 * Genera spiegazione per Bid/Ask Imbalance
 */
export async function generateImbalanceExplanation(
  symbol: string,
  imbalance: number,
  context: {
    bidVolume: number;
    askVolume: number;
    currentPrice: number;
  }
): Promise<string | null> {
  const prompt = `Spiega il "Bid/Ask Imbalance" per ${symbol}.

Dati attuali:
- Imbalance: ${imbalance.toFixed(4)} (${imbalance > 0 ? 'più domanda' : 'più offerta'})
- Volume Bid: ${context.bidVolume}
- Volume Ask: ${context.askVolume}
- Prezzo corrente: ${context.currentPrice}

Includi:
1. Cosa misura l'imbalance e come si calcola
2. Cosa significa un imbalance positivo vs negativo
3. Relazione tra imbalance e movimenti di prezzo (breve orizzonte, effetti piccoli)
4. Limitazioni: non è un segnale certo, effetti si esauriscono rapidamente, costi di transazione possono eliminare l'edge`;

  return generateGroqExplanation(prompt, {
    symbol,
    imbalance,
    ...context,
    type: 'imbalance',
  });
}

/**
 * Genera spiegazione per L400 Multi-Exchange
 */
export async function generateMultiExchangeExplanation(
  symbol: string,
  exchanges: string[],
  aggregatedDepth: number
): Promise<string | null> {
  const prompt = `Spiega l'approccio "L400 Multi-Exchange" per ${symbol}.

Exchange aggregati: ${exchanges.join(', ')}
Profondità aggregata totale: ${aggregatedDepth} livelli

Includi:
1. Perché aggregare dati da più exchange (copertura, riduzione bias)
2. Vantaggi rispetto a singolo exchange
3. Limitazioni: latenza, differenze di liquidità, frammentazione
4. Come interpretare la profondità aggregata`;

  return generateGroqExplanation(prompt, {
    symbol,
    exchanges,
    aggregatedDepth,
    type: 'multi_exchange',
  });
}

/**
 * Genera nota metodologica per un indicatore di microstruttura
 */
export async function generateMethodologyNote(
  indicatorName: string,
  formula: string,
  parameters: Record<string, any>
): Promise<string | null> {
  const prompt = `Genera una nota metodologica accademica per l'indicatore: ${indicatorName}

Formula: ${formula}
Parametri: ${JSON.stringify(parameters, null, 2)}

La nota deve includere:
1. Definizione accademica dell'indicatore
2. Come viene calcolato (formula e parametri)
3. Ipotesi teoriche su cui si basa
4. Limitazioni e quando non usarlo
5. Riferimenti impliciti alla letteratura di market microstructure`;

  return generateGroqExplanation(prompt, {
    indicatorName,
    formula,
    parameters,
    type: 'methodology',
  });
}

/**
 * Genera lettura completa del mercato (tutti i dati insieme)
 */
export async function generateMarketReading(
  symbol: string,
  data: {
    orderBook?: {
      totalBidVolume: number;
      totalAskVolume: number;
      spread: number;
      spreadPercent: number;
    };
    imbalance?: {
      overallImbalance: number;
      imbalances: Array<{ range: string; imbalance: number }>;
    };
    futures?: {
      fundingRate?: number;
      openInterest?: number;
      sentiment?: string;
    };
  }
): Promise<string | null> {
  const prompt = `Leggi e interpreta il mercato per ${symbol} basandoti su questi dati:

${data.orderBook ? `
ORDER BOOK:
- Volume Bid totale: ${data.orderBook.totalBidVolume.toLocaleString()}
- Volume Ask totale: ${data.orderBook.totalAskVolume.toLocaleString()}
- Spread: ${data.orderBook.spread.toFixed(2)} (${data.orderBook.spreadPercent.toFixed(3)}%)
` : ''}

${data.imbalance ? `
BID/ASK IMBALANCE:
- Imbalance complessivo: ${(data.imbalance.overallImbalance * 100).toFixed(2)}%
${data.imbalance.imbalances.map(imb => `- ${imb.range}: ${(imb.imbalance * 100).toFixed(2)}%`).join('\n')}
` : ''}

${data.futures ? `
FUTURES DATA:
${data.futures.fundingRate !== undefined ? `- Funding Rate: ${(data.futures.fundingRate * 100).toFixed(4)}%` : ''}
${data.futures.openInterest !== undefined ? `- Open Interest: $${data.futures.openInterest.toLocaleString()}` : ''}
${data.futures.sentiment ? `- Sentiment: ${data.futures.sentiment}` : ''}
` : ''}

GENERA UNA LETTURA COMPLETA:
1. Cosa sta succedendo nel mercato ORA (descrizione oggettiva)
2. Quali sono i segnali più forti vs deboli
3. Cosa significa per il trading (non consigli operativi, ma interpretazione)
4. Limitazioni: cosa NON possiamo sapere da questi dati
5. Warning: effetti piccoli, non garantiti, costi di transazione

IMPORTANTE:
- Non fare previsioni magiche
- Spiega relazioni statistiche deboli
- Includi sempre limitazioni e rischi
- Mantieni tono accademico ma accessibile`;

  return generateGroqExplanation(prompt, {
    symbol,
    ...data,
    type: 'market_reading',
  });
}

