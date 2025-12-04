import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Chat API
 * Uses Groq AI (free tier: 14,400 requests/day) for real AI responses
 * Fallback to template responses if API key not configured
 * 
 * Get free API key: https://console.groq.com/
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  locale: 'it' | 'en';
  conversationHistory?: ChatMessage[];
}

// Groq AI Integration
async function callGroqAI(
  message: string,
  conversationHistory: ChatMessage[] = [],
  locale: 'it' | 'en'
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const systemPrompt = locale === 'it'
    ? `Sei l'assistente AI di Tradelia, una piattaforma finanziaria educativa. 
Rispondi in modo chiaro, professionale e conforme alle normative MIFID II.
Non fornire consulenza finanziaria, ma informazioni educative.
Sei esperto in:
- Termini finanziari e definizioni
- Strumenti finanziari (calcolatori, simulatori)
- Analisi di mercato e report
- Trading e investimenti
- Conformità MIFID II

Sii conciso, preciso e sempre aggiungi un disclaimer MIFID quando appropriato.`
    : `You are Tradelia's AI assistant, an educational financial platform.
Respond clearly, professionally, and in compliance with MIFID II regulations.
Do not provide financial advice, but educational information.
You are an expert in:
- Financial terms and definitions
- Financial tools (calculators, simulators)
- Market analysis and reports
- Trading and investments
- MIFID II compliance

Be concise, precise, and always add a MIFID disclaimer when appropriate.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-5), // Last 5 messages for context
    { role: 'user', content: message },
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile', // Fast and free model
        messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Mi dispiace, non ho ricevuto una risposta valida.';
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

// Fallback template responses
function getFallbackResponse(query: string, locale: 'it' | 'en'): string {
  const queryLower = query.toLowerCase();
  
  // Financial terms
  if (queryLower.includes('sharpe') || queryLower.includes('sharpe ratio')) {
    return locale === 'it'
      ? `**Sharpe Ratio**\n\nIl Sharpe Ratio misura il rendimento aggiustato per il rischio di un investimento. Si calcola come:\n\nSharpe Ratio = (Rendimento Portafoglio - Tasso Risk-Free) / Deviazione Standard\n\nUn valore superiore a 1 è considerato buono, superiore a 2 è eccellente, superiore a 3 è eccezionale.\n\n*Nota: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**Sharpe Ratio**\n\nThe Sharpe Ratio measures the risk-adjusted return of an investment. It's calculated as:\n\nSharpe Ratio = (Portfolio Return - Risk-Free Rate) / Standard Deviation\n\nA value above 1 is considered good, above 2 is excellent, above 3 is exceptional.\n\n*Note: Information for educational purposes. Does not constitute financial advice.*`;
  }
  
  if (queryLower.includes('volatilità') || queryLower.includes('volatility')) {
    return locale === 'it'
      ? `**Volatilità**\n\nLa volatilità misura la variabilità dei prezzi di un asset nel tempo. Una volatilità alta indica maggiore rischio ma anche maggiore potenziale di rendimento.\n\nSi misura tipicamente come deviazione standard dei rendimenti annui.\n\n*Nota: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**Volatility**\n\nVolatility measures the variability of an asset's prices over time. High volatility indicates greater risk but also greater return potential.\n\nIt's typically measured as the standard deviation of annual returns.\n\n*Note: Information for educational purposes. Does not constitute financial advice.*`;
  }
  
  if (queryLower.includes('pac') || queryLower.includes('piano accumulo')) {
    return locale === 'it'
      ? `**PAC (Piano di Accumulo Capitale)**\n\nIl PAC è una strategia di investimento che prevede versamenti periodici (mensili, trimestrali) per accumulare capitale nel tempo.\n\nVantaggi:\n- Diversificazione temporale\n- Riduzione del rischio di timing\n- Disciplina di investimento\n\nVisita la sezione Utilities per usare il simulatore PAC.\n\n*Nota: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**PAC (Capital Accumulation Plan)**\n\nPAC is an investment strategy involving periodic contributions (monthly, quarterly) to accumulate capital over time.\n\nBenefits:\n- Time diversification\n- Reduced timing risk\n- Investment discipline\n\nVisit the Utilities section to use the PAC simulator.\n\n*Note: Information for educational purposes. Does not constitute financial advice.*`;
  }
  
  // Default response
  return locale === 'it'
    ? `Grazie per la tua domanda! Sono l'assistente AI di Tradelia.\n\nPosso aiutarti con:\n• Termini finanziari (Sharpe Ratio, Volatilità, Hedging, ecc.)\n• Strumenti finanziari (Calcolatori, Simulatori PAC)\n• Report e analisi\n• Funzionalità della piattaforma\n\nPer domande più specifiche, visita la sezione Utilities nel dashboard.\n\n*Nota: Le risposte sono a scopo educativo. Non costituiscono consulenza finanziaria.*`
    : `Thanks for your question! I'm Tradelia's AI assistant.\n\nI can help with:\n• Financial terms (Sharpe Ratio, Volatility, Hedging, etc.)\n• Financial tools (Calculators, PAC Simulators)\n• Reports and analysis\n• Platform features\n\nFor more specific questions, visit the Utilities section in the dashboard.\n\n*Note: Answers are for educational purposes. They do not constitute financial advice.*`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, locale = 'it', conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let response: string;

    // Try Groq AI first (if API key is configured)
    try {
      response = await callGroqAI(message, conversationHistory, locale);
    } catch (error) {
      console.warn('Groq AI not available, using fallback:', error);
      // Fallback to template responses
      response = getFallbackResponse(message, locale);
    }

    return NextResponse.json({
      response,
      model: process.env.GROQ_API_KEY ? 'groq-llama-3.1' : 'fallback',
    });
  } catch (error) {
    console.error('Error in AI chat API:', error);
    
    // Return fallback even on error
    const body = await request.json().catch(() => ({}));
    const locale = (body as ChatRequest)?.locale || 'it';
    const message = (body as ChatRequest)?.message || '';
    
    return NextResponse.json({
      response: getFallbackResponse(message, locale),
      model: 'fallback',
      error: 'AI service unavailable',
    });
  }
}
