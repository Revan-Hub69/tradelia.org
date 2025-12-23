import { PrismaClient } from '@prisma/client'
import { RegimeDetector } from './regimeDetector'
import { SetupDetector } from './setupDetector'
import { EntryPlanner } from './entryPlanner'
import { PositionManager } from './positionManager'
import { SignalBus } from './signalBus'
import { OMSService } from '../oms/omsService'
import { RiskEngine } from '../risk/riskEngine'
import { ScreenerService } from '../screener/screenerService'
import {
  MarketRegimeResult,
  StrategyConfig,
  StrategyStatus,
  DEFAULT_STRATEGY_CONFIG
} from './types'

export class TradingEngine {
  private prisma: PrismaClient
  private regimeDetector: RegimeDetector
  private setupDetector: SetupDetector
  private entryPlanner: EntryPlanner
  private positionManager: PositionManager
  private signalBus: SignalBus
  private oms: OMSService
  private riskEngine: RiskEngine
  private screener: ScreenerService

  private config: StrategyConfig
  private isRunning: boolean = false
  private currentRegime?: MarketRegimeResult
  private activePositions: number = 0
  private lastUpdate: Date = new Date()
  private errors: string[] = []

  constructor(
    prisma: PrismaClient,
    oms: OMSService,
    riskEngine: RiskEngine,
    screener: ScreenerService,
    config: StrategyConfig = DEFAULT_STRATEGY_CONFIG
  ) {
    this.prisma = prisma
    this.oms = oms
    this.riskEngine = riskEngine
    this.screener = screener
    this.config = config

    // Initialize components
    this.regimeDetector = new RegimeDetector(prisma)
    this.setupDetector = new SetupDetector(prisma)
    this.entryPlanner = new EntryPlanner(prisma, riskEngine, config)
    this.positionManager = new PositionManager(prisma, oms, riskEngine, config)
    this.signalBus = new SignalBus(prisma, oms)
  }

  /**
   * Start the autonomous trading engine
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Trading engine is already running')
      return
    }

    if (!this.config.enabled) {
      console.log('Trading engine is disabled via configuration')
      return
    }

    this.isRunning = true
    console.log('🚀 Starting Autonomous Trading Engine')
    console.log(`📊 Configuration: ${this.config.maxConcurrentPositions} max positions, ${this.config.riskPerTrade * 100}% risk per trade`)

    // Initial run
    await this.tradingCycle()

    // Set up periodic trading cycle (every 30 seconds)
    setInterval(async () => {
      try {
        await this.tradingCycle()
      } catch (error) {
        console.error('Trading cycle error:', error)
        this.errors.push(`Trading cycle failed: ${(error as Error).message}`)
        if (this.errors.length > 10) {
          this.errors = this.errors.slice(-10) // Keep last 10 errors
        }
      }
    }, 30000) // 30 second intervals
  }

  /**
   * Stop the trading engine
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Autonomous Trading Engine')
    this.isRunning = false

    // Emergency flatten all positions
    try {
      await this.signalBus.emergencyFlatten('Engine shutdown')
    } catch (error) {
      console.error('Emergency flatten failed during shutdown:', error)
    }
  }

  /**
   * Main trading cycle - the brain of the autonomous system
   */
  private async tradingCycle(): Promise<void> {
    const cycleStart = Date.now()

    try {
      console.log('🔄 Starting trading cycle...')

      // STEP 1: Detect market regime
      this.currentRegime = await this.regimeDetector.detectRegime()
      console.log(`📈 Regime: ${this.currentRegime.regime} (${this.currentRegime.confidence}% confidence)`)

      // STEP 2: Emergency exit if DEAD regime
      if (this.currentRegime.regime === 'DEAD' && this.currentRegime.confidence > this.config.regimeThreshold) {
        console.log('🚨 DEAD regime detected - emergency exit all positions')
        await this.signalBus.emergencyFlatten('Dead market regime')
        this.activePositions = 0
        this.lastUpdate = new Date()
        return
      }

      // STEP 3: Get current positions
      const apiKey = 'mock_key' // In production from secure storage
      const apiSecret = 'mock_secret'
      const positions = await this.positionManager.getPositionStates(apiKey, apiSecret)
      this.activePositions = positions.length

      // STEP 4: Manage existing positions
      if (positions.length > 0) {
        console.log(`📊 Managing ${positions.length} active positions`)
        const positionActions = await this.positionManager.managePositions(positions, this.currentRegime)

        if (positionActions.length > 0) {
          console.log(`🔧 Executing ${positionActions.length} position actions`)
          await this.positionManager.executeActions(positionActions)

          // Send modify signals for SL/TP changes
          for (const action of positionActions) {
            if (action.type === 'MOVE_SL' || action.type === 'TRAIL_SL') {
              const signal = this.signalBus.createModifySignal(
                action.symbol,
                'STOP_LOSS',
                action.newSlPrice?.toString() || '0',
                action.reason,
                action.confidence,
                this.currentRegime
              )
              await this.signalBus.sendSignal(signal)
            }
          }
        }
      }

      // STEP 5: Check if we can enter new positions
      const canEnterNew = this.activePositions < this.config.maxConcurrentPositions &&
                         this.currentRegime.allowedDirections.length > 0

      if (canEnterNew) {
        await this.lookForEntryOpportunities()
      }

      this.lastUpdate = new Date()
      const cycleDuration = Date.now() - cycleStart
      console.log(`✅ Trading cycle completed in ${cycleDuration}ms`)

    } catch (error) {
      console.error('Trading cycle failed:', error)
      this.errors.push(`Cycle failed: ${(error as Error).message}`)
    }
  }

