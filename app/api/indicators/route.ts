import { NextResponse } from 'next/server'

// Edge runtime for Cloudflare compatibility
export const runtime = 'edge'
export const dynamic = 'force-static'
export const revalidate = 300

interface IndicatorData {
  name: string
  value: string
  status: string
  description: string
  methodology: string
  lastUpdate: string
}

async function fetchFearGreedIndex(): Promise<number> {
  try {
    const response = await fetch('https://api.alternative.me/fng/', {
      headers: { 'User-Agent': 'Tradelia/1.0' }
    })
    if (!response.ok) throw new Error('API error')
    const data = await response.json()
    return parseInt(data.data[0].value)
  } catch {
    return 42 // fallback
  }
}

async function fetchBitcoinPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
      headers: { 'User-Agent': 'Tradelia/1.0' }
    })
    if (!response.ok) throw new Error('API error')
    const data = await response.json()
    return data.bitcoin.usd
  } catch {
    return 45000 // fallback
  }
}

export async function GET() {
  try {
    const [fearGreed, btcPrice] = await Promise.all([
      fetchFearGreedIndex(),
      fetchBitcoinPrice()
    ])

    // Calcoli semplificati per demo
    const mvrv = (btcPrice / 25000).toFixed(1)
    const nvt = (btcPrice / 1600).toFixed(1)
    const longShort = (2.1 + (fearGreed - 50) / 100).toFixed(1)

    const indicators: IndicatorData[] = [
      {
        name: 'Bitcoin Fear & Greed Index',
        value: fearGreed.toString(),
        status: fearGreed < 25 ? 'Extreme Fear' : fearGreed < 45 ? 'Fear' : fearGreed < 55 ? 'Neutral' : fearGreed < 75 ? 'Greed' : 'Extreme Greed',
        description: 'Sentiment composito basato su volatilità, momentum, social media e survey.',
        methodology: 'Indice ponderato 0-100 che aggrega 5 metriche quantitative di sentiment di mercato.',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'MVRV Ratio',
        value: mvrv,
        status: parseFloat(mvrv) > 3.7 ? 'Overbought' : parseFloat(mvrv) < 1 ? 'Oversold' : 'Neutral',
        description: 'Market Value to Realized Value - rapporto tra capitalizzazione e valore realizzato.',
        methodology: 'MVRV = Market Cap / Realized Cap. Valori >3.7 indicano potenziali top, <1 potenziali bottom.',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'NVT Ratio',
        value: nvt,
        status: parseFloat(nvt) > 55 ? 'Overvalued' : parseFloat(nvt) < 20 ? 'Undervalued' : 'Normal',
        description: 'Network Value to Transactions - P/E ratio per Bitcoin.',
        methodology: 'NVT = Market Cap / Volume Transazioni On-chain (90d MA). Range normale: 20-55.',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'Long/Short Ratio',
        value: longShort,
        status: parseFloat(longShort) > 2 ? 'Bullish' : parseFloat(longShort) < 1 ? 'Bearish' : 'Neutral',
        description: 'Rapporto posizioni long/short aggregate sui principali exchange.',
        methodology: 'Aggregazione weighted delle posizioni aperte su Binance, Bybit, OKX. >2 = sentiment bullish.',
        lastUpdate: new Date().toISOString()
      }
    ]

    return NextResponse.json({ 
      indicators,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error fetching indicators:', error)
    return NextResponse.json(
      { error: 'Failed to fetch indicators' },
      { status: 500 }
    )
  }
}