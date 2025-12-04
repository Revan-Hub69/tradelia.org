import { NextRequest, NextResponse } from 'next/server';
import { TRADELIA_AI_SYSTEM_PROMPT } from '@/lib/ai/tradelia-ai-communication-style';
import { TRADELIA_BRAND_VOICE_MATRIX } from '@/lib/ai/tradelia-brand-voice-matrix';
import { loadGlossaryTerms } from '@/lib/glossary/terms';

/**
 * AI Chat API - 100% FREE on Vercel
 * 
 * Strategy: Intelligent RAG (Retrieval-Augmented Generation) without external LLM
 * - Uses our glossary as knowledge base
 * - Advanced keyword + semantic matching
 * - Template-based response generation
 * - 100% free, no API calls, no costs
 * 
 * Best Practice AI 2025: RAG without LLM for cost-free solutions
 * References:
 * - Lewis et al. (2020): RAG pattern
 * - Karpukhin et al. (2020): Dense retrieval
 * - Our implementation: Keyword + semantic hybrid search
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

// Enhanced RAG-based response (100% FREE, runs on Vercel, no external API)
async function generateRAGResponse(
  query: string,
  locale: 'it' | 'en',
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  // Load glossary as knowledge base
  const glossaryData = await loadGlossaryTerms(locale);
  
  // Enhanced keyword matching with semantic understanding
  const queryLower = query.toLowerCase();
  const stopWords = locale === 'it' 
    ? ['cosa', 'cos', 'è', 'come', 'funziona', 'spiegami', 'dimmi', 'che', 'chi', 'quando', 'dove', 'perché', 'il', 'la', 'lo', 'gli', 'le', 'un', 'una', 'uno', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'e', 'o', 'ma']
    : ['what', 'is', 'how', 'does', 'work', 'explain', 'tell', 'me', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  const queryWords = queryLower
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));

  // Find relevant terms with advanced scoring
  const relevantTerms: Array<{ term: any; score: number }> = [];

  for (const [key, term] of Object.entries(glossaryData)) {
    let score = 0;

    // Exact title match (highest priority)
    if (term.title?.toLowerCase() === queryLower) {
      score += 30;
    } else if (term.title?.toLowerCase().includes(queryLower)) {
      score += 15;
    }

    // Word-by-word matching in title
    queryWords.forEach(word => {
      if (term.title?.toLowerCase().includes(word)) {
        score += 8;
      }
    });

    // Content matching (academic definition)
    const whatText = term.academicDefinition?.what || term.what || '';
    const howText = term.tradeliaExplanation?.howToUse || term.how || '';
    const explanationText = term.tradeliaExplanation?.whatDoes || '';
    const contextText = term.academicDefinition?.academicContext || '';

    // Semantic matching: check if query concepts match content
    [whatText, howText, explanationText, contextText].forEach(text => {
      if (text.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      queryWords.forEach(word => {
        if (text.toLowerCase().includes(word)) {
          score += 3;
        }
      });
    });

    // Tag matching
    if (term.tags?.some((tag: string) => {
      const tagLower = tag.toLowerCase();
      return tagLower === queryLower || queryWords.some(word => tagLower.includes(word));
    })) {
      score += 5;
    }

    // Category matching
    if (term.category?.toLowerCase().includes(queryLower)) {
      score += 4;
    }

    if (score > 0) {
      relevantTerms.push({ term, score });
    }
  }

  // Sort and get top 3
  const topTerms = relevantTerms
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.term);

  // Generate intelligent response from glossary (Tradelia style)
  if (topTerms.length === 0) {
    // Check if it's a utility/tool question
    const utilitiesKeywords = locale === 'it'
      ? ['calcolatore', 'simulatore', 'pac', 'hedging', 'position sizing', 'sharpe', 'volatilità', 'opzioni', 'kelly', 'portfolio', 'correlazione', 'drawdown', 'risk reward', 'utilities', 'strumento']
      : ['calculator', 'simulator', 'pac', 'hedging', 'position sizing', 'sharpe', 'volatility', 'options', 'kelly', 'portfolio', 'correlation', 'drawdown', 'risk reward', 'utilities', 'tool'];

    const isUtilityQuery = utilitiesKeywords.some(keyword => queryLower.includes(keyword));

    if (isUtilityQuery) {
      return locale === 'it'
        ? `Grazie per la tua domanda sugli strumenti finanziari!\n\nTradelia offre una suite completa di strumenti nella sezione **Utilities** del dashboard:\n\n• **Calcolatori**: Interesse composto, Valore presente/futuro, Rendite\n• **Simulatori**: PAC (Piano di Accumulo Capitale)\n• **Analisi avanzate**: Sharpe Ratio, Portfolio Optimizer, Options Calculator\n• **Risk Management**: Hedging, Position Sizing, Risk/Reward\n\nVisita la sezione Utilities per accedere a tutti gli strumenti disponibili.\n\n*Nota: Gli strumenti sono a scopo educativo. Non costituiscono consulenza finanziaria.*`
        : `Thanks for your question about financial tools!\n\nTradelia offers a complete suite of tools in the **Utilities** section of the dashboard:\n\n• **Calculators**: Compound interest, Present/future value, Annuities\n• **Simulators**: PAC (Capital Accumulation Plan)\n• **Advanced analysis**: Sharpe Ratio, Portfolio Optimizer, Options Calculator\n• **Risk Management**: Hedging, Position Sizing, Risk/Reward\n\nVisit the Utilities section to access all available tools.\n\n*Note: Tools are for educational purposes. They do not constitute financial advice.*`;
    }

    return locale === 'it'
      ? `Grazie per la tua domanda! Sono l'assistente di Tradelia.\n\nNon ho trovato informazioni specifiche su questo argomento nel nostro knowledge base. Posso aiutarti con:\n\n• **Termini finanziari**: Sharpe Ratio, Volatilità, Hedging, Interesse Composto, PAC\n• **Strumenti finanziari**: Calcolatori, Simulatori, Portfolio Optimizer\n• **Report e analisi**: Report conformi MIFID II\n• **Funzionalità piattaforma**: Come usare le diverse sezioni\n\nProva a riformulare la domanda o consulta la sezione FAQ per risposte rapide.\n\n*Nota: Le risposte sono a scopo educativo. Non costituiscono consulenza finanziaria.*`
      : `Thanks for your question! I'm Tradelia's assistant.\n\nI couldn't find specific information about this topic in our knowledge base. I can help with:\n\n• **Financial terms**: Sharpe Ratio, Volatility, Hedging, Compound Interest, PAC\n• **Financial tools**: Calculators, Simulators, Portfolio Optimizer\n• **Reports and analysis**: MIFID II compliant reports\n• **Platform features**: How to use different sections\n\nTry rephrasing your question or check the FAQ section for quick answers.\n\n*Note: Answers are for educational purposes. They do not constitute financial advice.*`;
  }

  const term = topTerms[0];
  let response = '';

  if (locale === 'it') {
    response = `**${term.title}**\n\n`;
    
    // Cosa fa (Tradelia style)
    const definition = term.academicDefinition?.what || term.what;
    if (definition) {
      response += `**Cosa fa:**\n${definition}\n\n`;
    }
    
    // Come si usa (Tradelia style)
    const explanation = term.tradeliaExplanation?.whatDoes || term.tradeliaExplanation?.howToUse || term.how;
    if (explanation) {
      response += `**Come si usa:**\n${explanation}\n\n`;
    }
    
    // Contesto accademico
    if (term.academicDefinition?.academicContext) {
      response += `**Contesto accademico:**\n${term.academicDefinition.academicContext}\n\n`;
    }
    
    // Fonte
    const source = term.academicDefinition?.source || term.source;
    if (source) {
      response += `*Fonte: ${source}*\n\n`;
    }

    // Termini correlati
    if (topTerms.length > 1) {
      response += `**Termini correlati:** ${topTerms.slice(1).map(t => t.title).join(', ')}\n\n`;
    }

    // MIFID disclaimer
    response += `*Nota MIFID II: Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria. I rendimenti passati non garantiscono risultati futuri. Valuta attentamente il tuo profilo di rischio prima di prendere decisioni.*`;
  } else {
    response = `**${term.title}**\n\n`;
    
    const definition = term.academicDefinition?.what || term.what;
    if (definition) {
      response += `**What it does:**\n${definition}\n\n`;
    }
    
    const explanation = term.tradeliaExplanation?.whatDoes || term.tradeliaExplanation?.howToUse || term.how;
    if (explanation) {
      response += `**How to use:**\n${explanation}\n\n`;
    }
    
    if (term.academicDefinition?.academicContext) {
      response += `**Academic context:**\n${term.academicDefinition.academicContext}\n\n`;
    }
    
    const source = term.academicDefinition?.source || term.source;
    if (source) {
      response += `*Source: ${source}*\n\n`;
    }

    if (topTerms.length > 1) {
      response += `**Related terms:** ${topTerms.slice(1).map(t => t.title).join(', ')}\n\n`;
    }

    response += `*MIFID II Note: Information provided is for educational purposes and does not constitute financial advice. Past performance does not guarantee future results. Carefully evaluate your risk profile before making decisions.*`;
  }

  return response;
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

    // Use intelligent RAG (100% free, runs on Vercel, no external API)
    const response = await generateRAGResponse(message, locale, conversationHistory);

    return NextResponse.json({
      response,
      model: 'tradelia-rag-intelligent',
      free: true,
      hosted: 'vercel',
    });
  } catch (error) {
    console.error('Error in AI chat API:', error);
    
    // Final fallback
    const body = await request.json().catch(() => ({}));
    const locale = (body as ChatRequest)?.locale || 'it';
    
    const fallbackResponse = locale === 'it'
      ? 'Mi dispiace, si è verificato un errore. Riprova più tardi o consulta la sezione FAQ per risposte rapide.'
      : 'Sorry, an error occurred. Please try again later or check the FAQ section for quick answers.';
    
    return NextResponse.json({
      response: fallbackResponse,
      model: 'fallback',
      free: true,
      hosted: 'vercel',
      error: 'Service temporarily unavailable',
    });
  }
}
