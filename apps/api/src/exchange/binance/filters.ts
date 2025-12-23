import { BinanceExchangeInfo, BinanceSymbol, BinanceFilter } from '../../oms/types'

// Symbol filters and rounding utilities (PATCH #4)
export class SymbolFilters {
  private static filters: Map<string, BinanceSymbol> = new Map()

  static async loadFilters(baseUrl: string): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/fapi/v1/exchangeInfo`)
      const data: BinanceExchangeInfo = await response.json()

      this.filters.clear()
      for (const symbol of data.symbols) {
        if (symbol.status === 'TRADING') {
          this.filters.set(symbol.symbol, symbol)
        }
      }

      console.log(`Loaded ${this.filters.size} trading symbols with filters`)
    } catch (error) {
      console.error('Failed to load symbol filters:', error)
      throw error
    }
  }

  static getFilters(symbol: string): BinanceSymbol | undefined {
    return this.filters.get(symbol)
  }

  static getFilterValue(symbol: string, filterType: string, property: string): string | undefined {
    const symbolData = this.filters.get(symbol)
    if (!symbolData) return undefined

    const filter = symbolData.filters.find(f => f.filterType === filterType)
    return filter?.[property as keyof BinanceFilter] as string | undefined
  }
}

// Rounding utilities
export function roundPrice(price: number | string, tickSize: string): string {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price
  const tickSizeNum = parseFloat(tickSize)

  if (isNaN(priceNum) || isNaN(tickSizeNum)) {
    throw new Error(`Invalid price or tickSize: ${price}, ${tickSize}`)
  }

  const precision = Math.max(0, Math.ceil(-Math.log10(tickSizeNum)))
  return (Math.round(priceNum / tickSizeNum) * tickSizeNum).toFixed(precision)
}

export function roundQuantity(qty: number | string, stepSize: string, minQty?: string): string {
  const qtyNum = typeof qty === 'string' ? parseFloat(qty) : qty
  const stepSizeNum = parseFloat(stepSize)
  const minQtyNum = minQty ? parseFloat(minQty) : 0

  if (isNaN(qtyNum) || isNaN(stepSizeNum)) {
    throw new Error(`Invalid quantity or stepSize: ${qty}, ${stepSize}`)
  }

  // Ensure minimum quantity
  const adjustedQty = Math.max(qtyNum, minQtyNum)

  // Round to step size
  const precision = Math.max(0, Math.ceil(-Math.log10(stepSizeNum)))
  return (Math.floor(adjustedQty / stepSizeNum) * stepSizeNum).toFixed(precision)
}

export function validateNotional(qty: string, price: string, minNotional?: string): boolean {
  if (!minNotional) return true

  const qtyNum = parseFloat(qty)
  const priceNum = parseFloat(price)
  const minNotionalNum = parseFloat(minNotional)

  return (qtyNum * priceNum) >= minNotionalNum
}

// Order validation helpers
export interface OrderValidation {
  isValid: boolean
  errors: string[]
  roundedQty?: string
  roundedPrice?: string
}

export function validateOrder(
  symbol: string,
  side: string,
  type: string,
  quantity: string,
  price?: string,
  stopPrice?: string
): OrderValidation {
  const errors: string[] = []
  const symbolData = SymbolFilters.getFilters(symbol)

  if (!symbolData) {
    errors.push(`Symbol ${symbol} not found or not trading`)
    return { isValid: false, errors }
  }

  // Get filters
  const lotSize = symbolData.filters.find(f => f.filterType === 'LOT_SIZE')
  const priceFilter = symbolData.filters.find(f => f.filterType === 'PRICE_FILTER')
  const minNotional = symbolData.filters.find(f => f.filterType === 'MIN_NOTIONAL')

  // Validate and round quantity
  if (lotSize?.stepSize && lotSize?.minQty) {
    try {
      const roundedQty = roundQuantity(quantity, lotSize.stepSize, lotSize.minQty)
      if (parseFloat(roundedQty) !== parseFloat(quantity)) {
        // Quantity was rounded, this is usually OK but log it
      }
    } catch (error) {
      errors.push(`Invalid quantity: ${error}`)
    }
  }

  // Validate and round price (for limit orders)
  if (price && priceFilter?.tickSize) {
    try {
      const roundedPrice = roundPrice(price, priceFilter.tickSize)
      if (parseFloat(roundedPrice) !== parseFloat(price)) {
        errors.push(`Price must be multiple of tickSize ${priceFilter.tickSize}`)
      }
    } catch (error) {
      errors.push(`Invalid price: ${error}`)
    }
  }

  // Validate stop price (for stop orders)
  if (stopPrice && priceFilter?.tickSize) {
    try {
      roundPrice(stopPrice, priceFilter.tickSize)
    } catch (error) {
      errors.push(`Invalid stop price: ${error}`)
    }
  }

  // Validate min notional
  if (price && minNotional?.notional) {
    if (!validateNotional(quantity, price, minNotional.notional)) {
      errors.push(`Order value below minimum notional ${minNotional.notional}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
