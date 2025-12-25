'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useTrading } from './TradingContext'

// Types for real-time data
export interface OrderBookLevel {
  price: number
  quantity: number
  orders: number
}

export interface OrderBookSnapshot {
  symbol: string
  timestamp: number
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  lastUpdateId: number
}

export interface FuturesData {
  symbol: string
  markPrice: number
  indexPrice: number
  fundingRate: number
  nextFundingTime: number
  countDownMs: number
}

export interface ScreenerData {
  symbol: string
  score: number
  lqs: number // Liquidity Quality Score
  vos: number // Volatility Opportunity Score
  dfs: number // Derivatives Flow Score
  mes: number // Microstructure Edge Score
  mtfGate: 'PASS' | 'REVIEW' | 'FAIL'
  imbalance: number
  volume24h: number
  price: number
  change24h: number
  rank: number
  // Advanced metrics
  oi: number // Open Interest
  pressure: number // Buy/Sell Pressure (-1 to 1)
  support: number // Support Level
  resistance: number // Resistance Level
  slippage: number // Average Slippage %
  accumulationZone: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL'
}

export interface WebSocketState {
  // Orderbook data
  orderBooks: Map<string, OrderBookSnapshot>
  futuresData: Map<string, FuturesData>

  // Screener data
  screenerData: ScreenerData[]

  // Connection status
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastHeartbeat: number

  // WebSocket instance
  ws: WebSocket | null
}

export interface WebSocketContextType extends WebSocketState {
  // Actions
  connect: () => void
  disconnect: () => void
  subscribeToOrderBook: (symbol: string) => void
  unsubscribeFromOrderBook: (symbol: string) => void
  subscribeToFutures: (symbol: string) => void
  unsubscribeFromFutures: (symbol: string) => void
  refreshScreener: () => void

  // DB Data Service methods
  getDBStatus: () => {
    isConnected: boolean
    snapshots: number
    lastPoll: number
  }
  getAllLatestSnapshots: () => Map<string, any>
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

interface WebSocketProviderProps {
  children: ReactNode
}

// Production-safe WebSocket URL detection - NO fallback to avoid localhost issues
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || (() => {
  // Auto-detect WS URL from API URL in production
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    return apiUrl.replace(/^http/, 'ws') + '/ws'
  }
  return ""
})()

