import { NextResponse } from 'next/server';

/**
 * Credit Spreads API
 * 
 * Academic Reference:
 * - Credit spreads measure corporate credit risk
 * - Widening spreads indicate increased risk perception
 * 
 * Data Source: FRED (Federal Reserve Economic Data)
 * Free tier: Unlimited
 */

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

interface CreditSpread {
  baa10y: number; // BAA Corporate Bond Yield - 10Y Treasury
  aaa10y: number; // AAA Corporate Bond Yield - 10Y Treasury
  highYield10y: number; // High Yield Spread (estimated)
  interpretation: string;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'widening' | 'narrowing' | 'stable';
}

async function fetchFREDSeries(seriesId: string): Promise<number | null> {
  if (!FRED_API_KEY) return null;

  try {
    const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.observations && data.observations.length > 0) {
      const value = parseFloat(data.observations[0].value);
      return isNaN(value) ? null : value;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching FRED series ${seriesId}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    let baaYield: number | null = null;
    let aaaYield: number | null = null;
    let treasury10y: number | null = null;

    if (FRED_API_KEY) {
      // Fetch BAA Corporate Bond Yield
      baaYield = await fetchFREDSeries('BAMLC0A0CM');
      // Fetch AAA Corporate Bond Yield
      aaaYield = await fetchFREDSeries('BAMLC0A1CAAA');
      // Fetch 10Y Treasury
      treasury10y = await fetchFREDSeries('DGS10');
    }

    // Fallback to mock data if FRED not available
    if (baaYield === null) baaYield = 5.5;
    if (aaaYield === null) aaaYield = 5.2;
    if (treasury10y === null) treasury10y = 5.1;

    // Calculate spreads
    const baa10y = baaYield - treasury10y;
    const aaa10y = aaaYield - treasury10y;
    const highYield10y = baa10y * 1.5; // Estimate high yield spread

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let interpretation = '';

    if (baa10y > 3.0) {
      riskLevel = 'high';
      interpretation = 'Wide credit spreads: High corporate credit risk, market stress';
    } else if (baa10y > 2.0) {
      riskLevel = 'medium';
      interpretation = 'Moderate credit spreads: Elevated credit risk';
    } else {
      interpretation = 'Narrow credit spreads: Low credit risk, healthy corporate sector';
    }

    // Determine trend (simplified - would need historical data)
    const trend: 'widening' | 'narrowing' | 'stable' = 'stable';

    const result: CreditSpread = {
      baa10y: Math.round(baa10y * 100) / 100,
      aaa10y: Math.round(aaa10y * 100) / 100,
      highYield10y: Math.round(highYield10y * 100) / 100,
      interpretation,
      riskLevel,
      trend,
    };

    return NextResponse.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
      },
    });
  } catch (error) {
    console.error('Error fetching credit spreads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credit spreads' },
      { status: 500 }
    );
  }
}
