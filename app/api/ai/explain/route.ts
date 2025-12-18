import { NextRequest, NextResponse } from 'next/server'

// Edge runtime for Cloudflare compatibility
export const runtime = 'edge'
export const dynamic = 'force-static'
export const revalidate = 300

export async function POST(request: NextRequest) {
  try {
    const { indicator, value, status, metric_id, visual_type, allowed_scope, no_advice, question } = await request.json()
    
    // Use structured input if provided
    const metricName = metric_id ? metric_id.replace('_', ' ') : indicator

    // Fallback response if no Groq API key
    if (!process.env.GROQ_API_KEY) {
      const fallbackExplanation = `Il ${indicator} con valore ${value} (${status}) indica le condizioni attuali del mercato. Questa metrica è importante per valutare il rischio operativo nel trading crypto. Considera sempre il contesto di mercato completo prima di prendere decisioni.`
      
      return NextResponse.json({ 
        explanation: fallbackExplanation,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      })
    }

    const prompt = question || `Come esperto quantitativo in analisi crypto, spiega in modo istituzionale e accademico:

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
    const explanation = data.choices[0]?.message?.content

    return NextResponse.json({ 
      explanation,
      timestamp: new Date().toISOString(),
      source: 'groq'
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('AI explanation error:', error)
    
    // Fallback response on error
    const fallbackExplanation = `Analisi temporaneamente non disponibile. L'indicatore mostra condizioni di mercato che richiedono attenzione. Consulta sempre multiple fonti prima di operare.`
    
    return NextResponse.json({ 
      explanation: fallbackExplanation,
      timestamp: new Date().toISOString(),
      source: 'fallback'
    }, {
      status: 200, // Return 200 with fallback instead of error
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}