import { NextResponse } from 'next/server'

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets'
const DEFAULT_IDS = [
  'bitcoin',
  'ethereum',
  'binancecoin',
  'solana',
  'cardano',
  'polkadot',
  'chainlink',
  'uniswap'
]

export async function GET() {
  const url = new URL(COINGECKO_URL)
  url.searchParams.set('vs_currency', 'usd')
  url.searchParams.set('ids', DEFAULT_IDS.join(','))
  url.searchParams.set('order', 'market_cap_desc')
  url.searchParams.set('per_page', '50')
  url.searchParams.set('page', '1')
  url.searchParams.set('sparkline', 'false')
  url.searchParams.set('price_change_percentage', '24h')

  try {
    const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' }, next: { revalidate: 30 } })
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
    }
    const data = await res.json() as any[]

    const filtered = data
      .filter(item => Number(item.total_volume) > 50_000_000) // volume threshold
      .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h)) // volatility
      .slice(0, 12)
      .map(item => ({
        id: item.id,
        symbol: item.symbol,
        name: item.name,
        current_price: item.current_price,
        price_change_percentage_24h: item.price_change_percentage_24h,
        market_cap_rank: item.market_cap_rank,
      }))

    return NextResponse.json({ items: filtered, asOf: new Date().toISOString() })
  } catch (error) {
    console.error('Ticker proxy error', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
