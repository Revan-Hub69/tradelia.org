import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/currency/exchangeRate';

/**
 * GET /api/currency/exchange-rate
 * Returns current EUR/USD exchange rate
 * Cached for 24 hours
 */
export async function GET(request: NextRequest) {
  try {
    const rate = await getExchangeRate();
    
    return NextResponse.json({
      rate,
      from: 'EUR',
      to: 'USD',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    
    // Return fallback rate
    return NextResponse.json({
      rate: 1.10,
      from: 'EUR',
      to: 'USD',
      timestamp: Date.now(),
      fallback: true,
    });
  }
}
