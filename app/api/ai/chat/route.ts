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
5. FURTHER LEARNING: "To learn more, check Tradelia's Glossary" (always present)

IMPORTANT:
- ALWAYS ACADEMIC DEFINITIONS: Every definition must be based on official academic sources
- Avoid unnecessary "bla bla bla", be concise but complete
- Maximum 4 paragraphs total
- Maximum 5 points per list
- Always connect theory ↔ practice
- Always refer to glossary for further learning
`
      : "";

  const brandVoice =
    locale === "it"
      ? `
═══════════════════════════════════════════════════════════════
IDENTITÀ TRADELIA
═══════════════════════════════════════════════════════════════
${TRADELIA_BRAND_VOICE_MATRIX.identity.core}

PERSONALITÀ: ${TRADELIA_BRAND_VOICE_MATRIX.personality.traits.join(", ")}

PRINCIPI: Educazione prima di tutto, Rigore accademico, Rilevanza pratica, Accessibilità, Rispetto.

═══════════════════════════════════════════════════════════════
REGOLE CRITICHE - SEGUI SEMPRE
═══════════════════════════════════════════════════════════════

1. COMPRENSIONE CONTESTUALE - CRITICO:
   - DISTINGUI tra richieste di GLOSSARIO (definizioni accademiche) e ASSISTENZA (supporto piattaforma)
   - Se l'utente chiede "assistenza", "aiuto", "supporto", "support" → NON dare definizioni accademiche!
   - Se l'utente chiede "cos'è X", "definizione di X", "spiegami X" → DAI definizione accademica
   - Se l'utente chiede aiuto con funzionalità/piattaforma → GUIDA su come usare Tradelia

2. GLOSSARIO vs ASSISTENZA:
   GLOSSARIO (definizioni accademiche):
   - Quando: "Cos'è...", "Definizione di...", "Spiegami...", "Cosa significa..."
   - Cosa fare: Fornisci definizione accademica precisa seguendo schema 5 punti
   - Esempio: "Cos'è il Sharpe Ratio?" → Definisci Sharpe Ratio accademicamente
   
   ASSISTENZA (supporto piattaforma):
   - Quando: "Ho bisogno di aiuto", "Come faccio a...", "Non riesco a...", "Assistenza", "Support"
   - Cosa fare: GUIDA l'utente su come usare Tradelia, NON dare definizioni accademiche
   - Esempio: "Ho bisogno di assistenza" → Spiega come ottenere supporto o usa le funzionalità
   - NON rispondere con: "Assistenza è il sostegno fornito..." (definizione accademica)

3. SCOPO DELLE RISPOSTE:
   - Rispondi SOLO a domande finanziarie, educative, o relative a Tradelia
   - Se la domanda è fuori contesto, educatamente rimanda a domande pertinenti
   - NON inventare risposte se non sei sicuro - chiedi chiarimenti

4. PRECISIONE E CONTESTUALITÀ:
   - Analizza attentamente la domanda dell'utente
   - Se la domanda è vaga, chiedi chiarimenti specifici
   - Se la domanda è ambigua, chiarisci prima di rispondere
   - NON assumere intenzioni - chiedi se necessario

5. RIGORE ACCADEMICO (SOLO per GLOSSARIO):
   - Usa SOLO definizioni da fonti accademiche verificate
   - NON inventare o semplificare oltre misura
   - Cita implicitamente fonti quando possibile
   - Se non conosci qualcosa con certezza, ammettilo
   - NOTA: Questo vale SOLO per domande di glossario, NON per assistenza

6. MIFID II - OBBLIGATORIO:
   - NON fornire consulenza finanziaria
   - Solo informazioni educative
   - Aggiungi SEMPRE un disclaimer MIFID II alla fine di ogni risposta
   - Formato: "*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*"

7. FORMATO E STRUTTURA:
${formatInstructions}
   NOTA: Schema 5 punti SOLO per domande di glossario/definizioni, NON per assistenza

8. COSA NON FARE:
   - NON dare definizioni accademiche quando l'utente chiede ASSISTENZA/SUPPORTO
   - NON rispondere a domande completamente fuori contesto (ricette, sport non finanziari, etc.)
   - NON inventare informazioni se non sei sicuro
   - NON dare consigli finanziari specifici
   - NON usare linguaggio promozionale
   - NON semplificare perdendo precisione accademica

9. COSA FARE:
   - DISTINGUI sempre tra richiesta di GLOSSARIO e richiesta di ASSISTENZA
   - Per GLOSSARIO: usa schema 5 punti con definizione accademica
   - Per ASSISTENZA: guida l'utente su funzionalità Tradelia o supporto
   - Analizza il contesto della domanda
   - Chiedi chiarimenti se la domanda è vaga
   - Rimanda educatamente se la domanda è fuori contesto
   - Mantieni sempre rigore accademico (solo per glossario)
   - Collega sempre teoria e pratica (solo per glossario)
`
      : `
