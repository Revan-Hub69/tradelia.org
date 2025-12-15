/**
 * Groq AI Helper - Funzione centralizzata per chiamare Groq AI
 * 
 * Usa i prompt enhanced con metodologia Tradelia AI
 * Tutte le risposte sono in italiano
 */

import { callGroqAI } from './indicator-prompts-enhanced';
import { TRADELIA_AI_COMMUNICATION_STYLE } from './tradelia-ai-communication-style';

/**
 * Chiama Groq AI con prompt enhanced
 * 
 * @param systemPrompt - System prompt (usare da indicator-prompts-enhanced)
 * @param userPrompt - User prompt (usare template da indicator-prompts-enhanced)
 * @param maxTokens - Max tokens (default 400 per spiegazioni complete)
 * @returns Risposta AI in italiano
 */
export async function getAIReading(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 400
): Promise<string> {
  return callGroqAI(systemPrompt, userPrompt, maxTokens);
}

/**
 * Genera spiegazione accademica tramite Groq AI
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
Massimo 6 paragrafi.
Usa esempi concreti quando possibile.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
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
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();

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
 * Genera reading completo per una crypto
 */
export async function generateCryptoReading(
  symbol: string,
  data: {
    price: number;
    change24hPercent: number;
    volume24h: number;
    orderBook: {
      totalBidVolume: number;
      totalAskVolume: number;
      spreadPercent: number;
      imbalance: number;
    };
    supportResistance: Array<{
      price: number;
      strength: string;
      type: 'support' | 'resistance';
      distancePercent: number;
    }>;
    pressure: {
      overall: number;
      strength: string;
      interpretation: string;
    };
    liquidity: {
      score: number;
      assessment: string;
    };
  }
): Promise<string | null> {
  const prompt = `Leggi e interpreta il mercato per ${symbol} basandoti su questi dati:

PREZZO E PERFORMANCE:
- Prezzo corrente: $${data.price.toLocaleString()}
- Cambio 24h: ${data.change24hPercent >= 0 ? '+' : ''}${data.change24hPercent.toFixed(2)}%
- Volume 24h: $${(data.volume24h / 1000000).toFixed(2)}M

ORDER BOOK:
- Volume Bid totale: ${data.orderBook.totalBidVolume.toLocaleString()}
- Volume Ask totale: ${data.orderBook.totalAskVolume.toLocaleString()}
- Spread: ${data.orderBook.spreadPercent.toFixed(3)}%
- Imbalance: ${(data.orderBook.imbalance * 100).toFixed(1)}%

SUPPORTI/RESISTENZE:
${data.supportResistance.map(sr => `- ${sr.type === 'support' ? 'Supporto' : 'Resistenza'} a $${sr.price.toFixed(2)} (forza: ${sr.strength}, distanza: ${Math.abs(sr.distancePercent).toFixed(2)}%)`).join('\n')}

PRESSIONE:
- Pressione complessiva: ${(data.pressure.overall * 100).toFixed(1)}% (${data.pressure.strength})
- ${data.pressure.interpretation}

LIQUIDITÀ:
- Score: ${data.liquidity.score}/100 (${data.liquidity.assessment})

GENERA UNA LETTURA COMPLETA:
1. Cosa sta succedendo con ${symbol} ORA (descrizione oggettiva)
2. Quali sono i segnali più forti vs deboli
3. Cosa significano supporti/resistenze identificati
4. Cosa significa la pressione di mercato
5. Limitazioni: cosa NON possiamo sapere da questi dati
6. Warning: effetti piccoli, non garantiti, costi di transazione`;

  return generateGroqExplanation(prompt, {
    symbol,
    ...data,
    type: 'crypto_reading',
  });
}

/**
 * Funzioni legacy per compatibilità
 */
export async function generateOrderBookExplanation(
  symbol: string,
  depth: number,
  exchange: string
): Promise<string | null> {
  return generateGroqExplanation(
    `Spiega cosa significa "Order Book" o "Market Depth" per ${symbol} su ${exchange} con profondità ${depth} livelli.`,
    { symbol, depth, exchange, type: 'order_book' }
  );
}

export async function generateImbalanceExplanation(
  symbol: string,
  imbalance: number,
  context: {
    bidVolume: number;
    askVolume: number;
    currentPrice: number;
  }
): Promise<string | null> {
  return generateGroqExplanation(
    `Spiega il "Bid/Ask Imbalance" per ${symbol}. Imbalance: ${imbalance.toFixed(4)}.`,
    { symbol, imbalance, ...context, type: 'imbalance' }
  );
}

export async function generateMultiExchangeExplanation(
  symbol: string,
  exchanges: string[],
  aggregatedDepth: number
): Promise<string | null> {
  return generateGroqExplanation(
    `Spiega l'approccio "L400 Multi-Exchange" per ${symbol}. Exchange: ${exchanges.join(', ')}.`,
    { symbol, exchanges, aggregatedDepth, type: 'multi_exchange' }
  );
}

export async function generateMarketReading(
  symbol: string,
  data: any
): Promise<string | null> {
  return generateGroqExplanation(
    `Leggi il mercato per ${symbol} basandoti su questi dati: ${JSON.stringify(data)}`,
    { symbol, ...data, type: 'market_reading' }
  );
}
