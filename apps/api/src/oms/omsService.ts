import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { BinanceRestClient } from '../exchange/binance/restClient'
import { SymbolFilters, roundQuantity, roundPrice } from '../exchange/binance/filters'
import { OrderIntent, ClientOrderIdComponents, OrderPlacement } from './types'

export class OMSService {
  private prisma: PrismaClient
  private binanceClient: BinanceRestClient

  constructor(prisma: PrismaClient, binanceClient: BinanceRestClient) {
    this.prisma = prisma
    this.binanceClient = binanceClient
  }

  /**
   * Build deterministic clientOrderId
   */
  private buildClientOrderId(components: ClientOrderIdComponents): string {
    const { env, symbol, planId, leg, seq } = components
    return `TRD|${env}|${symbol}|${planId}|${leg}|${seq}`
  }

  /**
   * Parse clientOrderId back to components
   */
  private parseClientOrderId(clientOrderId: string): ClientOrderIdComponents | null {
    const parts = clientOrderId.split('|')
    if (parts.length !== 6 || parts[0] !== 'TRD') {
      return null
    }

    return {
      env: parts[1] as 'testnet' | 'live',
      symbol: parts[2],
      planId: parts[3],
      leg: parts[4] as any,
      seq: parseInt(parts[5]),
    }
  }

  /**
   * Submit order intent (main entry point)
   */
  async submitIntent(intent: OrderIntent, apiKey: string, apiSecret: string): Promise<any> {
    const { symbol, planId, side, quantity, slPrice, tpPrice, entryType, entryPrice, positionSide } = intent

    // Validate symbol and get filters
    const symbolData = SymbolFilters.getFilters(symbol)
    if (!symbolData) {
      throw new Error(`Symbol ${symbol} not found or not trading`)
    }

    // Determine entry side and position side
    let entrySide: 'BUY' | 'SELL'
    let posSide: 'LONG' | 'SHORT' | undefined

    if (env.POSITION_MODE === 'hedge') {
      posSide = positionSide || (side === 'LONG' ? 'LONG' : 'SHORT')
      entrySide = posSide === 'LONG' ? 'BUY' : 'SELL'
    } else {
      // Oneway mode
      entrySide = side === 'LONG' ? 'BUY' : 'SELL'
    }

    // Round quantity
    const roundedQty = roundQuantity(quantity, symbolData.filters.find(f => f.filterType === 'LOT_SIZE')?.stepSize || '0.001')

    // Place entry order
    const entryOrder = await this.placeOrder({
      clientOrderId: this.buildClientOrderId({
        env: env.EXCHANGE_ENV,
        symbol,
        planId,
        leg: 'ENTRY',
        seq: 1,
      }),
      symbol,
      side: entrySide,
      type: entryType === 'LIMIT' && entryPrice ? 'LIMIT' : 'MARKET',
      quantity: roundedQty,
      price: entryType === 'LIMIT' && entryPrice ? roundPrice(entryPrice, symbolData.filters.find(f => f.filterType === 'PRICE_FILTER')?.tickSize || '0.01') : undefined,
      reduceOnly: false,
      positionSide: posSide,
    }, apiKey, apiSecret)

    // Place SL order (reduce-only)
    if (slPrice) {
      const slPriceRounded = roundPrice(slPrice, symbolData.filters.find(f => f.filterType === 'PRICE_FILTER')?.tickSize || '0.01')

      await this.placeOrder({
        clientOrderId: this.buildClientOrderId({
          env: env.EXCHANGE_ENV,
          symbol,
          planId,
          leg: 'SL',
          seq: 1,
        }),
        symbol,
        side: entrySide === 'BUY' ? 'SELL' : 'BUY', // Opposite side for exit
        type: 'STOP_MARKET',
        quantity: roundedQty,
        stopPrice: slPriceRounded,
        reduceOnly: true,
        positionSide: posSide,
      }, apiKey, apiSecret)
    }

    // Place TP order (reduce-only)
    if (tpPrice) {
      const tpPriceRounded = roundPrice(tpPrice, symbolData.filters.find(f => f.filterType === 'PRICE_FILTER')?.tickSize || '0.01')

      await this.placeOrder({
        clientOrderId: this.buildClientOrderId({
          env: env.EXCHANGE_ENV,
          symbol,
          planId,
          leg: 'TP1',
          seq: 1,
        }),
        symbol,
        side: entrySide === 'BUY' ? 'SELL' : 'BUY', // Opposite side for exit
        type: 'TAKE_PROFIT_MARKET',
        quantity: roundedQty,
        stopPrice: tpPriceRounded,
        reduceOnly: true,
        positionSide: posSide,
      }, apiKey, apiSecret)
    }

    return {
      planId,
      entryOrder,
      slPlaced: !!slPrice,
      tpPlaced: !!tpPrice,
    }
  }

