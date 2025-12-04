import { NextRequest, NextResponse } from 'next/server';
import { loadGlossaryTerms } from '@/lib/glossary/terms';

/**
 * AI Chat API
 * Provides AI-powered responses using glossary and context
 * 
 * TODO: Integrate with real AI service (OpenAI, Anthropic, etc.)
 * For now, uses enhanced RAG pattern with glossary as knowledge base
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

// Enhanced keyword-based retrieval
function findRelevantTerms(query: string, glossaryData: Record<string, any>, locale: 'it' | 'en'): any[] {
  const queryLower = query.toLowerCase();
  const stopWords = locale === 'it' 
    ? ['cosa', 'cos', 'è', 'come', 'funziona', 'spiegami', 'dimmi', 'che', 'chi', 'quando', 'dove', 'perché', 'il', 'la', 'lo', 'gli', 'le', 'un', 'una', 'uno', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra']
    : ['what', 'is', 'how', 'does', 'work', 'explain', 'tell', 'me', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  const queryWords = queryLower
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));

  const relevantTerms: Array<{ key: string; term: any; score: number }> = [];

  for (const [key, term] of Object.entries(glossaryData)) {
    let score = 0;

    if (term.title?.toLowerCase() === queryLower) {
      score += 20;
    } else if (term.title?.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    queryWords.forEach(word => {
      if (term.title?.toLowerCase().includes(word)) {
        score += 5;
      }
    });

    const whatText = term.academicDefinition?.what || term.what;
    if (whatText) {
      if (whatText.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      queryWords.forEach(word => {
        if (whatText.toLowerCase().includes(word)) {
          score += 2;
        }
      });
    }

    const howText = term.tradeliaExplanation?.howToUse || term.how;
    if (howText) {
      if (howText.toLowerCase().includes(queryLower)) {
        score += 3;
      }
      queryWords.forEach(word => {
        if (howText.toLowerCase().includes(word)) {
          score += 1;
        }
      });
    }

    if (term.tradeliaExplanation?.whatDoes) {
      if (term.tradeliaExplanation.whatDoes.toLowerCase().includes(queryLower)) {
        score += 4;
      }
      queryWords.forEach(word => {
        if (term.tradeliaExplanation.whatDoes.toLowerCase().includes(word)) {
          score += 2;
        }
      });
    }

    if (term.tags?.some((tag: string) => {
      const tagLower = tag.toLowerCase();
      return tagLower === queryLower || queryWords.some(word => tagLower.includes(word));
    })) {
      score += 3;
    }

    if (score > 0) {
      relevantTerms.push({ key, term, score });
    }
  }

  return relevantTerms
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.term);
}

function generateResponse(
  query: string,
  relevantTerms: any[],
  locale: 'it' | 'en',
  conversationHistory?: ChatMessage[]
): string {
  // Check if query is about utilities/tools
  const utilitiesKeywords = locale === 'it'
    ? ['calcolatore', 'simulatore', 'pac', 'hedging', 'position sizing', 'sharpe', 'volatilità', 'opzioni', 'kelly', 'portfolio', 'correlazione', 'drawdown', 'risk reward']
    : ['calculator', 'simulator', 'pac', 'hedging', 'position sizing', 'sharpe', 'volatility', 'options', 'kelly', 'portfolio', 'correlation', 'drawdown', 'risk reward'];

  const isUtilityQuery = utilitiesKeywords.some(keyword => query.toLowerCase().includes(keyword));

  if (isUtilityQuery && relevantTerms.length === 0) {
    return locale === 'it'
      ? 'Per informazioni sugli strumenti finanziari, visita la sezione Utilities nel dashboard. Posso anche rispondere a domande su termini finanziari specifici.'
      : 'For information about financial tools, visit the Utilities section in the dashboard. I can also answer questions about specific financial terms.';
  }

  if (relevantTerms.length === 0) {
    return locale === 'it'
      ? 'Non ho trovato informazioni specifiche su questo argomento. Potresti riformulare la domanda o chiedere informazioni su:\n\n• Termini finanziari (es. Sharpe Ratio, Volatilità, Hedging)\n• Strumenti finanziari (es. Calcolatori, Simulatori)\n• Report e analisi\n• Funzionalità della piattaforma'
      : 'I couldn\'t find specific information about this topic. Could you rephrase your question or ask about:\n\n• Financial terms (e.g. Sharpe Ratio, Volatility, Hedging)\n• Financial tools (e.g. Calculators, Simulators)\n• Reports and analysis\n• Platform features';
  }

  const term = relevantTerms[0];
  let response = '';

  if (locale === 'it') {
    response = `**${term.title}**\n\n`;
    
    const definition = term.academicDefinition?.what || term.what;
    if (definition) {
      response += `${definition}\n\n`;
    }
    
    const explanation = term.tradeliaExplanation?.whatDoes || term.tradeliaExplanation?.howToUse || term.how;
    if (explanation) {
      response += `**Come funziona:**\n${explanation}\n\n`;
    }
    
    if (term.academicDefinition?.academicContext) {
      response += `**Contesto:** ${term.academicDefinition.academicContext}\n\n`;
    }
    
    const source = term.academicDefinition?.source || term.source;
    if (source) {
      response += `*Fonte: ${source}*`;
    }

    if (relevantTerms.length > 1) {
      response += `\n\n**Termini correlati:** ${relevantTerms.slice(1).map(t => t.title).join(', ')}`;
    }

    response += `\n\n*Nota: Informazioni a scopo educativo. Non costituisce consulenza finanziaria.*`;
  } else {
    response = `**${term.title}**\n\n`;
    
    const definition = term.academicDefinition?.what || term.what;
    if (definition) {
      response += `${definition}\n\n`;
    }
    
    const explanation = term.tradeliaExplanation?.whatDoes || term.tradeliaExplanation?.howToUse || term.how;
    if (explanation) {
      response += `**How it works:**\n${explanation}\n\n`;
    }
    
    if (term.academicDefinition?.academicContext) {
      response += `**Context:** ${term.academicDefinition.academicContext}\n\n`;
    }
    
    const source = term.academicDefinition?.source || term.source;
    if (source) {
      response += `*Source: ${source}*`;
    }

    if (relevantTerms.length > 1) {
      response += `\n\n**Related terms:** ${relevantTerms.slice(1).map(t => t.title).join(', ')}`;
    }

    response += `\n\n*Note: Information for educational purposes. Does not constitute financial advice.*`;
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, locale = 'it', conversationHistory } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Load glossary data as knowledge base
    const glossaryData = await loadGlossaryTerms(locale);

    // Find relevant terms
    const relevantTerms = findRelevantTerms(message, glossaryData, locale);

    // Generate response
    const response = generateResponse(message, relevantTerms, locale, conversationHistory);

    // TODO: Integrate with real AI service here
    // Example:
    // const aiResponse = await callOpenAI({
    //   message,
    //   context: relevantTerms,
    //   conversationHistory,
    //   systemPrompt: 'You are Tradelia AI assistant...'
    // });

    return NextResponse.json({
      response,
      relevantTerms: relevantTerms.map(t => t.title),
    });
  } catch (error) {
    console.error('Error in AI chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