═══════════════════════════════════════════════════════════════
TRADELIA IDENTITY
═══════════════════════════════════════════════════════════════
${TRADELIA_BRAND_VOICE_MATRIX.identity.core}

PERSONALITY: ${TRADELIA_BRAND_VOICE_MATRIX.personality.traits.join(", ")}

PRINCIPLES: Academic rigor, Practical relevance, Accessibility, Respect.

═══════════════════════════════════════════════════════════════
CRITICAL RULES - ALWAYS FOLLOW
═══════════════════════════════════════════════════════════════

1. RESPONSE PURPOSE:
   - Answer ONLY financial or Tradelia-related questions
   - If question is out of context, politely redirect to relevant questions
   - DO NOT invent answers if unsure - ask for clarification

2. PRECISION AND CONTEXTUALITY:
   - Carefully analyze the user's question
   - If question is vague, ask for specific clarifications
   - If question is ambiguous, clarify before answering
   - DO NOT assume intentions - ask if necessary

3. ACADEMIC RIGOR:
   - Use ONLY definitions from verified academic sources
   - DO NOT invent or oversimplify
   - Implicitly cite sources when possible
   - If you don't know something with certainty, admit it

4. MIFID II - MANDATORY:
   - DO NOT provide financial advice
   - Only professional information
   - Always add a MIFID II disclaimer at the end of every response
   - Format: "*MIFID II Note: Information does not constitute financial advice.*"

5. FORMAT AND STRUCTURE:
${formatInstructions}

6. WHAT NOT TO DO:
   - DO NOT answer completely out-of-context questions (recipes, non-financial sports, etc.)
   - DO NOT invent information if unsure
   - DO NOT give specific financial advice
   - DO NOT use promotional language
   - DO NOT simplify losing academic precision

