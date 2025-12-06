import { NextRequest, NextResponse } from "next/server";
import { TRADELIA_AI_SYSTEM_PROMPT } from "@/lib/ai/tradelia-ai-communication-style";
import { TRADELIA_BRAND_VOICE_MATRIX } from "@/lib/ai/tradelia-brand-voice-matrix";
import { checkRateLimit, getRateLimitKey, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/utils/inputValidation";

/**
 * AI Chat API - Groq (Primary) + Simple RAG Fallback
 *
 * Strategy: Groq (primary, free tier) → Simple RAG (final fallback)
 * Zero cost solution, fast implementation
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  locale: "it" | "en";
  conversationHistory?: ChatMessage[];
  context?: string;
  format?: "tradelia-5-points" | "simple";
}

// Build complete Tradelia system prompt
/**
 * Build Tradelia system prompt - STRICT academic compliance
 * Solo riferimenti accademici verificabili, NO invenzioni
 */
function buildTradeliaSystemPrompt(
  locale: "it" | "en",
  format: "tradelia-5-points" | "simple" = "tradelia-5-points"
): string {
  const basePrompt = TRADELIA_AI_SYSTEM_PROMPT;

  const formatInstructions =
    format === "tradelia-5-points"
      ? locale === "it"
        ? `
FORMATO OBBLIGATORIO - Schema Tradelia a 5 punti:
1. DEFINIZIONE ACCADEMICA: Definizione precisa e verificabile basata su fonti accademiche ufficiali (1-2 frasi)
   - OBBLIGATORIO: Usa solo definizioni da fonti accademiche verificate (libri di testo, paper accademici, istituzioni ufficiali)
   - NO definizioni inventate o semplificate oltre misura
   - Cita implicitamente la fonte quando possibile (es: "secondo la teoria finanziaria moderna...")
2. SPIEGAZIONE: Come funziona, perché è importante (2-3 frasi)
   - Basata su principi accademici verificabili
   - Collega a teorie finanziarie consolidate
3. ESEMPI PRATICI: Esempi concreti e rilevanti (1-2 esempi)
   - Esempi realistici ma non specifici (no nomi di asset reali)
   - Illustrano il concetto accademico
4. ERRORI COMUNI: Errori da evitare (1-2 errori comuni)
   - Basati su evidenze accademiche o best practice consolidate
5. APPROFONDIMENTI: "Per saperne di più, consulta la sezione Formazione o il Glossario di Tradelia" (sempre presente)

IMPORTANTE:
- DEFINIZIONI SEMPRE ACCADEMICHE: Ogni definizione deve essere basata su fonti accademiche ufficiali
- Evita "bla bla bla" inutili, sii conciso ma completo
- Massimo 4 paragrafi totali
- Massimo 5 punti per elenco
- Collega sempre teoria ↔ pratica
- Rimanda SEMPRE a formazione/glossario per approfondimenti
`
        : `
MANDATORY FORMAT - Tradelia 5-point schema:
1. ACADEMIC DEFINITION: Precise and verifiable definition based on official academic sources (1-2 sentences)
   - MANDATORY: Use only definitions from verified academic sources (textbooks, academic papers, official institutions)
   - NO invented or overly simplified definitions
   - Implicitly cite the source when possible (e.g., "according to modern financial theory...")
2. EXPLANATION: How it works, why it matters (2-3 sentences)
   - Based on verifiable academic principles
   - Connect to established financial theories
3. PRACTICAL EXAMPLES: Concrete and relevant examples (1-2 examples)
   - Realistic but non-specific examples (no real asset names)
   - Illustrate the academic concept
4. COMMON MISTAKES: Errors to avoid (1-2 common mistakes)
   - Based on academic evidence or established best practices
5. FURTHER LEARNING: "To learn more, check Tradelia's Education section or Glossary" (always present)

IMPORTANT:
- ALWAYS ACADEMIC DEFINITIONS: Every definition must be based on official academic sources
- Avoid unnecessary "bla bla bla", be concise but complete
- Maximum 4 paragraphs total
- Maximum 5 points per list
- Always connect theory ↔ practice
- Always refer to education/glossary for further learning
`
      : "";

  const brandVoice =
    locale === "it"
      ? `
IDENTITÀ TRADELIA: ${TRADELIA_BRAND_VOICE_MATRIX.identity.core}

PERSONALITÀ: ${TRADELIA_BRAND_VOICE_MATRIX.personality.traits.join(", ")}

PRINCIPI: Educazione prima di tutto, Rigore accademico, Rilevanza pratica, Accessibilità, Rispetto.

MIFID II: NON fornire consulenza finanziaria. Solo informazioni educative. Aggiungi SEMPRE un disclaimer MIFID II alla fine di ogni risposta, formattato come: "*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*"

${formatInstructions}
`
      : `
TRADELIA IDENTITY: ${TRADELIA_BRAND_VOICE_MATRIX.identity.core}

PERSONALITY: ${TRADELIA_BRAND_VOICE_MATRIX.personality.traits.join(", ")}

PRINCIPLES: Education first, Academic rigor, Practical relevance, Accessibility, Respect.

MIFID II: DO NOT provide financial advice. Only educational information. Always add a MIFID II disclaimer at the end of every response, formatted as: "*MIFID II Note: Information for educational purposes. Does not constitute financial advice.*"

${formatInstructions}
`;

  return `${basePrompt}\n\n${brandVoice}`;
}

// Groq AI (Primary - Free tier)
async function callGroqAI(
  message: string,
  conversationHistory: ChatMessage[] = [],
  locale: "it" | "en",
  context?: string,
  format?: "tradelia-5-points" | "simple"
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const systemPrompt = buildTradeliaSystemPrompt(locale, format);

  const contextPrompt = context
    ? `\n\nCONTESTO PAGINA: ${context}\nUsa questo contesto per personalizzare la risposta.`
    : "";

  const messages = [
    { role: "system", content: systemPrompt + contextPrompt },
    ...conversationHistory.slice(-5),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
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
    return data.choices[0]?.message?.content || "Mi dispiace, non ho ricevuto una risposta valida.";
  } catch (error) {
    console.warn("Groq AI error:", error);
    throw error;
  }
}

// Simple RAG fallback (basic glossary search, no complex setup)
async function simpleRAGFallback(query: string, locale: "it" | "en"): Promise<string> {
  // Simple template responses for common queries
  const queryLower = query.toLowerCase();

  if (queryLower.includes("sharpe") || queryLower.includes("sharpe ratio")) {
    return locale === "it"
      ? `**Sharpe Ratio**\n\nIl Sharpe Ratio misura il rendimento aggiustato per il rischio. Formula: (Rendimento Portafoglio - Tasso Risk-Free) / Deviazione Standard.\n\nValori:\n• > 1: Buono\n• > 2: Eccellente\n• > 3: Eccezionale\n\nUsa il calcolatore Sharpe Ratio nella sezione Utilities.\n\n*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**Sharpe Ratio**\n\nThe Sharpe Ratio measures risk-adjusted return. Formula: (Portfolio Return - Risk-Free Rate) / Standard Deviation.\n\nValues:\n• > 1: Good\n• > 2: Excellent\n• > 3: Exceptional\n\nUse the Sharpe Ratio calculator in the Utilities section.\n\n*MIFID II Note: Information for educational purposes. Does not constitute financial advice.*`;
  }

  if (queryLower.includes("pac") || queryLower.includes("piano accumulo")) {
    return locale === "it"
      ? `**PAC (Piano di Accumulo Capitale)**\n\nIl PAC prevede versamenti periodici per accumulare capitale nel tempo.\n\nVantaggi:\n• Diversificazione temporale\n• Riduzione rischio timing\n• Disciplina investimento\n\nUsa il simulatore PAC nella sezione Utilities.\n\n*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**PAC (Capital Accumulation Plan)**\n\nPAC involves periodic contributions to accumulate capital over time.\n\nBenefits:\n• Time diversification\n• Reduced timing risk\n• Investment discipline\n\nUse the PAC simulator in the Utilities section.\n\n*MIFID II Note: Information for educational purposes. Does not constitute financial advice.*`;
  }

  if (queryLower.includes("volatilità") || queryLower.includes("volatility")) {
    return locale === "it"
      ? `**Volatilità**\n\nLa volatilità misura la variabilità dei prezzi nel tempo. Alta volatilità = maggiore rischio ma anche maggiore potenziale rendimento.\n\nSi misura come deviazione standard dei rendimenti annui.\n\n*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**Volatility**\n\nVolatility measures price variability over time. High volatility = greater risk but also greater return potential.\n\nMeasured as standard deviation of annual returns.\n\n*MIFID II Note: Information for educational purposes. Does not constitute financial advice.*`;
  }

  // Default response
  return locale === "it"
    ? `Grazie per la tua domanda! Sono l'assistente AI di Tradelia.\n\nPosso aiutarti con:\n• Termini finanziari (Sharpe Ratio, Volatilità, Hedging, PAC)\n• Strumenti finanziari (Calcolatori, Simulatori)\n• Report e analisi\n• Funzionalità piattaforma\n\nConsulta la sezione FAQ per risposte rapide o prova a riformulare la domanda.\n\n*Nota: Le risposte sono a scopo educativo. Non costituiscono consulenza finanziaria.*`
    : `Thanks for your question! I'm Tradelia's AI assistant.\n\nI can help with:\n• Financial terms (Sharpe Ratio, Volatility, Hedging, PAC)\n• Financial tools (Calculators, Simulators)\n• Reports and analysis\n• Platform features\n\nCheck the FAQ section for quick answers or try rephrasing your question.\n\n*Note: Answers are for educational purposes. They do not constitute financial advice.*`;
}

// Rate limit configuration for AI chat
const AI_CHAT_RATE_LIMIT = { maxRequests: 30, windowMs: 60 * 1000 }; // 30 req/min

// Max conversation history length
const MAX_CONVERSATION_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONTEXT_LENGTH = 500;

export async function POST(request: NextRequest) {
  let body: ChatRequest;
  
  try {
    // Parse body early to get locale for rate limit message
    body = await request.json();
  } catch (parseError) {
    console.error("Failed to parse request body:", parseError);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const {
      message,
      locale = "it",
      conversationHistory = [],
      context,
      format = "tradelia-5-points",
    } = body;

    // Get API messages for locale
    const { getApiMessages } = await import('@/lib/i18n/api-messages');
    const messages = getApiMessages(locale);

    // Rate limiting - Best Practice: Prevent abuse
    const ip = getClientIP(request);
    const rateLimitKey = getRateLimitKey(`ai-chat:${ip}`, 'ai-chat');
    const rateLimit = checkRateLimit(rateLimitKey, AI_CHAT_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: messages.errors.rateLimitExceeded, 
          resetAt: rateLimit.resetAt,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(AI_CHAT_RATE_LIMIT.maxRequests),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          }
        }
      );
    }

    // Input validation - Best Practice: Validate and sanitize
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: messages.errors.messageRequired }, { status: 400 });
    }

    // Sanitize and validate message length
    const sanitizedMessage = sanitizeString(message);
    if (sanitizedMessage.length === 0) {
      return NextResponse.json({ error: messages.errors.messageRequired }, { status: 400 });
    }
    if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ 
        error: messages.errors.messageTooLong(MAX_MESSAGE_LENGTH)
      }, { status: 400 });
    }

    // Validate locale
    if (locale !== "it" && locale !== "en") {
      return NextResponse.json({ error: messages.errors.invalidLocale }, { status: 400 });
    }

    // Limit conversation history - Best Practice: Prevent token waste
    const limitedHistory = conversationHistory.slice(-MAX_CONVERSATION_HISTORY);

    // Sanitize context
    const sanitizedContext = context ? sanitizeString(context).slice(0, MAX_CONTEXT_LENGTH) : undefined;

    let response: string;
    let model = "fallback";
    let provider = "none";

    // 1. Try Groq (primary - free tier)
    try {
      response = await callGroqAI(sanitizedMessage, limitedHistory, locale, sanitizedContext, format);
      model = "llama-3.3-70b";
      provider = "groq";
    } catch (groqError) {
      console.warn("Groq failed, using simple RAG fallback:", groqError);

      // 2. Simple RAG fallback (no complex setup)
      response = await simpleRAGFallback(sanitizedMessage, locale);
      model = "simple-rag";
      provider = "fallback";
    }

    // Sanitize response - Best Practice: Prevent XSS
    const sanitizedResponse = sanitizeString(response);

    return NextResponse.json({
      response: sanitizedResponse,
      model,
      provider,
    }, {
      headers: {
        'X-RateLimit-Limit': String(AI_CHAT_RATE_LIMIT.maxRequests),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.resetAt),
      }
    });
  } catch (error) {
    console.error("Error in AI chat API:", error);

    // Final fallback - use already parsed body, don't parse again
    const locale = body?.locale || "it";

    const fallbackResponse =
      locale === "it"
        ? "Mi dispiace, si è verificato un errore. Riprova più tardi o consulta la sezione FAQ."
        : "Sorry, an error occurred. Please try again later or check the FAQ section.";

    return NextResponse.json({
      response: fallbackResponse,
      model: "fallback",
      provider: "error",
      error: "Service temporarily unavailable",
    }, { status: 500 });
  }
}