  /**
   * Place order with idempotency
   */
  private async placeOrder(
    placement: OrderPlacement,
    apiKey: string,
    apiSecret: string
  ): Promise<any> {
    const { clientOrderId, symbol, side, type, quantity, price, stopPrice, reduceOnly, timeInForce, positionSide } = placement

    // Check if order already exists (idempotency)
    const existingOrder = await this.prisma.orderRecord.findUnique({
      where: { clientOrderId },
    })

    if (existingOrder) {
      console.log(`Order ${clientOrderId} already exists, skipping`)
      return existingOrder
    }

    try {
      // Place order on exchange
      const orderResult = await this.binanceClient.placeOrder(
        symbol,
        side,
        type,
        quantity,
        price,
        stopPrice,
        reduceOnly,
        timeInForce,
        positionSide,
        apiKey,
        apiSecret
      )

      // Record in database
      const orderRecord = await this.prisma.orderRecord.create({
        data: {
          clientOrderId,
          symbol,
          planId: this.parseClientOrderId(clientOrderId)?.planId || '',
          leg: this.parseClientOrderId(clientOrderId)?.leg || 'UNKNOWN',
          seq: this.parseClientOrderId(clientOrderId)?.seq || 0,
          side,
          type,
          quantity,
          price,
          stopPrice,
          reduceOnly: reduceOnly || false,
          timeInForce,
          positionSide,
          status: 'PLACED',
          exchangeOrderId: orderResult.orderId?.toString(),
        },
      })

      return orderRecord

    } catch (error) {
      // Record failed order
      await this.prisma.orderRecord.create({
        data: {
          clientOrderId,
          symbol,
          planId: this.parseClientOrderId(clientOrderId)?.planId || '',
          leg: this.parseClientOrderId(clientOrderId)?.leg || 'UNKNOWN',
          seq: this.parseClientOrderId(clientOrderId)?.seq || 0,
          side,
          type,
          quantity,
          price,
          stopPrice,
          reduceOnly: reduceOnly || false,
          timeInForce,
          positionSide,
          status: 'REJECTED',
          lastError: (error as Error).message,
        },
      })

      throw error
    }
  }

  /**
   * Cancel all orders for symbol
   */
  async cancelAllOrders(symbol: string, apiKey: string, apiSecret: string): Promise<any> {
    const result = await this.binanceClient.cancelAllOrders(symbol, apiKey, apiSecret)

    // Update database records
    await this.prisma.orderRecord.updateMany({
      where: {
        symbol,
        status: { in: ['PLACED', 'PENDING'] },
      },
      data: {
        status: 'CANCELED',
        updatedAt: new Date(),
      },
    })

    return result
  }

  /**
   * Flatten position (close with market order)
   */
  async flattenPosition(
    symbol: string,
    positionSide?: 'LONG' | 'SHORT',
    apiKey?: string,
    apiSecret?: string
  ): Promise<any> {
    // Get current position
    const positions = await this.binanceClient.getPositionRisk(apiKey!, apiSecret!)
    const position = positions.find((p: any) => {
      if (env.POSITION_MODE === 'hedge' && positionSide) {
        return p.symbol === symbol && p.positionSide === positionSide
      }
      return p.symbol === symbol && parseFloat(p.positionAmt) !== 0
    })

    if (!position || parseFloat(position.positionAmt) === 0) {
      return { message: 'No position to flatten' }
    }

    const qty = Math.abs(parseFloat(position.positionAmt)).toString()
    const side = parseFloat(position.positionAmt) > 0 ? 'SELL' : 'BUY'

    // Place flatten order
    const result = await this.binanceClient.placeOrder(
      symbol,
      side,
      'MARKET',
      qty,
      undefined, // price
      undefined, // stopPrice
      true, // reduceOnly
      undefined, // timeInForce
      positionSide,
      apiKey,
      apiSecret
    )

    // Record flatten order
    await this.prisma.orderRecord.create({
      data: {
        clientOrderId: `FLAT-${Date.now()}-${symbol}`,
        symbol,
        planId: 'EMERGENCY',
        leg: 'FLAT',
        seq: 1,
        side,
        type: 'MARKET',
        quantity: qty,
        reduceOnly: true,
        positionSide,
        status: 'PLACED',
        exchangeOrderId: result.orderId?.toString(),
      },
    })

    return result
  }

  /**
   * Get open orders
   */
  async getOpenOrders(symbol: string, apiKey: string, apiSecret: string): Promise<any> {
    return this.binanceClient.getOpenOrders(symbol, apiKey, apiSecret)
  }

  /**
   * Get positions
   */
  async getPositions(apiKey: string, apiSecret: string): Promise<any> {
    return this.binanceClient.getPositionRisk(apiKey, apiSecret)
  }
}