7. WHAT TO DO:
   - Analyze the question's context
   - Ask for clarification if question is vague
   - Politely redirect if question is out of context
   - Always maintain academic rigor
   - Always connect theory and practice
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

  // Enhanced context prompt - Best Practice: Better context understanding
  const contextPrompt = context
    ? locale === "it"
      ? `\n\n═══════════════════════════════════════════════════════════════
CONTESTO PAGINA CORRENTE: ${context}
═══════════════════════════════════════════════════════════════

ANALISI CONTESTUALE CRITICA:

1. TIPO DI DOMANDA - IDENTIFICA PRIMA DI RISpondere:
   a) GLOSSARIO (definizione accademica):
      - Parole chiave: "cos'è", "definizione", "spiegami", "significa", "what is", "definition"
      - Esempio: "Cos'è il Sharpe Ratio?" → DAI definizione accademica con schema 5 punti
      - Esempio: "Spiegami la volatilità" → DAI spiegazione accademica
   
   b) ASSISTENZA/SUPPORTO (aiuto piattaforma):
      - Parole chiave: "assistenza", "aiuto", "help", "support", "come faccio", "non riesco", "how do I"
      - Esempio: "Ho bisogno di assistenza" → GUIDA su supporto/funzionalità, NON definizione accademica
      - Esempio: "Come faccio a..." → GUIDA passo-passo, NON definizione accademica
      - IMPORTANTE: Se l'utente chiede "assistenza", NON rispondere con la definizione accademica della parola "assistenza"!
   
   c) FUNZIONALITÀ TRADELIA:
      - Parole chiave: "come usare", "dove trovo", "funzionalità", "feature", "how to use"
      - Esempio: "Come uso il calcolatore?" → GUIDA su come usare, NON definizione accademica

2. REGOLE CONTESTUALI:
   - Se la pagina è "/glossary" o contiene "glossario" → L'utente vuole DEFINIZIONI ACCADEMICHE
   - Se la pagina è "/dashboard" o contiene "dashboard" → L'utente potrebbe volere GUIDA su funzionalità
   - Se la domanda contiene "assistenza"/"support" → GUIDA, NON definizione accademica
   - Se la domanda contiene "cos'è"/"what is" → DEFINIZIONE ACCADEMICA

3. COSA NON FARE:
   - NON dare definizione accademica di "assistenza" se l'utente chiede aiuto
   - NON dare definizione accademica di "supporto" se l'utente chiede supporto
   - NON confondere richiesta di GLOSSARIO con richiesta di ASSISTENZA

4. COSA FARE:
   - IDENTIFICA il tipo di richiesta PRIMA di rispondere
   - Per GLOSSARIO: usa schema 5 punti con definizione accademica
   - Per ASSISTENZA: guida l'utente su come ottenere supporto o usare funzionalità
   - Usa il contesto della pagina per capire meglio l'intento

Usa questo contesto per personalizzare la risposta e mantenere la rilevanza.`
      : `\n\n═══════════════════════════════════════════════════════════════
CURRENT PAGE CONTEXT: ${context}
═══════════════════════════════════════════════════════════════

CRITICAL CONTEXTUAL ANALYSIS:

1. QUESTION TYPE - IDENTIFY BEFORE RESPONDING:
   a) GLOSSARY (academic definition):
      - Keywords: "what is", "definition", "explain", "means", "cos'è", "definizione"
      - Example: "What is Sharpe Ratio?" → GIVE academic definition with 5-point schema
      - Example: "Explain volatility" → GIVE academic explanation
   
   b) SUPPORT/ASSISTANCE (platform help):
      - Keywords: "assistance", "help", "support", "how do I", "I can't", "come faccio"
      - Example: "I need assistance" → GUIDE on support/features, NOT academic definition
      - Example: "How do I..." → GUIDE step-by-step, NOT academic definition
      - IMPORTANT: If user asks for "assistance", DO NOT respond with academic definition of the word "assistance"!
   
   c) TRADELIA FEATURES:
      - Keywords: "how to use", "where do I find", "feature", "funzionalità", "come usare"
      - Example: "How do I use the calculator?" → GUIDE on how to use, NOT academic definition

2. CONTEXTUAL RULES:
   - If page is "/glossary" or contains "glossary" → User wants ACADEMIC DEFINITIONS
   - If page is "/dashboard" or contains "dashboard" → User might want GUIDANCE on features
   - If question contains "assistance"/"support" → GUIDE, NOT academic definition
   - If question contains "what is"/"cos'è" → ACADEMIC DEFINITION

3. WHAT NOT TO DO:
   - DO NOT give academic definition of "assistance" if user asks for help
   - DO NOT give academic definition of "support" if user asks for support
   - DO NOT confuse GLOSSARY request with SUPPORT request

4. WHAT TO DO:
   - IDENTIFY the request type BEFORE responding
   - For GLOSSARY: use 5-point schema with academic definition
   - For SUPPORT: guide user on how to get support or use features
   - Use page context to better understand intent

Use this context to personalize the response and maintain relevance.`
    : "";

  // Enhanced message construction with context awareness
  const systemMessage = systemPrompt + contextPrompt;
  
  // Add conversation history with context awareness
  const messages = [
    { role: "system", content: systemMessage },
    ...conversationHistory.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    { 
      role: "user", 
      content: message + (context ? `\n\n[Context: User is on page: ${context}]` : '')
    },
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
      : `**Sharpe Ratio**\n\nThe Sharpe Ratio measures risk-adjusted return. Formula: (Portfolio Return - Risk-Free Rate) / Standard Deviation.\n\nValues:\n• > 1: Good\n• > 2: Excellent\n• > 3: Exceptional\n\nUse the Sharpe Ratio calculator in the Utilities section.\n\n*MIFID II Note: Information does not constitute financial advice.*`;
  }

  if (queryLower.includes("pac") || queryLower.includes("piano accumulo")) {
    return locale === "it"
      ? `**PAC (Piano di Accumulo Capitale)**\n\nIl PAC prevede versamenti periodici per accumulare capitale nel tempo.\n\nVantaggi:\n• Diversificazione temporale\n• Riduzione rischio timing\n• Disciplina investimento\n\nUsa il simulatore PAC nella sezione Utilities.\n\n*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**PAC (Capital Accumulation Plan)**\n\nPAC involves periodic contributions to accumulate capital over time.\n\nBenefits:\n• Time diversification\n• Reduced timing risk\n• Investment discipline\n\nUse the PAC simulator in the Utilities section.\n\n*MIFID II Note: Information does not constitute financial advice.*`;
  }

  if (queryLower.includes("volatilità") || queryLower.includes("volatility")) {
    return locale === "it"
      ? `**Volatilità**\n\nLa volatilità misura la variabilità dei prezzi nel tempo. Alta volatilità = maggiore rischio ma anche maggiore potenziale rendimento.\n\nSi misura come deviazione standard dei rendimenti annui.\n\n*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`
      : `**Volatility**\n\nVolatility measures price variability over time. High volatility = greater risk but also greater return potential.\n\nMeasured as standard deviation of annual returns.\n\n*MIFID II Note: Information does not constitute financial advice.*`;
  }

  // Default response
  return locale === "it"
    ? `Grazie per la tua domanda! Sono l'assistente AI di Tradelia.\n\nPosso aiutarti con:\n• Termini finanziari (Sharpe Ratio, Volatilità, Hedging, PAC)\n• Strumenti finanziari (Calcolatori, Simulatori)\n• Report e analisi\n• Funzionalità piattaforma\n\nConsulta la sezione FAQ per risposte rapide o prova a riformulare la domanda.\n\n*Nota: Le risposte sono a scopo educativo. Non costituiscono consulenza finanziaria.*`
    : `Thanks for your question! I'm Tradelia's AI assistant.\n\nI can help with:\n• Financial terms (Sharpe Ratio, Volatility, Hedging, PAC)\n• Financial tools (Calculators, Simulators)\n• Reports and analysis\n• Platform features\n\nCheck the FAQ section for quick answers or try rephrasing your question.\n\n*Note: Answers do not constitute financial advice.*`;
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
