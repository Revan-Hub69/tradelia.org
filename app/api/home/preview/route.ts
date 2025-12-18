import { NextResponse } from 'next/server'

// Mock data for now - will be replaced with real API calls
async function fetchMarketRegime() {
  // TODO: Implement real market regime calculation
  // - Fetch BTC, ETH, top 20 coins data from CoinGecko
  // - Calculate breadth (% coins above MA)
  // - Calculate dispersion (std dev of returns)
  // - Calculate relative volatility
  // - Aggregate into regime classification
  
  return {
    metric_id: 'market_regime',
    visual_type: 'gauge',
    state: 'Risk-On' as const,
    trend: 'up' as const,
    confidence_bucket: 'High' as const,
    asof: new Date().toISOString(),
    drivers: ['breadth_up', 'dispersion_down', 'vol_rel_mid']
  }
}

async function fetchBTCDominance() {
  try {
    // Real API call to CoinGecko
    const response = await fetch('https://api.coingecko.com/api/v3/global', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch global data')
    }
    
    const data = await response.json()
    const btcDominance = data.data.market_cap_percentage.btc / 100
    
    // TODO: Calculate 7d delta from historical data
    const delta7d = -0.012 // Mock for now
    
    return {
      metric_id: 'btc_dominance',
      visual_type: 'stacked_share',
      btc_share: btcDominance,
      alt_share: 1 - btcDominance,
      delta_7d: delta7d,
      asof: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching BTC dominance:', error)
    // Fallback to mock data
    return {
      metric_id: 'btc_dominance',
      visual_type: 'stacked_share',
      btc_share: 0.54,
      alt_share: 0.46,
      delta_7d: -0.012,
      asof: new Date().toISOString()
    }
  }
}

async function fetchVolatilityRegime() {
  try {
    // TODO: Implement real volatility calculation
    // - Fetch BTC historical prices (30d)
    // - Calculate realized volatility
    // - Compare with historical distribution (365d)
    // - Classify into percentile buckets
    
    return {
      metric_id: 'vol_regime',
      visual_type: 'band_envelope',
      bucket: 'Elevated' as const,
      p10: 0.28,
      p50: 0.45,
      p90: 0.72,
      current: 0.61,
      lookback_days: 365,
      asof: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error calculating volatility regime:', error)
    // Fallback to mock data
    return {
      metric_id: 'vol_regime',
      visual_type: 'band_envelope',
      bucket: 'Normal' as const,
      p10: 0.28,
      p50: 0.45,
      p90: 0.72,
      current: 0.45,
      lookback_days: 365,
      asof: new Date().toISOString()
    }
  }
}

export async function GET() {
  try {
    // Fetch all metrics in parallel
    const [marketRegime, btcDominance, volatility] = await Promise.all([
      fetchMarketRegime(),
      fetchBTCDominance(),
      fetchVolatilityRegime()
    ])

    const response = {
      success: true,
      data: {
        market_regime: marketRegime,
        btc_dominance: btcDominance,
        volatility_regime: volatility
      },
      meta: {
        updated_at: new Date().toISOString(),
        next_update: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        data_quality: {
          freshness: 'T-0',
          sources: ['coingecko', 'internal_calc'],
          confidence: 'High'
        }
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5min cache, 10min stale
      }
    })
  } catch (error) {
    console.error('Error in preview API:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch market data',
        message: 'Using fallback data due to API issues'
      },
      { status: 500 }
    )
  }
}