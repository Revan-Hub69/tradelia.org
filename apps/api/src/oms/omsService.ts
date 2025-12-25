import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { BinanceRestClient } from '../exchange/binance/restClient'
import { SymbolFilters, roundQuantity, roundPrice } from '../exchange/binance/filters'
import { OrderIntent, ClientOrderIdComponents, OrderPlacement } from './types'
import { omsLogger, ERROR_TYPES, logError, logInfo } from '../lib/logger'

// Helper functions for correlation IDs
function generateCorrelationId(): string {
  return `oms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function setCorrelationId(id: string): void {
  // Set correlation ID in async local storage if available
  // For now, just log it
  omsLogger.debug({ msg: 'Correlation ID set', correlationId: id })
}

export class OMSService {
  private prisma: PrismaClient
  private binanceClient: BinanceRestClient

  constructor(prisma: PrismaClient, binanceClient: BinanceRestClient) {
    this.prisma = prisma
    this.binanceClient = binanceClient
  }

  /**
   * Submit order intent with basic idempotency
   */
  async submitIntent(intent: OrderIntent, apiKey: string, apiSecret: string, idempotencyKey?: string): Promise<any> {
    const { symbol, planId, side, quantity, slPrice, tpPrice, entryType, entryPrice, positionSide } = intent

    // Generate idempotency key if not provided
    const key = idempotencyKey || `oms_submit_${planId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Set correlation ID for this request
    const correlationId = generateCorrelationId()
    setCorrelationId(correlationId)

    omsLogger.info({
      msg: 'Submitting order intent',
      planId,
      symbol,
      side,
      quantity,
      idempotencyKey: key
    })

    try {
      // Check idempotency (prevent duplicate submissions)
      const existingExecution = await this.prisma.orderRecord.findFirst({
        where: {
          planId,
          env: env.EXCHANGE_ENV,
          status: { not: 'REJECTED' }
        }
      })

      if (existingExecution) {
        omsLogger.warn({
          msg: 'Order intent already processed, returning existing execution',
          planId,
          existingOrderId: existingExecution.clientOrderId
        })
        return { planId, status: 'ALREADY_EXECUTED' }
      }

      // Create job record
      const job = await this.prisma.job.create({
        data: {
          sessionId: 'default', // TODO: get from context
          planId,
          requestId: key,
          type: 'EXECUTE_PLAN',
          payload: { planId, intent, correlationId },
          status: 'PROCESSING',
          maxAttempts: 3,
          attempts: 1
        }
      })

      try {
        // Execute the order placement logic
        const result = await this.executeOrderPlacement(intent, apiKey, apiSecret)

        // Mark job as completed
        await this.prisma.job.update({
          where: { requestId: key },
          data: {
            status: 'COMPLETED',
            error: null
          }
        })

        omsLogger.info({
          msg: 'Order intent executed successfully',
          planId,
          symbol,
          side,
          quantity,
          entryOrderId: result.entryOrder?.clientOrderId,
          correlationId
        })

        return result

      } catch (error) {
        // Mark job as failed
        await this.prisma.job.update({
          where: { requestId: key },
          data: {
            status: 'FAILED',
            error: (error as Error).message
          }
        })
        throw error
      }

    } catch (error) {
      logError(error as Error, ERROR_TYPES.OMS_ORDER_FAILED, { planId, symbol, side, quantity })
      throw error
    }
  }

  /**
   * Execute order placement logic
   */
  private async executeOrderPlacement(intent: OrderIntent, apiKey: string, apiSecret: string): Promise<any> {
    const { symbol, planId, side, quantity, slPrice, tpPrice, entryType, entryPrice, positionSide } = intent

    // Get symbol data
    const symbolData = await this.binanceClient.getExchangeInfo()
    const symbolInfo = symbolData.symbols.find((s: any) => s.symbol === symbol)

    if (!symbolInfo) {
      throw new Error(`Symbol ${symbol} not found`)
    }

    // Determine position side and entry side
    let posSide: 'LONG' | 'SHORT' | undefined
    let entrySide: 'BUY' | 'SELL'

    if (env.POSITION_MODE === 'hedge') {
      if (positionSide) {
        posSide = positionSide
        entrySide = positionSide === 'LONG' ? 'BUY' : 'SELL'
      } else {
        throw new Error('Position side required in hedge mode')
      }
    } else {
      posSide = undefined
      entrySide = side === 'LONG' ? 'BUY' : 'SELL'
    }

    // Round quantity and prices
    const roundedQty = roundQuantity(quantity, symbolInfo.filters.find((f: any) => f.filterType === 'LOT_SIZE')?.stepSize || '0.001')

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
      price: entryType === 'LIMIT' && entryPrice ? roundPrice(entryPrice, symbolInfo.filters.find((f: any) => f.filterType === 'PRICE_FILTER')?.tickSize || '0.01') : undefined,
      reduceOnly: false,
      positionSide: posSide,
    }, apiKey, apiSecret)

    // Place SL order (reduce-only)
    if (slPrice) {
      const slPriceRounded = roundPrice(slPrice, symbolInfo.filters.find((f: any) => f.filterType === 'PRICE_FILTER')?.tickSize || '0.01')

      await this.placeOrder({
        clientOrderId: this.buildClientOrderId({
          env: env.EXCHANGE_ENV,
          symbol,
          planId,
          leg: 'SL',
          seq: 1,
        }),
        symbol,
        side: entrySide === 'BUY' ? 'SELL' : 'BUY',
        type: 'STOP_MARKET',
        quantity: roundedQty,
        stopPrice: slPriceRounded,
        reduceOnly: true,
        positionSide: posSide,
      }, apiKey, apiSecret)
    }

    // Place TP order (reduce-only)
    if (tpPrice) {
      const tpPriceRounded = roundPrice(tpPrice, symbolInfo.filters.find((f: any) => f.filterType === 'PRICE_FILTER')?.tickSize || '0.01')

      await this.placeOrder({
        clientOrderId: this.buildClientOrderId({
          env: env.EXCHANGE_ENV,
          symbol,
          planId,
          leg: 'TP1',
          seq: 1,
        }),
        symbol,
        side: entrySide === 'BUY' ? 'SELL' : 'BUY',
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
   * Build client order ID from components
   */
  private buildClientOrderId(components: ClientOrderIdComponents): string {
    const { env, symbol, planId, leg, seq } = components
    return `${env}_${symbol}_${planId}_${leg}_${seq}_${Date.now()}`
  }

  /**
   * Parse client order ID into components
   */
  private parseClientOrderId(clientOrderId: string): ClientOrderIdComponents | null {
    const parts = clientOrderId.split('_')
    if (parts.length < 6) return null

    return {
      env: parts[0] as 'testnet' | 'live',
      symbol: parts[1],
      planId: parts[2],
      leg: parts[3] as any,
      seq: parseInt(parts[4], 10)
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
      const parsedId = this.parseClientOrderId(clientOrderId)
      const orderRecord = await this.prisma.orderRecord.create({
        data: {
          env: env.EXCHANGE_ENV,
          clientOrderId,
          symbol,
          planId: parsedId?.planId || '',
          leg: parsedId?.leg || 'UNKNOWN',
          seq: parsedId?.seq || 0,
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
          env: env.EXCHANGE_ENV,
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
        env: env.EXCHANGE_ENV,
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
