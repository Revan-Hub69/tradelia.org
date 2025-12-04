import { NextRequest, NextResponse } from 'next/server';
import { loadGlossaryTerms } from '@/lib/glossary/terms';

/**
 * Glossary Chat API
 * Provides AI-powered responses using glossary as knowledge base
 * Best Practice: RAG (Retrieval-Augmented Generation) pattern
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

// Enhanced keyword-based retrieval with word matching
function findRelevantTerms(query: string, glossaryData: Record<string, any>, locale: 'it' | 'en'): any[] {
  const queryLower = query.toLowerCase();
  // Estrai parole chiave dalla query (rimuovi stop words comuni)
  const stopWords = locale === 'it' 
    ? ['cosa', 'cos', 'è', 'come', 'funziona', 'spiegami', 'dimmi', 'che', 'chi', 'quando', 'dove', 'perché', 'il', 'la', 'lo', 'gli', 'le', 'un', 'una', 'uno', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra']
    : ['what', 'is', 'how', 'does', 'work', 'explain', 'tell', 'me', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  const queryWords = queryLower
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));

  const relevantTerms: Array<{ key: string; term: any; score: number }> = [];

  for (const [key, term] of Object.entries(glossaryData)) {
    let score = 0;

    // Exact title match (highest priority)
    if (term.title?.toLowerCase() === queryLower) {
      score += 20;
    } else if (term.title?.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Word-by-word matching in title
    queryWords.forEach(word => {
      if (term.title?.toLowerCase().includes(word)) {
        score += 5;
      }
    });

    // What field match
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

    // How field match
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

    // Tradelia explanation match
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

    // Tag match
    if (term.tags?.some((tag: string) => {
      const tagLower = tag.toLowerCase();
      return tagLower === queryLower || queryWords.some(word => tagLower.includes(word));
    })) {
      score += 3;
    }

    // Source match (for academic references) - lower priority
    if (term.source?.toLowerCase().includes(queryLower)) {
      score += 1;
    }

    if (score > 0) {
      relevantTerms.push({ key, term, score });
    }
  }

  // Sort by score and return top 3
  return relevantTerms
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.term);
}

function generateResponse(
  query: string,
  relevantTerms: any[],
  locale: 'it' | 'en'
): string {
  if (relevantTerms.length === 0) {
    return locale === 'it'
      ? 'Non ho trovato informazioni specifiche su questo argomento nel glossario Tradelia. Potresti riformulare la domanda o chiedere informazioni su un termine finanziario specifico?\n\n**Suggerimenti:**\n- Prova a cercare termini come "Sharpe Ratio", "Volatilità", "Hedging", "Interesse Composto"\n- Chiedi spiegazioni su concetti finanziari specifici\n- Puoi anche chiedere come funzionano gli strumenti finanziari'
      : 'I couldn\'t find specific information about this topic in the Tradelia glossary. Could you rephrase your question or ask about a specific financial term?\n\n**Suggestions:**\n- Try searching for terms like "Sharpe Ratio", "Volatility", "Hedging", "Compound Interest"\n- Ask for explanations of specific financial concepts\n- You can also ask how financial tools work';
  }

  const term = relevantTerms[0];
  let response = '';

  if (locale === 'it') {
    response = `**${term.title}**\n\n`;
    
    // Usa academicDefinition se disponibile (nuova struttura), altrimenti what
    const definition = term.academicDefinition?.what || term.what;
    if (definition) {
      response += `**Cosa è:** ${definition}\n\n`;
    }
    
    // Usa tradeliaExplanation se disponibile, altrimenti how
    const explanation = term.tradeliaExplanation?.whatDoes || term.tradeliaExplanation?.howToUse || term.how;
    if (explanation) {
      response += `**Come funziona:** ${explanation}\n\n`;
    }
    
    // Aggiungi contesto accademico se disponibile
    if (term.academicDefinition?.academicContext) {
      response += `**Contesto Accademico:** ${term.academicDefinition.academicContext}\n\n`;
    }
    
    // Fonte
    const source = term.academicDefinition?.source || term.source;
    if (source) {
      response += `**Fonte:** ${source}`;
    }

    // Termini correlati
    if (relevantTerms.length > 1) {
      response += `\n\n**Termini correlati:** ${relevantTerms.slice(1).map(t => t.title).join(', ')}`;
    }

    // Disclaimer MIFID
    response += `\n\n*Nota: Questa spiegazione è a scopo informativo e non costituisce consulenza finanziaria.*`;
  } else {
    response = `**${term.title}**\n\n`;
    
    const definition = term.academicDefinition?.what || term.what;
    if (definition) {
      response += `**What it is:** ${definition}\n\n`;
    }
    
    const explanation = term.tradeliaExplanation?.whatDoes || term.tradeliaExplanation?.howToUse || term.how;
    if (explanation) {
      response += `**How it works:** ${explanation}\n\n`;
    }
    
    if (term.academicDefinition?.academicContext) {
      response += `**Academic Context:** ${term.academicDefinition.academicContext}\n\n`;
    }
    
    const source = term.academicDefinition?.source || term.source;
    if (source) {
      response += `**Source:** ${source}`;
    }

    if (relevantTerms.length > 1) {
      response += `\n\n**Related terms:** ${relevantTerms.slice(1).map(t => t.title).join(', ')}`;
    }

    response += `\n\n*Note: This explanation is for informational purposes and does not constitute financial advice.*`;
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, locale = 'it' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Load glossary data
    const glossaryData = await loadGlossaryTerms(locale);

    // Find relevant terms
    const relevantTerms = findRelevantTerms(message, glossaryData, locale);

    // Generate response
    const response = generateResponse(message, relevantTerms, locale);

    return NextResponse.json({
      response,
      relevantTerms: relevantTerms.map(t => t.title),
    });
  } catch (error) {
    console.error('Error in glossary chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
