'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { auth, db } from '../supabase/client'

// Types
export interface RuntimeStatus {
  exchangeEnv: 'testnet' | 'live'
  tradingEnabled: boolean
  trackedSymbols: string[]
  serverTime: string
  version: string
  mode: 'full' | 'demo'
}

export interface MarketSnapshot {
  candidatesCount: number
  topKCount: number
  lastUpdate: string
  symbols: Array<{
    symbol: string
    score: number
    liquidity: number
    volatility: number
  }>
}

export interface ActiveSignal {
  id: string
  symbol: string
  side: 'LONG' | 'SHORT'
  entryPrice: number
  slPrice: number
  tpPrice: number
  confidence: number
  timestamp: string
}

export interface ExchangeConnection {
  id: string
  exchange: string
  status: 'connected' | 'disconnected' | 'error'
  lastCheck: string
  permissions?: string[]
  error?: string
}

export interface TradingContextType {
  // Auth state
  user: User | null
  loading: boolean

  // Runtime state
  runtime: RuntimeStatus | null
  marketSnapshot: MarketSnapshot | null
  activeSignals: ActiveSignal[]
  exchangeConnections: ExchangeConnection[]

  // UI state
  currentTab: 'market' | 'signals' | 'positions'
  sidebarOpen: boolean

  // Actions
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string) => Promise<{ error?: any }>
  signInWithOAuth: (provider: 'google' | 'github' | 'discord') => Promise<{ error?: any }>
  signOut: () => Promise<void>

  // Data refresh
  refreshRuntime: () => Promise<void>
  refreshMarketSnapshot: () => Promise<void>
  refreshSignals: () => Promise<void>
  refreshExchangeConnections: () => Promise<void>

  // UI actions
  setCurrentTab: (tab: 'market' | 'signals' | 'positions') => void
  toggleSidebar: () => void
}

const TradingContext = createContext<TradingContextType | undefined>(undefined)

export const useTrading = () => {
  const context = useContext(TradingContext)
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider')
  }
  return context
}

interface TradingProviderProps {
  children: ReactNode
}

export const TradingProvider: React.FC<TradingProviderProps> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Runtime state
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null)
  const [marketSnapshot, setMarketSnapshot] = useState<MarketSnapshot | null>(null)
  const [activeSignals, setActiveSignals] = useState<ActiveSignal[]>([])
  const [exchangeConnections, setExchangeConnections] = useState<ExchangeConnection[]>([])

  // UI state
  const [currentTab, setCurrentTab] = useState<'market' | 'signals' | 'positions'>('market')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const getInitialSession = async () => {
      const { session } = await auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          await refreshExchangeConnections()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Auth methods
  const signIn = async (email: string, password: string) => {
    const { error } = await auth.signIn(email, password)
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await auth.signUp(email, password)
    return { error }
  }

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    const { error } = await auth.signInWithOAuth(provider)
    return { error }
  }

  const signOut = async () => {
    await auth.signOut()
    // Clear all state
    setRuntime(null)
    setMarketSnapshot(null)
    setActiveSignals([])
    setExchangeConnections([])
  }

  // Data refresh methods
  const refreshRuntime = async () => {
    try {
      const response = await fetch('/api/runtime')
      if (response.ok) {
        const data = await response.json()
        setRuntime(data.runtime)
      }
    } catch (error) {
      console.error('Failed to refresh runtime:', error)
    }
  }

  const refreshMarketSnapshot = async () => {
    try {
      const response = await fetch('/api/market/snapshot')
      if (response.ok) {
        const data = await response.json()
        setMarketSnapshot(data.snapshot)
      }
    } catch (error) {
      console.error('Failed to refresh market snapshot:', error)
    }
  }

  const refreshSignals = async () => {
    try {
      const response = await fetch('/api/signals/active')
      if (response.ok) {
        const data = await response.json()
        setActiveSignals(data.signals)
      }
    } catch (error) {
      console.error('Failed to refresh signals:', error)
    }
  }

  const refreshExchangeConnections = async () => {
    if (!user) return

    try {
      // TODO: Implement exchange connections when database schema is ready
      // For now, return empty array
      setExchangeConnections([])
    } catch (error) {
      console.error('Failed to refresh exchange connections:', error)
    }
  }

  // UI actions
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Auto-refresh data every 30 seconds when user is logged in
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      refreshRuntime()
      refreshMarketSnapshot()
      refreshSignals()
    }, 30000) // 30 seconds

    // Initial load
    refreshRuntime()
    refreshMarketSnapshot()
    refreshSignals()
    refreshExchangeConnections()

    return () => clearInterval(interval)
  }, [user])

  const value: TradingContextType = {
    // Auth state
    user,
    loading,

    // Runtime state
    runtime,
    marketSnapshot,
    activeSignals,
    exchangeConnections,

    // UI state
    currentTab,
    sidebarOpen,

    // Actions
    signIn,
    signUp,
    signInWithOAuth,
    signOut,

    // Data refresh
    refreshRuntime,
    refreshMarketSnapshot,
    refreshSignals,
    refreshExchangeConnections,

    // UI actions
    setCurrentTab,
    toggleSidebar,
  }

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  )
}

export default TradingContext
