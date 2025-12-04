import { NextRequest, NextResponse } from 'next/server';
import { TRADELIA_AI_SYSTEM_PROMPT } from '@/lib/ai/tradelia-ai-communication-style';
import { TRADELIA_BRAND_VOICE_MATRIX } from '@/lib/ai/tradelia-brand-voice-matrix';
import { loadGlossaryTerms } from '@/lib/glossary/terms';

/**
 * AI Chat API - FREE VERSION
 * Uses Hugging Face Inference API (100% FREE) for real AI responses
 * Fallback to intelligent RAG-based template responses
 * 
 * FREE Options:
 * 1. Hugging Face Inference API - Completely free, no credit card needed
 * 2. Template-based RAG - Intelligent responses from glossary + templates
 * 
 * No costs, no API keys required for basic functionality
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

// Hugging Face FREE API (no key required for public models)
async function callHuggingFaceAI(
  message: string,
  conversationHistory: ChatMessage[] = [],
  locale: 'it' | 'en'
): Promise<string> {
  // Use free public model - no API key needed
  // Model: meta-llama/Llama-2-7b-chat-hf (free, public)
  const model = 'meta-llama/Llama-2-7b-chat-hf';
  
  const systemPrompt = buildTradeliaSystemPrompt(locale);
  
  // Build conversation context
  const conversationText = conversationHistory
    .slice(-3)
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');
  
  const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationText}\n\nUser: ${message}\nAssistant:`;

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      // If model is loading, fallback to RAG
      if (response.status === 503) {
        throw new Error('Model loading, using RAG fallback');
      }
      throw new Error(`HF API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle array response
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }
    
    if (data.generated_text) {
      return data.generated_text.trim();
    }
    
    throw new Error('Unexpected response format');
  } catch (error) {
    console.warn('Hugging Face API error, using RAG fallback:', error);
    throw error;
  }
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

// Enhanced RAG-based response (100% FREE, no API calls)
async function generateRAGResponse(
  query: string,
  locale: 'it' | 'en'
): Promise<string> {
  // Load glossary as knowledge base
  const glossaryData = await loadGlossaryTerms(locale);
  
  // Enhanced keyword matching
  const queryLower = query.toLowerCase();
  const stopWords = locale === 'it' 
    ? ['cosa', 'cos', 'è', 'come', 'funziona', 'spiegami', 'dimmi', 'che', 'chi', 'quando', 'dove', 'perché', 'il', 'la', 'lo', 'gli', 'le', 'un', 'una', 'uno', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra']
    : ['what', 'is', 'how', 'does', 'work', 'explain', 'tell', 'me', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  const queryWords = queryLower
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));

  // Find relevant terms
  const relevantTerms: Array<{ term: any; score: number }> = [];

  for (const [key, term] of Object.entries(glossaryData)) {
    let score = 0;

    // Exact title match
    if (term.title?.toLowerCase() === queryLower) {
      score += 20;
    } else if (term.title?.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Word matching
    queryWords.forEach(word => {
      if (term.title?.toLowerCase().includes(word)) {
        score += 5;
      }
    });

    // Content matching
    const whatText = term.academicDefinition?.what || term.what || '';
    const howText = term.tradeliaExplanation?.howToUse || term.how || '';
    const explanationText = term.tradeliaExplanation?.whatDoes || '';

    [whatText, howText, explanationText].forEach(text => {
      if (text.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      queryWords.forEach(word => {
        if (text.toLowerCase().includes(word)) {
          score += 2;
        }
      });
    });

    // Tag matching
    if (term.tags?.some((tag: string) => {
      const tagLower = tag.toLowerCase();
      return tagLower === queryLower || queryWords.some(word => tagLower.includes(word));
    })) {
      score += 3;
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

  // Generate intelligent response from glossary
  if (topTerms.length === 0) {
    return locale === 'it'
      ? `Grazie per la tua domanda! Sono l'assistente di Tradelia.\n\nNon ho trovato informazioni specifiche su questo argomento nel nostro knowledge base. Posso aiutarti con:\n\n• Termini finanziari (Sharpe Ratio, Volatilità, Hedging, ecc.)\n• Strumenti finanziari (Calcolatori, Simulatori PAC)\n• Report e analisi\n• Funzionalità della piattaforma\n\n*Nota: Le risposte sono a scopo educativo. Non costituiscono consulenza finanziaria.*`
      : `Thanks for your question! I'm Tradelia's assistant.\n\nI couldn't find specific information about this topic in our knowledge base. I can help with:\n\n• Financial terms (Sharpe Ratio, Volatility, Hedging, etc.)\n• Financial tools (Calculators, PAC Simulators)\n• Reports and analysis\n• Platform features\n\n*Note: Answers are for educational purposes. They do not constitute financial advice.*`;
  }

  const term = topTerms[0];
  let response = '';

  if (locale === 'it') {
    response = `**${term.title}**\n\n`;
    
    // Cosa fa
    const definition = term.academicDefinition?.what || term.what;
    if (definition) {
      response += `**Cosa fa:**\n${definition}\n\n`;
    }
    
    // Come si usa
    const explanation = term.tradeliaExplanation?.whatDoes || term.tradeliaExplanation?.howToUse || term.how;
    if (explanation) {
      response += `**Come si usa:**\n${explanation}\n\n`;
    }
    
    // Contesto accademico
    if (term.academicDefinition?.academicContext) {
      response += `**Contesto:** ${term.academicDefinition.academicContext}\n\n`;
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

    response += `*Nota MIFID II: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`;
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
      response += `**Context:** ${term.academicDefinition.academicContext}\n\n`;
    }
    
    const source = term.academicDefinition?.source || term.source;
    if (source) {
      response += `*Source: ${source}*\n\n`;
    }

    if (topTerms.length > 1) {
      response += `**Related terms:** ${topTerms.slice(1).map(t => t.title).join(', ')}\n\n`;
    }

    response += `*MIFID II Note: Information for educational purposes. Does not constitute financial advice.*`;
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

    let response: string;
    let model = 'rag-fallback';

    // Try Hugging Face FREE API first (no key needed)
    try {
      response = await callHuggingFaceAI(message, conversationHistory, locale);
      model = 'huggingface-llama2-7b';
    } catch (error) {
      // Fallback to intelligent RAG (100% free, no API calls)
      console.log('Using RAG fallback (free)');
      response = await generateRAGResponse(message, locale);
      model = 'rag-intelligent';
    }

    return NextResponse.json({
      response,
      model,
      free: true, // Always free
    });
  } catch (error) {
    console.error('Error in AI chat API:', error);
    
    // Final fallback
    const body = await request.json().catch(() => ({}));
    const locale = (body as ChatRequest)?.locale || 'it';
    const message = (body as ChatRequest)?.message || '';
    
    const fallbackResponse = locale === 'it'
      ? 'Mi dispiace, si è verificato un errore. Riprova più tardi o consulta la sezione FAQ.'
      : 'Sorry, an error occurred. Please try again later or check the FAQ section.';
    
    return NextResponse.json({
      response: fallbackResponse,
      model: 'fallback',
      free: true,
      error: 'Service temporarily unavailable',
    });
  }
}
