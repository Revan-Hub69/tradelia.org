'use client'

import { useEffect, useMemo, useState } from 'react'

type MarketCoin = {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap_rank: number
}

const DEFAULT_COINS: MarketCoin[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 1 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 2 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 3 },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 5 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 8 },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 12 },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 13 },
  { id: 'uniswap', symbol: 'uni', name: 'Uniswap', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 17 },
]

const API_TICKER = '/api/market/ticker'
const COINCAP_STREAM = 'wss://ws.coincap.io/prices?assets=bitcoin,ethereum,binance-coin,solana,cardano,polkadot,chainlink,uniswap'
const STREAM_ID_MAP: Record<string, string> = {
  'binance-coin': 'binancecoin',
}

interface MarketTickerProps {
  errorLabel?: string
  reduceMotion?: boolean
}

const LOGO_COLORS: Record<string, string> = {
  btc: 'bg-gradient-to-br from-amber-400 to-orange-500',
  eth: 'bg-gradient-to-br from-slate-300 to-slate-500',
  bnb: 'bg-gradient-to-br from-yellow-200 to-yellow-400',
  sol: 'bg-gradient-to-br from-indigo-400 to-fuchsia-500',
  ada: 'bg-gradient-to-br from-blue-500 to-cyan-400',
  dot: 'bg-gradient-to-br from-rose-400 to-amber-300',
  link: 'bg-gradient-to-br from-blue-500 to-blue-700',
  uni: 'bg-gradient-to-br from-pink-400 to-purple-500',
}

function getLogo(symbol: string) {
  const base = symbol.toLowerCase()
  const bg = LOGO_COLORS[base] || 'bg-[var(--surface-2)]'
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black text-white uppercase ${bg}`}
      aria-hidden="true"
    >
      {base.slice(0, 3)}
    </span>
  )
}

export function MarketTicker({ errorLabel = 'Data unavailable', reduceMotion = false }: MarketTickerProps) {
  const [coins, setCoins] = useState<MarketCoin[]>(DEFAULT_COINS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Seed with 24h change and initial prices (server proxy)
  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        setError(null)
        const res = await fetch(API_TICKER, { cache: 'no-cache' })
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const payload = await res.json() as { items: MarketCoin[] }
        const data = payload.items || []
        if (isMounted) {
          setCoins(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError('Dati non disponibili')
          setIsLoading(false)
        }
        console.error('Ticker fetch failed', err)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [])

  // Realtime stream (CoinCap)
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimer: NodeJS.Timeout

    const connect = () => {
      ws = new WebSocket(COINCAP_STREAM)

      ws.onmessage = event => {
        try {
          const payload = JSON.parse(event.data) as Record<string, string>
          setCoins(prev => {
            const next = [...prev]
            Object.entries(payload).forEach(([key, value]) => {
              const normalizedKey = STREAM_ID_MAP[key] || key
              const idx = next.findIndex(c => c.id === normalizedKey)
              if (idx >= 0) {
                next[idx] = {
                  ...next[idx],
                  current_price: parseFloat(value),
                }
              }
            })
            return next
          })
          setIsLoading(false)
          setError(null)
        } catch (err) {
          console.error('Ticker stream parse failed', err)
        }
      }

      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 2000)
      }

      ws.onerror = () => {
        setError('Stream temporaneamente non disponibile')
        ws?.close()
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [])

  const doubledCoins = useMemo(() => coins.concat(coins), [coins])

  return (
    <div className="ticker-shell" aria-label="Aggiornamento mercato crypto">
      <div className={`ticker-strip ${reduceMotion ? 'overflow-x-auto' : ''}`}>
        <div
          className={`ticker-track ${reduceMotion ? 'ticker-track-static' : ''}`}
          role="list"
          style={reduceMotion ? { animation: 'none' } : undefined}
        >
          {isLoading && (
            <>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="ticker-item skeleton" aria-hidden="true" />
              ))}
            </>
          )}

          {!isLoading && doubledCoins.map((coin, idx) => (
            <div key={`${coin.id}-${idx}`} className="ticker-item" role="listitem">
              <div className="flex items-center gap-3">
                {getLogo(coin.symbol)}
                <div className="flex flex-col leading-tight">
                  <span className="text-[var(--muted)] text-xs uppercase tracking-wide">{coin.symbol}</span>
                  <span className="text-sm font-semibold text-[var(--ink)]">{coin.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[var(--ink)]">${coin.current_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                <span className={`text-xs font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}

          {!isLoading && error && (
            <div className="ticker-item">
              <span className="text-sm text-[var(--muted)]">{errorLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
