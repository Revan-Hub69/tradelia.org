import { NextRequest, NextResponse } from 'next/server'

// Edge runtime for Cloudflare compatibility
export const runtime = 'edge'
export const dynamic = 'force-static'
export const revalidate = 300

export async function POST(request: NextRequest) {
  try {
    const { 
      topic_id, 
      topic_title, 
      context, 
      user_question, 
      mode, 
      constraints,
      // Legacy support
      indicator, 
      value, 
      status, 
      metric_id, 
      visual_type, 
      allowed_scope, 
      no_advice, 
      question 
    } = await request.json()
    
    // Support new prompt contract format
    const isNewFormat = topic_id && context
    
    // Fallback response if no Groq API key
    if (!process.env.GROQ_API_KEY) {
      const fallbackResponse = {
        answer: isNewFormat ? 
          `Analisi per ${topic_title}: ${context.state} con confidence ${context.quality?.confidence_bucket || 'Medium'}. Questa metrica indica le condizioni attuali del mercato crypto.` :
          `Il ${indicator} con valore ${value} (${status}) indica le condizioni attuali del mercato.`,
        evidence: ['Dati di mercato in tempo reale', 'Analisi quantitativa'],
        interpretation: 'Contesto generale di mercato da considerare nelle decisioni',
        limitations: ['Analisi AI temporaneamente non disponibile', 'Consultare sempre fonti multiple'],
        not_implying: 'Questo non implica raccomandazioni di investimento',
        suggested_questions: ['Come interpretare questo dato?', 'Quali sono i limiti?', 'Cosa guardare ora?']
      }
      
      return NextResponse.json(fallbackResponse)
    }

    let prompt: string
    
    if (isNewFormat) {
      // New structured prompt format
      prompt = `Come analista quantitativo crypto, rispondi alla domanda dell'utente:

Topic: ${topic_title}
Stato corrente: ${context.state}
Drivers attivi: ${context.drivers?.join(', ') || 'N/A'}
Confidence: ${context.quality?.confidence_bucket || 'Medium'}
Freshness: ${context.quality?.freshness || 'T-0'}
As of: ${context.asof}

Domanda utente: "${user_question}"

Rispondi seguendo questo formato:
1. HYPOTHESIS: Spiegazione diretta della domanda
2. EVIDENCE: Dati/driver che supportano la risposta
3. INTERPRETATION: Cosa significa nel contesto attuale
4. LIMITATIONS: Cosa NON possiamo concludere

Constraints:
- Lingua: ${constraints?.language || 'it'}
- Stile: ${constraints?.style || 'academic_clear'}
- No advice: ${constraints?.no_advice ? 'SÌ' : 'NO'}
- No predictions: ${constraints?.no_predictions ? 'SÌ' : 'NO'}
- Scope: ${constraints?.scope_only_topic ? 'Solo questo topic' : 'Generale'}`
    } else {
      // Legacy format support
      const metricName = metric_id ? metric_id.replace('_', ' ') : indicator
      prompt = question || `Come esperto quantitativo in analisi crypto, spiega in modo istituzionale e accademico:

Metrica: ${metricName}
Tipo visualizzazione: ${visual_type || 'standard'}
Valore attuale: ${value || 'N/A'}
Status: ${status || 'N/A'}

Fornisci una spiegazione di 2-3 frasi che includa:
1. Significato della metrica nel contesto di mercato
2. Interpretazione della visualizzazione ${visual_type || 'standard'}
3. Limitazioni metodologiche da considerare

Scope: ${allowed_scope || 'general_interpretation'}
Mantieni un tono professionale, neutrale e accademico. ${no_advice ? 'NON fornire consigli di investimento.' : ''}`
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Tradelia/1.0'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Sei un analista quantitativo senior specializzato in mercati crypto. Fornisci sempre analisi oggettive, metodologicamente rigorose e mai consigli di investimento.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error('Groq API error')
    }

    const data = await response.json()
    const rawResponse = data.choices[0]?.message?.content

    if (isNewFormat) {
      // Parse structured response
      try {
        const sections = rawResponse.split(/\d+\.|HYPOTHESIS:|EVIDENCE:|INTERPRETATION:|LIMITATIONS:/i)
        const cleanSections = sections.filter(s => s.trim()).map(s => s.trim())
        
        return NextResponse.json({
          answer: cleanSections[0] || rawResponse,
          evidence: cleanSections[1] ? cleanSections[1].split('\n').filter(l => l.trim()) : [],
          interpretation: cleanSections[2] || '',
          limitations: cleanSections[3] ? cleanSections[3].split('\n').filter(l => l.trim()) : [],
          not_implying: 'Questo non implica consigli di investimento o previsioni di prezzo',
          suggested_questions: [
            'Quando potrebbe cambiare questo stato?',
            'Quali sono i principali rischi ora?',
            'Come interpretare i driver attivi?'
          ]
        }, {
          headers: {
            'Cache-Control': 'public, max-age=300',
            'Access-Control-Allow-Origin': '*',
          }
        })
      } catch (parseError) {
        // Fallback to simple response if parsing fails
        return NextResponse.json({
          answer: rawResponse,
          evidence: [],
          interpretation: '',
          limitations: ['Risposta non strutturata'],
          not_implying: 'Questo non implica consigli di investimento',
          suggested_questions: []
        })
      }
    } else {
      // Legacy format
      return NextResponse.json({ 
        explanation: rawResponse,
        timestamp: new Date().toISOString(),
        source: 'groq'
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

  } catch (error) {
    console.error('AI explanation error:', error)
    
    // Fallback response on error
    const fallbackResponse = {
      answer: 'Analisi temporaneamente non disponibile. Consulta sempre multiple fonti prima di operare.',
      evidence: ['Servizio AI temporaneamente non disponibile'],
      interpretation: 'Impossibile fornire interpretazione contestuale',
      limitations: ['Analisi AI non disponibile', 'Utilizzare dati con cautela'],
      not_implying: 'Questo non implica consigli di investimento',
      suggested_questions: ['Riprova più tardi', 'Consulta documentazione metodologica']
    }
    
    return NextResponse.json(fallbackResponse, {
      status: 200, // Return 200 with fallback instead of error
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}