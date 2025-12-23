import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { HybridDataService } from './hybridDataService'
import { ScoreCalculator } from './scoreCalculator'
import { SymbolCandidate, SymbolScores, ScreenerSnapshot } from './types'

export class ScreenerService {
  private prisma: PrismaClient
  private marketDataService: HybridDataService
  private scoreCalculator: ScoreCalculator
  private isRunning: boolean = false
  private refreshTimer?: NodeJS.Timeout

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.marketDataService = new HybridDataService()
    this.scoreCalculator = new ScoreCalculator(prisma)
  }

  /**
   * Start the screener refresh cycle
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Screener is already running')
      return
    }

    if (!env.SCREENER_ENABLED) {
      console.log('Screener is disabled via configuration')
      return
    }

    this.isRunning = true
    console.log(`🔍 Starting screener (refresh every ${env.SCREENER_REFRESH_SEC}s, top ${env.SCREENER_TOP_K})`)

    // Initial run
    await this.runScreening()

    // Set up periodic refresh
    this.refreshTimer = setInterval(async () => {
      try {
        await this.runScreening()
      } catch (error) {
        console.error('Screener refresh error:', error)
      }
    }, env.SCREENER_REFRESH_SEC * 1000)
  }

  /**
   * Stop the screener
   */
  stop(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = undefined
    }
    this.isRunning = false
    console.log('🛑 Screener stopped')
  }

  /**
   * Run a single screening cycle
   */
  async runOnce(): Promise<ScreenerSnapshot> {
    console.log('🔍 Running one-time screener')
    return this.runScreening()
  }

  /**
   * Main screening pipeline
   */
  private async runScreening(): Promise<ScreenerSnapshot> {
    const startTime = Date.now()
    const snapshot: ScreenerSnapshot = {
      timestamp: new Date(),
      env: env.EXCHANGE_ENV,
      candidatesCount: 0,
      vettedCount: 0,
      topKCount: 0,
      scores: [],
      topK: [],
      wsHealth: { lagMs: 0, gapMs: 0, degraded: false }
    }

    try {
      // STEP 0: Build candidate universe
      const candidates = await this.marketDataService.buildCandidates()
      snapshot.candidatesCount = candidates.length

      if (candidates.length === 0) {
        console.warn('No candidates found for screening')
        await this.saveSnapshot(snapshot)
        return snapshot
      }

      console.log(`📊 Screening ${candidates.length} candidates`)

      // STEP 1: Fetch market data for all candidates
      const tradableSymbols = candidates.filter(c => c.isTradable).map(c => c.symbol)

      if (tradableSymbols.length === 0) {
        console.warn('No tradable symbols found')
        await this.saveSnapshot(snapshot)
        return snapshot
      }

      // Batch fetch market data
      const timeframes = env.MTF_TF_LIST.split(',').map(tf => tf.trim())

      // Fetch klines for all timeframes
      const klinesResults = await this.marketDataService.batchFetch(
        tradableSymbols,
        (symbol) => this.marketDataService.getKlinesMultiTimeframe(symbol, timeframes),
        3 // concurrency
      )

      // Fetch order books
      const orderBookResults = await this.marketDataService.batchFetch(
        tradableSymbols,
        (symbol) => this.marketDataService.getOrderBook(symbol, env.ORDERBOOK_LEVELS),
        5
      )

      // Fetch spread data
      const spreadResults = await this.marketDataService.batchFetch(
        tradableSymbols,
        (symbol) => this.marketDataService.getBookTicker(symbol),
        5
      )

      // Fetch open interest (optional)
      const oiResults = await this.marketDataService.batchFetch(
        tradableSymbols,
        (symbol) => this.marketDataService.getOpenInterest(symbol),
        3
      )

      // STEP 2: Calculate scores for each symbol
      const scores: SymbolScores[] = []
      const candidateMap = new Map(candidates.map(c => [c.symbol, c]))

      for (const symbol of tradableSymbols) {
        try {
          const candidate = candidateMap.get(symbol)
          if (!candidate) continue

          const klinesMap = klinesResults.get(symbol) || new Map()
          const orderBook = orderBookResults.get(symbol) || null
          const spreadData = spreadResults.get(symbol) || null
          const openInterest = oiResults.get(symbol) || null

          const symbolScores = await this.scoreCalculator.calculateSymbolScores(
            symbol,
            candidate,
            klinesMap,
            orderBook,
            spreadData,
            openInterest
          )

          scores.push(symbolScores)
        } catch (error) {
          console.error(`Failed to score ${symbol}:`, error)
          // Add failed symbol with zero scores
          scores.push({
            symbol,
            lqs: 0,
            vos: 0,
            dfs: 0,
            mes: 0,
            mtfGate: 'FAIL',
            totalScore: 0,
            vetoed: true,
            reasons: ['scoring_error']
          })
        }
      }

      // STEP 3: Filter and rank
      const vettedScores = scores.filter(s => !s.vetoed)
      snapshot.vettedCount = vettedScores.length
      snapshot.scores = scores

      // Sort by total score descending
      vettedScores.sort((a, b) => b.totalScore - a.totalScore)

      // Take top K
      const topKScores = vettedScores.slice(0, env.SCREENER_TOP_K)
      snapshot.topKCount = topKScores.length
      snapshot.topK = topKScores.map((score, index) => ({
        symbol: score.symbol,
        score: score.totalScore,
        rank: index + 1
      }))

      // STEP 4: Persist results
      await this.saveScores(scores)
      await this.saveSnapshot(snapshot)

      const duration = Date.now() - startTime
      console.log(`✅ Screener completed in ${duration}ms: ${snapshot.vettedCount}/${snapshot.candidatesCount} vetted, top ${snapshot.topKCount} selected`)

      return snapshot

    } catch (error) {
      console.error('Screener pipeline failed:', error)
      snapshot.wsHealth.degraded = true
      await this.saveSnapshot(snapshot)
      return snapshot
    }
  }

  /**
   * Apply top K results to TrackedSymbol table
   */
  async applyUniverse(disableOthers: boolean = false): Promise<{ updated: number; disabled: number }> {
    // Get latest screener run
    const latestRun = await this.prisma.screenerRun.findFirst({
      orderBy: { ts: 'desc' },
      take: 1
    })

    if (!latestRun || !latestRun.topK) {
      throw new Error('No screener run found or no topK data')
    }

    const topKSymbols = (latestRun.topK as any[]).map((item: any) => item.symbol)
    let updated = 0
    let disabled = 0

    // Update top K symbols to enabled
    for (const symbol of topKSymbols) {
      await this.prisma.trackedSymbol.upsert({
        where: {
          env_symbol: {
            env: env.EXCHANGE_ENV,
            symbol
          }
        },
        update: { enabled: true },
        create: {
          env: env.EXCHANGE_ENV,
          symbol,
          enabled: true
        }
      })
      updated++
    }

    // Optionally disable others
    if (disableOthers) {
      const result = await this.prisma.trackedSymbol.updateMany({
        where: {
          env: env.EXCHANGE_ENV,
          symbol: { notIn: topKSymbols },
          enabled: true
        },
        data: { enabled: false }
      })
      disabled = result.count
    }

    console.log(`📋 Applied universe: ${updated} enabled, ${disabled} disabled`)
    return { updated, disabled }
  }

  /**
   * Get current screener configuration
   */
  async getConfig(): Promise<any> {
    const dbConfig = await this.prisma.screenerConfig.findFirst()
    return {
      ...env, // Include env defaults
      ...dbConfig, // Override with DB config if exists
    }
  }

  /**
   * Update screener configuration
   */
  async updateConfig(updates: Record<string, any>): Promise<void> {
    // Validate updates
    const allowedKeys = [
      'topK', 'refreshSec', 'maxTracked', 'thresholds',
      'mtfGatePolicy', 'disableOthers'
    ]

    const filteredUpdates: Record<string, any> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (allowedKeys.includes(key)) {
        filteredUpdates[key] = value
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return
    }

    await this.prisma.screenerConfig.upsert({
      where: { id: 1 },
      update: filteredUpdates,
      create: { id: 1, env: env.EXCHANGE_ENV, ...filteredUpdates }
    })

    console.log('⚙️ Screener config updated:', filteredUpdates)
  }

  /**
   * Get latest screener snapshot
   */
  async getSnapshot(): Promise<ScreenerSnapshot | null> {
    const latestRun = await this.prisma.screenerRun.findFirst({
      orderBy: { ts: 'desc' },
      take: 1
    })

    if (!latestRun) return null

    const summary = latestRun.summary as any
    const wsHealth = latestRun.wsHealth as any
    const topK = latestRun.topK as any[]

    return {
      timestamp: latestRun.ts,
      env: latestRun.env,
      candidatesCount: summary?.candidatesCount || 0,
      vettedCount: summary?.vettedCount || 0,
      topKCount: summary?.topKCount || 0,
      scores: summary?.scores || [],
      topK: topK || [],
      wsHealth: wsHealth || { lagMs: 0, gapMs: 0, degraded: false }
    }
  }

  /**
   * Get current tracked symbols
   */
  async getTrackedSymbols(): Promise<Array<{ symbol: string; enabled: boolean }>> {
    const symbols = await this.prisma.trackedSymbol.findMany({
      where: { env: env.EXCHANGE_ENV },
      orderBy: { symbol: 'asc' }
    })

    return symbols.map(s => ({ symbol: s.symbol, enabled: s.enabled }))
  }

  /**
   * Save symbol scores to database
   */
  private async saveScores(scores: SymbolScores[]): Promise<void> {
    for (const score of scores) {
      // Use create instead of upsert since there's no unique constraint
      await this.prisma.symbolScore.create({
        data: {
          env: env.EXCHANGE_ENV,
          symbol: score.symbol,
          ts: new Date(),
          lqs: score.lqs,
          vos: score.vos,
          dfs: score.dfs,
          mes: score.mes,
          mtfGate: score.mtfGate,
          totalScore: score.totalScore,
          vetoed: score.vetoed,
          reasons: score.reasons
        }
      })
    }
  }

  /**
   * Save screener run snapshot
   */
  private async saveSnapshot(snapshot: ScreenerSnapshot): Promise<void> {
    await this.prisma.screenerRun.create({
      data: {
        env: snapshot.env,
        topK: snapshot.topK,
        summary: {
          candidatesCount: snapshot.candidatesCount,
          vettedCount: snapshot.vettedCount,
          topKCount: snapshot.topKCount,
          scores: JSON.parse(JSON.stringify(snapshot.scores)) // Serialize scores
        },
        wsHealth: snapshot.wsHealth
      }
    })
  }

  /**
   * Get screener status
   */
  getStatus(): { isRunning: boolean } {
    return { isRunning: this.isRunning }
  }
}
