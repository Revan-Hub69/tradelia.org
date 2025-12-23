import { OMSService } from '../oms/omsService'
import { OrderIntent } from './types'

interface PaperPosition {
  symbol: string
  side: 'LONG' | 'SHORT'
  quantity: string
  entryPrice: string
  entryTime: Date
  pnl: string
  status: 'OPEN' | 'CLOSED'
  closePrice?: string
  closeTime?: Date
}

interface PaperOrder {
  orderId: string
  symbol: string
  side: 'BUY' | 'SELL'
  type: 'MARKET' | 'LIMIT'
  quantity: string
  price?: string
  status: 'FILLED' | 'PENDING' | 'CANCELLED'
  timestamp: Date
}

export class PaperTradingOMS {
  private positions: Map<string, PaperPosition> = new Map()
  private orders: PaperOrder[] = []
  private currentPrices: Map<string, number> = new Map()
  private accountBalance: number = 10000 // Mock starting balance
  private isEnabled: boolean = false

  constructor(private realOMS?: OMSService) {}

  /**
   * Enable paper trading mode
   */
  enable(): void {
    this.isEnabled = true
    console.log('📝 Paper trading mode enabled')
  }

  /**
   * Disable paper trading mode
   */
  disable(): void {
    this.isEnabled = false
    console.log('📝 Paper trading mode disabled')
  }

