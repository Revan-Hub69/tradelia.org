import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { indicator, value, status } = await request.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      )
    }

    const prompt = `Come esperto quantitativo in analisi crypto, spiega in modo istituzionale e accademico:

Indicatore: ${indicator}
Valore attuale: ${value}
Status: ${status}

Fornisci una spiegazione di 2-3 frasi che includa:
1. Significato del valore attuale nel contesto di mercato
2. Implicazioni per investitori istituzionali
3. Limitazioni metodologiche da considerare

Mantieni un tono professionale, neutrale e accademico. Non fornire consigli di investimento.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
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
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI explanation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    )
  }
}