  /**
   * Look for entry opportunities
   */
  private async lookForEntryOpportunities(): Promise<void> {
    try {
      // Get screened symbols from screener
      const screenerSnapshot = await this.screener.getSnapshot()
      if (!screenerSnapshot || screenerSnapshot.topK.length === 0) {
        console.log('⚠️ No screened symbols available')
        return
      }

      const availableSymbols = screenerSnapshot.topK.map(item => item.symbol)
      console.log(`🎯 Checking ${availableSymbols.length} screened symbols for setups`)

      // Detect setups
      const setups = await this.setupDetector.detectSetups(availableSymbols, this.currentRegime!)
      const validSetups = setups.filter(setup => setup.confidence >= this.config.setupMinConfidence)

      if (validSetups.length === 0) {
        console.log('🔍 No valid setups found')
        return
      }

      console.log(`💡 Found ${validSetups.length} valid setups`)

      // Plan and execute entries (limit to avoid over-trading)
      const maxNewEntries = Math.min(
        this.config.maxConcurrentPositions - this.activePositions,
        2 // Max 2 new entries per cycle
      )

      for (let i = 0; i < Math.min(validSetups.length, maxNewEntries); i++) {
        const setup = validSetups[i]

        try {
          // Plan the entry
          const orderIntent = await this.entryPlanner.planEntry(setup)

          if (orderIntent) {
            // Create and send entry signal
            const entrySignal = this.signalBus.createEntrySignal(
              orderIntent,
              this.currentRegime,
              setup
            )

            const success = await this.signalBus.sendSignal(entrySignal)

            if (success) {
              this.activePositions++
              console.log(`✅ Entry executed: ${setup.symbol} ${setup.direction} (${setup.confidence}% confidence)`)
            }
          }
        } catch (error) {
          console.error(`Entry planning failed for ${setup.symbol}:`, error)
        }
      }

    } catch (error) {
      console.error('Entry opportunity search failed:', error)
    }
  }

  /**
   * Get engine status
   */
  getStatus(): StrategyStatus {
    return {
      isRunning: this.isRunning,
      currentRegime: this.currentRegime,
      activePositions: this.activePositions,
      pendingSignals: this.signalBus.getPendingSignals().length,
      lastUpdate: this.lastUpdate,
      errors: [...this.errors]
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<StrategyConfig>): void {
    Object.assign(this.config, newConfig)
    this.entryPlanner.updateConfig(newConfig)
    this.positionManager.updateConfig(newConfig)
    console.log('⚙️ Trading engine config updated:', newConfig)
  }

  /**
   * Get current configuration
   */
  getConfig(): StrategyConfig {
    return { ...this.config }
  }

  /**
   * Emergency stop with position flattening
   */
  async emergencyStop(reason: string): Promise<void> {
    console.log(`🚨 EMERGENCY STOP: ${reason}`)
    await this.signalBus.emergencyFlatten(reason)
    this.isRunning = false
    this.errors.push(`Emergency stop: ${reason}`)
  }

  /**
   * Manual entry signal (for testing)
   */
  async manualEntry(
    symbol: string,
    side: 'LONG' | 'SHORT',
    quantity: string,
    slPrice?: string,
    tpPrice?: string
  ): Promise<boolean> {
    try {
      const intent = {
        symbol,
        planId: `manual_${Date.now()}`,
        side,
        quantity,
        slPrice,
        tpPrice,
        entryType: 'MARKET' as const,
        metadata: { manualEntry: true }
      }

      const signal = this.signalBus.createEntrySignal(intent, this.currentRegime)
      return await this.signalBus.sendSignal(signal)
    } catch (error) {
      console.error('Manual entry failed:', error)
      return false
    }
  }

  /**
   * Manual exit signal
   */
  async manualExit(symbol: string, side: 'LONG' | 'SHORT', reason: string = 'Manual exit'): Promise<boolean> {
    try {
      const signal = this.signalBus.createExitSignal(symbol, side, reason, 100, this.currentRegime)
      return await this.signalBus.sendSignal(signal)
    } catch (error) {
      console.error('Manual exit failed:', error)
      return false
    }
  }

  /**
   * Get pending signals
   */
  getPendingSignals() {
    return this.signalBus.getPendingSignals()
  }

  /**
   * Cancel a pending signal
   */
  cancelSignal(signalId: string): boolean {
    return this.signalBus.cancelSignal(signalId)
  }
}
