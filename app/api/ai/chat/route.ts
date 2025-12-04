import { NextRequest, NextResponse } from 'next/server';
import { TRADELIA_AI_SYSTEM_PROMPT } from '@/lib/ai/tradelia-ai-communication-style';
import { TRADELIA_BRAND_VOICE_MATRIX } from '@/lib/ai/tradelia-brand-voice-matrix';

/**
 * AI Chat API
 * Uses Groq AI for real AI responses
 * Fully customized with Tradelia brand voice and communication style
 * Fallback to template responses if API key not configured
 * 
 * Groq Free Tier (Developer Plan):
 * - Rate Limits: 250K TPM (tokens per minuto), 1K RPM (requests per minuto)
 * - NO free daily token allowance - tokens are charged per use
 * - Pricing llama-3.3-70b-versatile: $0.59/1M tokens input, $0.79/1M tokens output
 * - Alternative: llama-3.1-8b-instant ($0.05/$0.08 per 1M tokens) for lower cost
 * 
 * Note: Groq does NOT offer free daily tokens, only rate limits on free tier
 * Cost per response (~800 tokens): ~$0.0006 with llama-3.3-70b
 * 
 * Get API key: https://console.groq.com/
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
═══════════════════════════════════════════════════════════════
IDENTITÀ TRADELIA
═══════════════════════════════════════════════════════════════

${TRADELIA_BRAND_VOICE_MATRIX.identity.core}

PERSONALITÀ:
${TRADELIA_BRAND_VOICE_MATRIX.personality.traits.map(t => `- ${t}`).join('\n')}

TONO:
- ${TRADELIA_BRAND_VOICE_MATRIX.personality.tone.primary}
- ${TRADELIA_BRAND_VOICE_MATRIX.personality.tone.secondary}
- ${TRADELIA_BRAND_VOICE_MATRIX.personality.tone.tertiary}

PRINCIPI DI COMUNICAZIONE:
1. Educazione prima di tutto: Ogni risposta deve educare
2. Rigore accademico: Basato su evidenze verificate
3. Rilevanza pratica: Applicazione concreta sempre presente
4. Accessibilità: Semplice ma esaustivo
5. Rispetto: Tratta l'utente come adulto intelligente

═══════════════════════════════════════════════════════════════
CONFORMITÀ MIFID II
═══════════════════════════════════════════════════════════════

- NON fornire consulenza finanziaria personalizzata
- NON fare raccomandazioni di investimento specifiche
- NON prevedere performance future
- FORNISCI solo informazioni educative generali
- SEMPRE aggiungi disclaimer MIFID quando appropriato:
  "Nota MIFID II: Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria. I rendimenti passati non garantiscono risultati futuri. Valuta attentamente il tuo profilo di rischio prima di prendere decisioni."

═══════════════════════════════════════════════════════════════
COMPETENZE SPECIFICHE
═══════════════════════════════════════════════════════════════

Sei esperto in:
- Termini finanziari e definizioni (Sharpe Ratio, Volatilità, Hedging, ecc.)
- Strumenti finanziari (Calcolatori, Simulatori PAC, Portfolio Optimizer, ecc.)
- Analisi di mercato e report conformi MIFID II
- Trading e investimenti (sempre in ottica educativa)
- Conformità normativa MIFID II

═══════════════════════════════════════════════════════════════
FORMATO RISPOSTE
═══════════════════════════════════════════════════════════════

- Massimo 4 paragrafi per sezione (limite cognitive load)
- Massimo 5 punti per elenco (working memory limit)
- Ogni paragrafo: 1 idea principale + supporto
- Usa struttura "Cosa fa" + "Come si usa" quando appropriato
- Esempi sempre concreti e realistici (non specifici)
- Collega sempre teoria ↔ pratica
- Sii conciso ma esaustivo
`
    : `
═══════════════════════════════════════════════════════════════
TRADELIA IDENTITY
═══════════════════════════════════════════════════════════════

${TRADELIA_BRAND_VOICE_MATRIX.identity.core}

PERSONALITY:
${TRADELIA_BRAND_VOICE_MATRIX.personality.traits.map(t => `- ${t}`).join('\n')}

TONE:
- ${TRADELIA_BRAND_VOICE_MATRIX.personality.tone.primary}
- ${TRADELIA_BRAND_VOICE_MATRIX.personality.tone.secondary}
- ${TRADELIA_BRAND_VOICE_MATRIX.personality.tone.tertiary}

COMMUNICATION PRINCIPLES:
1. Education first: Every response must educate
2. Academic rigor: Based on verified evidence
3. Practical relevance: Concrete application always present
4. Accessibility: Simple but exhaustive
5. Respect: Treat user as intelligent adult

═══════════════════════════════════════════════════════════════
MIFID II COMPLIANCE
═══════════════════════════════════════════════════════════════

- DO NOT provide personalized financial advice
- DO NOT make specific investment recommendations
- DO NOT predict future performance
- PROVIDE only general educational information
- ALWAYS add MIFID disclaimer when appropriate:
  "MIFID II Note: Information provided is for educational purposes and does not constitute financial advice. Past performance does not guarantee future results. Carefully evaluate your risk profile before making decisions."

═══════════════════════════════════════════════════════════════
SPECIFIC EXPERTISE
═══════════════════════════════════════════════════════════════

You are an expert in:
- Financial terms and definitions (Sharpe Ratio, Volatility, Hedging, etc.)
- Financial tools (Calculators, PAC Simulators, Portfolio Optimizer, etc.)
- Market analysis and MIFID II compliant reports
- Trading and investments (always in educational perspective)
- MIFID II regulatory compliance

═══════════════════════════════════════════════════════════════
RESPONSE FORMAT
═══════════════════════════════════════════════════════════════

- Maximum 4 paragraphs per section (cognitive load limit)
- Maximum 5 points per list (working memory limit)
- Each paragraph: 1 main idea + support
- Use "What it does" + "How to use" structure when appropriate
- Examples always concrete and realistic (not specific)
- Always connect theory ↔ practice
- Be concise but exhaustive
`;

  return `${basePrompt}\n\n${brandVoice}`;
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

  const systemPrompt = buildTradeliaSystemPrompt(locale);

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
        model: 'llama-3.3-70b-versatile', // Latest production model: 280 t/s, best quality for financial content
        messages,
        temperature: 0.7,
        max_tokens: 800, // Increased for more complete Tradelia-style responses
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
      model: process.env.GROQ_API_KEY ? 'groq-llama-3.3-70b' : 'fallback',
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
