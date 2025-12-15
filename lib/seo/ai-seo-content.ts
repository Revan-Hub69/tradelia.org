/**
 * AI SEO Content Generator
 * Best Practice 2026: AI-generated SEO content per migliorare indicizzazione
 * 
 * Genera contenuti SEO ottimizzati usando Groq AI per:
 * - Meta descriptions dinamiche
 * - Structured data descriptions
 * - Alt text per immagini
 * - FAQ sections
 * - Rich snippets content
 */

import { callGroqAI } from '@/lib/ai/indicator-prompts-enhanced';

const SEO_AI_SYSTEM_PROMPT = `Sei un esperto SEO specializzato in contenuti finanziari per Tradelia.
Genera contenuti SEO ottimizzati in italiano che:
1. Siano accademicamente validi e conformi a MiFID II
2. Siano ottimizzati per keyword rilevanti
3. Siano leggibili e accessibili (WCAG 2.1 AA)
4. Siano ottimizzati per AI Search (Perplexity, ChatGPT)
5. Includano structured data quando appropriato
6. Siano concisi ma informativi (max 160 caratteri per meta descriptions)
7. Siano ottimizzati per featured snippets`;

/**
 * Generate SEO-optimized meta description for indicator
 */
export async function generateIndicatorMetaDescription(
  indicatorId: string,
  indicatorName: string,
  currentValue?: string
): Promise<string> {
  const userPrompt = `Genera una meta description SEO ottimizzata (max 160 caratteri) per l'indicatore "${indicatorName}" (ID: ${indicatorId}).
${currentValue ? `Valore attuale: ${currentValue}.` : ''}
La description deve:
- Essere in italiano
- Includere keyword rilevanti
- Essere accattivante e informativa
- Essere ottimizzata per AI Search
- Essere conforme a MiFID II`;

  try {
    const description = await callGroqAI(SEO_AI_SYSTEM_PROMPT, userPrompt, 200);
    return description.trim().slice(0, 160); // Max 160 chars
  } catch (error) {
    console.error('Error generating meta description:', error);
    return `${indicatorName} - Indicatore di mercato accademico su Tradelia. Analisi AI-powered con metodologia verificabile.`;
  }
}

/**
 * Generate SEO-optimized title for indicator
 */
export async function generateIndicatorTitle(
  indicatorId: string,
  indicatorName: string
): Promise<string> {
  const userPrompt = `Genera un title SEO ottimizzato (max 60 caratteri) per l'indicatore "${indicatorName}" (ID: ${indicatorId}).
Il title deve:
- Essere in italiano
- Includere keyword principali
- Essere conciso e accattivante
- Essere ottimizzato per AI Search`;

  try {
    const title = await callGroqAI(SEO_AI_SYSTEM_PROMPT, userPrompt, 100);
    return title.trim().slice(0, 60); // Max 60 chars
  } catch (error) {
    return `${indicatorName} | Tradelia`;
  }
}

/**
 * Generate SEO-optimized alt text for indicator chart
 */
export async function generateChartAltText(
  indicatorId: string,
  indicatorName: string,
  chartType: string
): Promise<string> {
  const userPrompt = `Genera un alt text SEO ottimizzato per un grafico ${chartType} dell'indicatore "${indicatorName}" (ID: ${indicatorId}).
L'alt text deve:
- Essere descrittivo e accessibile (WCAG 2.1 AA)
- Includere informazioni rilevanti sul grafico
- Essere ottimizzato per AI Search
- Essere in italiano`;

  try {
    const altText = await callGroqAI(SEO_AI_SYSTEM_PROMPT, userPrompt, 150);
    return altText.trim();
  } catch (error) {
    return `Grafico ${chartType} per ${indicatorName} su Tradelia`;
  }
}

/**
 * Generate FAQ section for indicator (structured data)
 */
export async function generateIndicatorFAQ(
  indicatorId: string,
  indicatorName: string
): Promise<Array<{ question: string; answer: string }>> {
  const userPrompt = `Genera 3-5 FAQ SEO ottimizzate per l'indicatore "${indicatorName}" (ID: ${indicatorId}).
Le FAQ devono:
- Essere in italiano
- Essere accademicamente valide
- Essere ottimizzate per featured snippets
- Essere conformi a MiFID II
- Essere ottimizzate per AI Search

Formato: Array di oggetti {question: string, answer: string}`;

  try {
    const faqText = await callGroqAI(SEO_AI_SYSTEM_PROMPT, userPrompt, 500);
    // Parse FAQ from AI response (simple parsing, in production use structured output)
    const faqs: Array<{ question: string; answer: string }> = [];
    const lines = faqText.split('\n').filter(l => l.trim());
    
    let currentQ = '';
    let currentA = '';
    
    for (const line of lines) {
      if (line.match(/^[Qq]uestion|^[Dd]omanda|^\d+\./)) {
        if (currentQ && currentA) {
          faqs.push({ question: currentQ, answer: currentA.trim() });
        }
        currentQ = line.replace(/^[Qq]uestion:|^[Dd]omanda:|^\d+\./, '').trim();
        currentA = '';
      } else if (line.match(/^[Aa]nswer|^[Rr]isposta|^[Rr]/)) {
        currentA = line.replace(/^[Aa]nswer:|^[Rr]isposta:|^[Rr]:/, '').trim();
      } else if (currentQ) {
        currentA += ' ' + line.trim();
      }
    }
    
    if (currentQ && currentA) {
      faqs.push({ question: currentQ, answer: currentA.trim() });
    }

    return faqs.slice(0, 5); // Max 5 FAQ
  } catch (error) {
    console.error('Error generating FAQ:', error);
    return [
      {
        question: `Cos'è ${indicatorName}?`,
        answer: `${indicatorName} è un indicatore di mercato accademico disponibile su Tradelia con analisi AI-powered.`,
      },
    ];
  }
}

/**
 * Generate structured data description for indicator
 */
export async function generateStructuredDataDescription(
  indicatorId: string,
  indicatorName: string,
  category: string
): Promise<string> {
  const userPrompt = `Genera una descrizione strutturata SEO per l'indicatore "${indicatorName}" (ID: ${indicatorId}, Categoria: ${category}).
La descrizione deve:
- Essere in italiano
- Essere ottimizzata per structured data (Schema.org)
- Essere accademicamente valida
- Essere ottimizzata per AI Search
- Essere conforme a MiFID II
- Essere concisa ma informativa (max 200 caratteri)`;

  try {
    const description = await callGroqAI(SEO_AI_SYSTEM_PROMPT, userPrompt, 250);
    return description.trim().slice(0, 200);
  } catch (error) {
    return `${indicatorName} - Indicatore di mercato ${category} su Tradelia con analisi AI accademica.`;
  }
}