  /**
   * Submit order intent in paper trading mode
   */
  async submitIntent(intent: OrderIntent): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.isEnabled) {
      // Fallback to real OMS if paper trading disabled
      return this.realOMS?.submitIntent(intent, 'mock_key', 'mock_secret') || { success: false }
    }

    try {
      const currentPrice = this.getCurrentPrice(intent.symbol)
      if (!currentPrice) {
        return { success: false, error: 'No price available for symbol' }
      }

      // Create paper order
      const order: PaperOrder = {
        orderId: `paper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: intent.symbol,
        side: intent.side === 'LONG' ? 'BUY' : 'SELL',
        type: intent.entryType || 'MARKET',
        quantity: intent.quantity,
        price: intent.entryType === 'LIMIT' ? intent.entryPrice : undefined,
        status: 'FILLED',
        timestamp: new Date()
      }

      this.orders.push(order)

      // Execute position change
      await this.updatePosition(order, currentPrice)

      console.log(`📝 Paper order executed: ${order.side} ${order.quantity} ${order.symbol} @ ${currentPrice}`)

      return {
        success: true,
        result: {
          orderId: order.orderId,
          executedQty: order.quantity,
          executedPrice: currentPrice.toString(),
          status: 'FILLED'
        }
      }
    } catch (error) {
      console.error('Paper order execution failed:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Flatten position in paper trading
   */
  async flattenPosition(symbol: string, positionSide?: 'LONG' | 'SHORT'): Promise<any> {
    if (!this.isEnabled) {
      return this.realOMS?.flattenPosition(symbol, positionSide, 'mock_key', 'mock_secret')
    }

    const positionKey = `${symbol}_${positionSide || 'LONG'}`
    const position = this.positions.get(positionKey)

    if (!position || position.status !== 'OPEN') {
      return { success: false, error: 'No open position found' }
    }

    const currentPrice = this.getCurrentPrice(symbol)
    if (!currentPrice) {
      return { success: false, error: 'No price available' }
    }

    // Close position
    position.status = 'CLOSED'
    position.closePrice = currentPrice.toString()
    position.closeTime = new Date()

    // Calculate final P&L
    const entryPrice = parseFloat(position.entryPrice)
    const closePrice = currentPrice
    const quantity = parseFloat(position.quantity)

    const pnl = position.side === 'LONG'
      ? (closePrice - entryPrice) * quantity
      : (entryPrice - closePrice) * quantity

    position.pnl = pnl.toFixed(2)
    this.accountBalance += pnl

    console.log(`📝 Paper position closed: ${symbol} ${position.side} P&L: ${position.pnl}`)

    return {
      success: true,
      symbol,
      side: position.side,
      pnl: position.pnl,
      closePrice: position.closePrice
    }
  }

  /**
   * Get positions in paper trading mode
   */
  async getPositions(): Promise<any[]> {
    if (!this.isEnabled && this.realOMS) {
      return this.realOMS.getPositions('mock_key', 'mock_secret')
    }

    const positions = Array.from(this.positions.values())
      .filter(p => p.status === 'OPEN')
      .map(position => {
        const currentPrice = this.getCurrentPrice(position.symbol) || 0
        const entryPrice = parseFloat(position.entryPrice)
        const quantity = parseFloat(position.quantity)

        const unrealizedPnl = position.side === 'LONG'
          ? (currentPrice - entryPrice) * quantity
          : (entryPrice - currentPrice) * quantity

        return {
          symbol: position.symbol,
          positionSide: position.side,
          positionAmt: position.quantity,
          entryPrice: position.entryPrice,
          markPrice: currentPrice.toString(),
          unrealizedProfit: unrealizedPnl.toFixed(2),
          updateTime: Date.now()
        }
      })

    return positions
  }

  /**
   * Get orders in paper trading mode
   */
  async getOpenOrders(symbol?: string): Promise<any[]> {
    if (!this.isEnabled && this.realOMS) {
      return this.realOMS.getOpenOrders(symbol || '', 'mock_key', 'mock_secret')
    }

    let orders = this.orders.filter(o => o.status === 'PENDING')

    if (symbol) {
      orders = orders.filter(o => o.symbol === symbol)
    }

    return orders.map(order => ({
      orderId: order.orderId,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      origQty: order.quantity,
      price: order.price || '0',
      status: order.status,
      updateTime: order.timestamp.getTime()
    }))
  }

  /**
   * Update current price for symbol (used for paper trading simulation)
   */
  updatePrice(symbol: string, price: number): void {
    this.currentPrices.set(symbol, price)
  }

  /**
   * Get current price for symbol
   */
  private getCurrentPrice(symbol: string): number | undefined {
    return this.currentPrices.get(symbol)
  }

  /**
   * Update position based on order execution
   */
  private async updatePosition(order: PaperOrder, executionPrice: number): Promise<void> {
    const symbol = order.symbol
    const quantity = parseFloat(order.quantity)
    const positionKey = `${symbol}_${order.side === 'BUY' ? 'LONG' : 'SHORT'}`

    // Check if position already exists
    const existingPosition = this.positions.get(positionKey)

    if (existingPosition && existingPosition.status === 'OPEN') {
      // Add to existing position
      const existingQty = parseFloat(existingPosition.quantity)
      const newQty = existingQty + quantity

      // Recalculate average entry price
      const existingValue = parseFloat(existingPosition.entryPrice) * existingQty
      const newValue = executionPrice * quantity
      const avgPrice = (existingValue + newValue) / newQty

      existingPosition.quantity = newQty.toString()
      existingPosition.entryPrice = avgPrice.toFixed(4)
    } else {
      // Create new position
      const position: PaperPosition = {
        symbol,
        side: order.side === 'BUY' ? 'LONG' : 'SHORT',
        quantity: order.quantity,
        entryPrice: executionPrice.toFixed(4),
        entryTime: new Date(),
        pnl: '0',
        status: 'OPEN'
      }

      this.positions.set(positionKey, position)
    }

    // Update account balance (simulate margin usage)
    const positionValue = executionPrice * quantity
    // In paper trading, we don't actually deduct from balance
    // But we track it for reporting
  }

  /**
   * Get paper trading statistics
   */
  getStats(): {
    isEnabled: boolean
    accountBalance: number
    openPositions: number
    totalOrders: number
    positions: PaperPosition[]
    orders: PaperOrder[]
  } {
    return {
      isEnabled: this.isEnabled,
      accountBalance: this.accountBalance,
      openPositions: Array.from(this.positions.values()).filter(p => p.status === 'OPEN').length,
      totalOrders: this.orders.length,
      positions: Array.from(this.positions.values()),
      orders: this.orders.slice(-50) // Last 50 orders
    }
  }

  /**
   * Reset paper trading state
   */
  reset(): void {
    this.positions.clear()
    this.orders = []
    this.currentPrices.clear()
    this.accountBalance = 10000
    console.log('📝 Paper trading state reset')
  }

  /**
   * Import real positions for paper trading simulation
   */
  async importRealPositions(apiKey: string, apiSecret: string): Promise<void> {
    if (!this.realOMS) return

    try {
      const realPositions = await this.realOMS.getPositions(apiKey, apiSecret)

      for (const pos of realPositions) {
        const paperPosition: PaperPosition = {
          symbol: pos.symbol,
          side: pos.positionSide === 'SHORT' ? 'SHORT' : 'LONG',
          quantity: pos.positionAmt,
          entryPrice: pos.entryPrice,
          entryTime: new Date(),
          pnl: '0',
          status: 'OPEN'
        }

        const positionKey = `${pos.symbol}_${paperPosition.side}`
        this.positions.set(positionKey, paperPosition)
      }

      console.log(`📝 Imported ${realPositions.length} real positions to paper trading`)
    } catch (error) {
      console.error('Failed to import real positions:', error)
    }
  }
}
