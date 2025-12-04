import { NextRequest, NextResponse } from 'next/server';
import { TRADELIA_AI_SYSTEM_PROMPT } from '@/lib/ai/tradelia-ai-communication-style';
import { TRADELIA_BRAND_VOICE_MATRIX } from '@/lib/ai/tradelia-brand-voice-matrix';

/**
 * AI Chat API - Groq (Primary) + Simple RAG Fallback
 * 
 * Strategy: Groq (primary, free tier) → Simple RAG (final fallback)
 * Zero cost solution, fast implementation
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

// Build complete Tradelia system prompt
function buildTradeliaSystemPrompt(locale: 'it' | 'en'): string {
  const basePrompt = TRADELIA_AI_SYSTEM_PROMPT;
  
  const brandVoice = locale === 'it'
    ? `
IDENTITÀ TRADELIA: ${TRADELIA_BRAND_VOICE_MATRIX.identity.core}

PERSONALITÀ: ${TRADELIA_BRAND_VOICE_MATRIX.personality.traits.join(', ')}

PRINCIPI: Educazione prima di tutto, Rigore accademico, Rilevanza pratica, Accessibilità, Rispetto.

MIFID II: NON fornire consulenza finanziaria. Solo informazioni educative. Aggiungi sempre disclaimer MIFID.

FORMATO: Massimo 4 paragrafi, massimo 5 punti per elenco, esempi concreti, collega teoria ↔ pratica.
`
    : `
TRADELIA IDENTITY: ${TRADELIA_BRAND_VOICE_MATRIX.identity.core}

PERSONALITY: ${TRADELIA_BRAND_VOICE_MATRIX.personality.traits.join(', ')}

PRINCIPLES: Education first, Academic rigor, Practical relevance, Accessibility, Respect.

MIFID II: DO NOT provide financial advice. Only educational information. Always add MIFID disclaimer.

FORMAT: Maximum 4 paragraphs, maximum 5 points per list, concrete examples, connect theory ↔ practice.
`;

  return `${basePrompt}\n\n${brandVoice}`;
}

// Groq AI (Primary - Free tier)
async function callGroqAI(
  message: string,
  conversationHistory: ChatMessage[] = [],
  locale: 'it' | 'en'
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const systemPrompt = buildTradeliaSystemPrompt(locale);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-5),
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
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 800,
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
    console.warn('Groq AI error:', error);
    throw error;
  }
}

// Simple RAG fallback (basic glossary search, no complex setup)
async function simpleRAGFallback(
  query: string,
  locale: 'it' | 'en'
): Promise<string> {
  // Simple template responses for common queries
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('sharpe') || queryLower.includes('sharpe ratio')) {
    return locale === 'it'
      ? `**Sharpe Ratio**\n\nIl Sharpe Ratio misura il rendimento aggiustato per il rischio. Formula: (Rendimento Portafoglio - Tasso Risk-Free) / Deviazione Standard.\n\nValori:\n• > 1: Buono\n• > 2: Eccellente\n• > 3: Eccezionale\n\nUsa il calcolatore Sharpe Ratio nella sezione Utilities.\n\n*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**Sharpe Ratio**\n\nThe Sharpe Ratio measures risk-adjusted return. Formula: (Portfolio Return - Risk-Free Rate) / Standard Deviation.\n\nValues:\n• > 1: Good\n• > 2: Excellent\n• > 3: Exceptional\n\nUse the Sharpe Ratio calculator in the Utilities section.\n\n*MIFID II Note: Information for educational purposes. Does not constitute financial advice.*`;
  }
  
  if (queryLower.includes('pac') || queryLower.includes('piano accumulo')) {
    return locale === 'it'
      ? `**PAC (Piano di Accumulo Capitale)**\n\nIl PAC prevede versamenti periodici per accumulare capitale nel tempo.\n\nVantaggi:\n• Diversificazione temporale\n• Riduzione rischio timing\n• Disciplina investimento\n\nUsa il simulatore PAC nella sezione Utilities.\n\n*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**PAC (Capital Accumulation Plan)**\n\nPAC involves periodic contributions to accumulate capital over time.\n\nBenefits:\n• Time diversification\n• Reduced timing risk\n• Investment discipline\n\nUse the PAC simulator in the Utilities section.\n\n*MIFID II Note: Information for educational purposes. Does not constitute financial advice.*`;
  }
  
  if (queryLower.includes('volatilità') || queryLower.includes('volatility')) {
    return locale === 'it'
      ? `**Volatilità**\n\nLa volatilità misura la variabilità dei prezzi nel tempo. Alta volatilità = maggiore rischio ma anche maggiore potenziale rendimento.\n\nSi misura come deviazione standard dei rendimenti annui.\n\n*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**Volatility**\n\nVolatility measures price variability over time. High volatility = greater risk but also greater return potential.\n\nMeasured as standard deviation of annual returns.\n\n*MIFID II Note: Information for educational purposes. Does not constitute financial advice.*`;
  }
  
  // Default response
  return locale === 'it'
    ? `Grazie per la tua domanda! Sono l'assistente AI di Tradelia.\n\nPosso aiutarti con:\n• Termini finanziari (Sharpe Ratio, Volatilità, Hedging, PAC)\n• Strumenti finanziari (Calcolatori, Simulatori)\n• Report e analisi\n• Funzionalità piattaforma\n\nConsulta la sezione FAQ per risposte rapide o prova a riformulare la domanda.\n\n*Nota: Le risposte sono a scopo educativo. Non costituiscono consulenza finanziaria.*`
    : `Thanks for your question! I'm Tradelia's AI assistant.\n\nI can help with:\n• Financial terms (Sharpe Ratio, Volatility, Hedging, PAC)\n• Financial tools (Calculators, Simulators)\n• Reports and analysis\n• Platform features\n\nCheck the FAQ section for quick answers or try rephrasing your question.\n\n*Note: Answers are for educational purposes. They do not constitute financial advice.*`;
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
    let model = 'fallback';
    let provider = 'none';

    // 1. Try Groq (primary - free tier)
    try {
      response = await callGroqAI(message, conversationHistory, locale);
      model = 'llama-3.3-70b';
      provider = 'groq';
    } catch (groqError) {
      console.warn('Groq failed, using simple RAG fallback:', groqError);
      
      // 2. Simple RAG fallback (no complex setup)
      response = await simpleRAGFallback(message, locale);
      model = 'simple-rag';
      provider = 'fallback';
    }

    return NextResponse.json({
      response,
      model,
      provider,
    });
  } catch (error) {
    console.error('Error in AI chat API:', error);
    
    // Final fallback
    const body = await request.json().catch(() => ({}));
    const locale = (body as ChatRequest)?.locale || 'it';
    
    const fallbackResponse = locale === 'it'
      ? 'Mi dispiace, si è verificato un errore. Riprova più tardi o consulta la sezione FAQ.'
      : 'Sorry, an error occurred. Please try again later or check the FAQ section.';
    
    return NextResponse.json({
      response: fallbackResponse,
      model: 'fallback',
      provider: 'error',
      error: 'Service temporarily unavailable',
    });
  }
}