// Anti-localhost guard for production (only warn if URL is set but contains localhost)
if (WS_URL && WS_URL.includes('localhost')) {
  console.warn('🚨 WebSocket URL contains localhost - this will fail in production!');
  console.warn('Set NEXT_PUBLIC_WS_URL environment variable for production deployment');
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  // WebSocket disabled in production (serverless limitation)
  const WS_ENABLED = process.env.NEXT_PUBLIC_WS_ENABLED !== 'false'
  const { user } = useTrading()

  // WebSocket state
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastHeartbeat, setLastHeartbeat] = useState(0)

  // Market data state
  const [orderBooks, setOrderBooks] = useState<Map<string, OrderBookSnapshot>>(new Map())
  const [futuresData, setFuturesData] = useState<Map<string, FuturesData>>(new Map())
  const [screenerData, setScreenerData] = useState<ScreenerData[]>([])

  // Connection management
  const connect = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN) return

    // Check if WebSocket URL is configured
    if (!WS_URL) {
      console.warn('⚠️ NEXT_PUBLIC_WS_URL non impostata: WebSocket disabilitato in produzione.')
      setConnectionStatus('disconnected')
      return
    }

    setConnectionStatus('connecting')

    const websocket = new WebSocket(WS_URL)

    websocket.onopen = () => {
      console.log('✅ WebSocket connected')
      setIsConnected(true)
      setConnectionStatus('connected')
      setLastHeartbeat(Date.now())

      // Authenticate if user is logged in
      if (user) {
        websocket.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }))
      }
    }

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        handleMessage(message)
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error)
      }
    }

    websocket.onclose = () => {
      console.log('❌ WebSocket disconnected')
      setIsConnected(false)
      setConnectionStatus('disconnected')
      setWs(null)

      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        if (connectionStatus !== 'connecting') {
          connect()
        }
      }, 5000)
    }

    websocket.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      setConnectionStatus('error')
    }

    setWs(websocket)
  }, [ws, user, connectionStatus])

  const disconnect = useCallback(() => {
    if (ws) {
      ws.close()
      setWs(null)
    }
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [ws])

  // Message handling
  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'heartbeat':
        setLastHeartbeat(Date.now())
        break

      case 'orderbook':
        setOrderBooks(prev => {
          const newMap = new Map(prev)
          newMap.set(message.symbol, message.data)
          return newMap
        })
        break

      case 'futures':
        setFuturesData(prev => {
          const newMap = new Map(prev)
          newMap.set(message.symbol, message.data)
          return newMap
        })
        break

      case 'screener':
        setScreenerData(message.data)
        break

      case 'error':
        console.error('WebSocket error:', message.error)
        break

      default:
        console.log('Unknown message type:', message.type)
    }
  }, [])

  // Subscription management
  const subscribeToOrderBook = useCallback((symbol: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'orderbook',
        symbol
      }))
    }
  }, [ws])

  const unsubscribeFromOrderBook = useCallback((symbol: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'unsubscribe',
        channel: 'orderbook',
        symbol
      }))
    }
  }, [ws])

  const subscribeToFutures = useCallback((symbol: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'futures',
        symbol
      }))
    }
  }, [ws])

  const unsubscribeFromFutures = useCallback((symbol: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'unsubscribe',
        channel: 'futures',
        symbol
      }))
    }
  }, [ws])

  const refreshScreener = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'refresh',
        channel: 'screener'
      }))
    }
  }, [ws])

  // HTTP Polling fallback when WebSocket is disabled
  const startPolling = useCallback(() => {
    console.log('📡 Starting HTTP polling for market data (WebSocket disabled)')

    const pollScreener = async () => {
      try {
        // Use NEXT_PUBLIC_API_URL for external API calls instead of '/api/...'
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/market/snapshot`)

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.snapshot?.symbols) {
            const screenerData: ScreenerData[] = data.snapshot.symbols.map((item: any, index: number) => ({
              symbol: item.symbol,
              score: item.score || 0,
              lqs: item.liquidity || 0,
              vos: item.volatility || 0,
              dfs: 0, // Not available in basic snapshot
              mes: 0, // Not available in basic snapshot
              mtfGate: 'PASS' as const,
              imbalance: 0,
              volume24h: item.volume || 0,
              price: item.price || 0,
              change24h: item.change24h || 0,
              rank: index + 1,
              oi: 0,
              pressure: 0,
              support: 0,
              resistance: 0,
              slippage: 0,
              accumulationZone: 'NEUTRAL' as const
            }))
            setScreenerData(screenerData)
          }
        }
      } catch (error) {
        console.error('❌ Error polling screener data:', error)
      }
    }

    // Poll immediately and then every 5 seconds
    pollScreener()
    const interval = setInterval(pollScreener, 5000)

    return () => clearInterval(interval)
  }, [])

  // Auto-connect when user logs in (only if WebSocket enabled and URL configured)
  useEffect(() => {
    if (WS_ENABLED && WS_URL) {
      if (user && !isConnected) {
        connect()
      } else if (!user && isConnected) {
        disconnect()
      }
    } else {
      // Start HTTP polling instead (WebSocket disabled or not configured)
      const cleanup = startPolling()
      return cleanup
    }
  }, [user, isConnected, connect, disconnect, WS_ENABLED, WS_URL, startPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (WS_ENABLED && WS_URL) {
        disconnect()
      }
    }
  }, [disconnect, WS_ENABLED, WS_URL])

  // DB Data Service methods (placeholder for now - will be implemented via API)
  const getDBStatus = useCallback(() => ({
    isConnected: true, // Assume DB is always connected
    snapshots: screenerData.length, // Use screener data count as proxy
    lastPoll: Date.now()
  }), [screenerData.length])

  const getAllLatestSnapshots = useCallback(() => {
    // Return empty map for now - will be implemented via API
    return new Map<string, any>()
  }, [])

  const value: WebSocketContextType = {
    // State
    orderBooks,
    futuresData,
    screenerData,
    isConnected,
    connectionStatus,
    lastHeartbeat,
    ws,

    // Actions
    connect,
    disconnect,
    subscribeToOrderBook,
    unsubscribeFromOrderBook,
    subscribeToFutures,
    unsubscribeFromFutures,
    refreshScreener,

    // DB Data Service methods
    getDBStatus,
    getAllLatestSnapshots,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketContext
