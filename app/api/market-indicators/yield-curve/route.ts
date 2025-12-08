import { NextResponse } from 'next/server';

/**
 * Yield Curve API
 * 
 * Academic Reference:
 * - Estrella, A., & Mishkin, F. S. (1998). "Predicting U.S. Recessions"
 * - Yield curve inversion (short > long) is a recession predictor
 * 
 * Data Source: FRED (Federal Reserve Economic Data)
 * Free tier: Unlimited
 */

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

interface YieldCurve {
  '1M': number;
  '3M': number;
  '6M': number;
  '1Y': number;
  '2Y': number;
  '5Y': number;
  '10Y': number;
  '30Y': number;
  spread: {
    '10Y-2Y': number;
    '10Y-3M': number;
    '2Y-3M': number;
  };
  inversion: boolean;
  interpretation: string;
  recessionRisk: 'low' | 'medium' | 'high';
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
    // FRED Series IDs for Treasury yields
    const seriesMap: Record<string, string> = {
      '1M': 'DGS1MO',   // 1-Month Treasury
      '3M': 'DGS3MO',   // 3-Month Treasury
      '6M': 'DGS6MO',   // 6-Month Treasury
      '1Y': 'DGS1',     // 1-Year Treasury
      '2Y': 'DGS2',     // 2-Year Treasury
      '5Y': 'DGS5',     // 5-Year Treasury
      '10Y': 'DGS10',   // 10-Year Treasury
      '30Y': 'DGS30',   // 30-Year Treasury
    };

    let yields: Partial<YieldCurve> = {};

    if (FRED_API_KEY) {
      // Fetch all yields in parallel
      const yieldPromises = Object.entries(seriesMap).map(async ([key, seriesId]) => {
        const value = await fetchFREDSeries(seriesId);
        return [key, value] as [string, number | null];
      });

      const yieldResults = await Promise.all(yieldPromises);
      yieldResults.forEach(([key, value]) => {
        if (value !== null && key in yields) {
          (yields as any)[key] = value;
        }
      });
    }

    // Fallback to mock data if FRED not available
    if (Object.keys(yields).length === 0) {
      yields = {
        '1M': 4.5,
        '3M': 4.6,
        '6M': 4.7,
        '1Y': 4.8,
        '2Y': 4.9,
        '5Y': 5.0,
        '10Y': 5.1,
        '30Y': 5.2,
      };
    }

    const fullYields = yields as YieldCurve;

    // Calculate spreads
    const spread10Y2Y = (fullYields['10Y'] || 0) - (fullYields['2Y'] || 0);
    const spread10Y3M = (fullYields['10Y'] || 0) - (fullYields['3M'] || 0);
    const spread2Y3M = (fullYields['2Y'] || 0) - (fullYields['3M'] || 0);

    // Check for inversion (negative spread)
    const inversion = spread10Y2Y < 0 || spread2Y3M < 0;

    // Determine recession risk
    let recessionRisk: 'low' | 'medium' | 'high' = 'low';
    let interpretation = '';

    if (inversion && spread10Y2Y < -0.5) {
      recessionRisk = 'high';
      interpretation = 'Yield curve inverted: Strong recession signal (Estrella & Mishkin, 1998)';
    } else if (inversion) {
      recessionRisk = 'medium';
      interpretation = 'Yield curve inverted: Recession warning signal';
    } else if (spread10Y2Y < 0.5) {
      recessionRisk = 'medium';
      interpretation = 'Yield curve flattening: Monitor for potential inversion';
    } else {
      interpretation = 'Normal yield curve: Steep curve indicates healthy economic expectations';
    }

    const result: YieldCurve = {
      ...fullYields,
      spread: {
        '10Y-2Y': Math.round(spread10Y2Y * 100) / 100,
        '10Y-3M': Math.round(spread10Y3M * 100) / 100,
        '2Y-3M': Math.round(spread2Y3M * 100) / 100,
      },
      inversion,
      interpretation,
      recessionRisk,
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
    console.error('Error fetching yield curve:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch yield curve' },
      { status: 500 }
    );
  }
}
