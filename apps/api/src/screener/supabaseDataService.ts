import { EventEmitter } from 'events'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '../config/env'
import { OrderBookData } from './types'
import { wsLogger, ERROR_TYPES, logError, logInfo, logWarn } from '../lib/logger'

interface FeatureSnapshot {
  snapshot_id: string
  exchange: string
  venue: string
  symbol: string
  ts: string
  features: {
    orderbook: {
      spread_bps: number
      obi_l1: number
      obi_l5: number
    }
  }
  quality: {
    latency_ms: number
    missing: any[]
    sync_ok: boolean
    lob_ok: boolean
  }
  source_meta: {
    lob_last_update_id: number
  }
  created_at: string
}

export class SupabaseDataService extends EventEmitter {
  private supabase: SupabaseClient
  private latestSnapshots: Map<string, FeatureSnapshot> = new Map()
  private pollInterval: NodeJS.Timeout | null = null
  private isPolling: boolean = false

  constructor() {
    super()

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured')
    }

    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    this.startPolling()
  }

  /**
   * Start polling feature_snapshots for real-time data
   */
  private startPolling(): void {
    if (this.isPolling) return

    this.isPolling = true
    wsLogger.info({
      msg: 'Starting Supabase feature_snapshots polling',
      pollIntervalMs: 2000
    })

    // Poll every 2 seconds for real-time-like updates
    this.pollInterval = setInterval(async () => {
      try {
        await this.pollLatestSnapshots()
      } catch (error) {
        logError(error as Error, ERROR_TYPES.DB_QUERY_FAILED, {
          operation: 'pollLatestSnapshots',
          symbol: 'all'
        })
      }
    }, 2000)
  }

  /**
   * Poll latest feature snapshots from Supabase
   */
  private async pollLatestSnapshots(): Promise<void> {
    try {
      // Get latest snapshot for each symbol in the last 10 seconds
      const { data, error } = await this.supabase
        .from('feature_snapshots')
        .select('*')
        .gte('ts', new Date(Date.now() - 10000).toISOString()) // Last 10 seconds
        .order('ts', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        return
      }

      if (!data || data.length === 0) return

      // Group by symbol and keep only the latest
      const latestBySymbol = new Map<string, FeatureSnapshot>()

      for (const snapshot of data) {
        if (!latestBySymbol.has(snapshot.symbol)) {
          latestBySymbol.set(snapshot.symbol, snapshot)
        }
      }

      // Emit events for new or updated snapshots
      for (const [symbol, snapshot] of latestBySymbol) {
        const previous = this.latestSnapshots.get(symbol)

        // Only emit if this is new or different data
        if (!previous || previous.snapshot_id !== snapshot.snapshot_id) {
          this.latestSnapshots.set(symbol, snapshot)
          this.emitEventsForSnapshot(snapshot)
        }
      }
    } catch (error) {
      console.error('Error in pollLatestSnapshots:', error)
    }
  }

  /**
   * Emit events based on snapshot data
   */
  private emitEventsForSnapshot(snapshot: FeatureSnapshot): void {
    const { symbol, features, quality } = snapshot

    // Emit spread event
    if (features.orderbook) {
      this.emit('spread', {
        symbol,
        spreadBps: features.orderbook.spread_bps,
        timestamp: new Date(snapshot.ts).getTime()
      })
    }

    // Emit orderbook quality event
    this.emit('orderBook', {
      symbol,
      quality,
      timestamp: new Date(snapshot.ts).getTime()
    })

    // Emit general data update
    this.emit('dataUpdate', {
      symbol,
      features,
      quality,
      timestamp: new Date(snapshot.ts).getTime()
    })
  }

  /**
   * Get latest order book data for symbol from feature snapshots
   */
  async getOrderBook(symbol: string, levels: number = 50): Promise<OrderBookData | null> {
    try {
      // Get the most recent feature snapshot for this symbol
      const { data, error } = await this.supabase
        .from('feature_snapshots')
        .select('*')
        .eq('symbol', symbol)
        .order('ts', { ascending: false })
        .limit(1)

      if (error || !data || data.length === 0) {
        return null
      }

      const snapshot = data[0]

      // Note: feature_snapshots don't contain full orderbook data,
      // just aggregated metrics. For full orderbook, we'd need to fetch from Binance REST
      // This is a limitation of the current design - we only have aggregated features

      // For now, return null to force fallback to REST
      // TODO: Consider storing full orderbook snapshots if needed
      return null

    } catch (error) {
      console.error(`Error getting orderbook for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Get spread data from feature snapshots
   */
  async getBookTicker(symbol: string): Promise<{ bid: number; ask: number; spreadBps: number } | null> {
    const snapshot = this.latestSnapshots.get(symbol)
    if (!snapshot || !snapshot.features.orderbook) return null

    // We don't have bid/ask prices in feature_snapshots, only spread
    // Return null to force REST fallback
    return null
  }

  /**
   * Get latest snapshot for symbol
   */
  getLatestSnapshot(symbol: string): FeatureSnapshot | null {
    return this.latestSnapshots.get(symbol) || null
  }

  /**
   * Get all latest snapshots
   */
  getAllLatestSnapshots(): Map<string, FeatureSnapshot> {
    return new Map(this.latestSnapshots)
  }

  /**
   * Get connection status (always "connected" since we poll)
   */
  getStatus(): {
    isConnected: boolean
    snapshots: number
    lastPoll: number
  } {
    return {
      isConnected: true, // Always connected since we poll
      snapshots: this.latestSnapshots.size,
      lastPoll: Date.now()
    }
  }

  /**
   * Stop polling and cleanup
   */
  disconnect(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    this.isPolling = false
    this.latestSnapshots.clear()
    console.log('📊 Supabase data service disconnected')
  }
}
