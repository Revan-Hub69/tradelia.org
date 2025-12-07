import { NextResponse } from 'next/server';

const GLASSNODE_API_KEY = process.env.GLASSNODE_API_KEY;
const GLASSNODE_BASE_URL = 'https://api.glassnode.com/v1';

interface ExchangeFlowData {
  asset: string;
  deposits: number;
  withdrawals: number;
  netFlow: number;
  timestamp: number;
}

async function fetchGlassnodeMetric(
  metric: string,
  asset: string = 'BTC',
  interval: string = '24h'
): Promise<number[]> {
  if (!GLASSNODE_API_KEY) {
    throw new Error('GLASSNODE_API_KEY not configured');
  }

  const url = `${GLASSNODE_BASE_URL}/metrics/${metric}`;
  const params = new URLSearchParams({
    a: asset,
    i: interval,
    api_key: GLASSNODE_API_KEY,
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Glassnode API error: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Return last value
    return [data[data.length - 1].v];
  } catch (error) {
    console.error(`Error fetching Glassnode ${metric}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asset = searchParams.get('asset') || 'BTC';

    if (!GLASSNODE_API_KEY) {
      // Return mock data if API key not configured
      return NextResponse.json({
        success: true,
        data: {
          asset,
          deposits: 0,
          withdrawals: 0,
          netFlow: 0,
          timestamp: Date.now(),
          note: 'GLASSNODE_API_KEY not configured - using mock data',
        },
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
        },
      });
    }

    // Fetch exchange deposits and withdrawals
    const [depositsData, withdrawalsData] = await Promise.all([
      fetchGlassnodeMetric('transactions/transfers_volume_exchanges_net', asset, '24h'),
      fetchGlassnodeMetric('transactions/transfers_volume_exchanges_net', asset, '24h'),
    ]);

    const deposits = depositsData[0] || 0;
    const withdrawals = withdrawalsData[0] || 0;
    const netFlow = deposits - withdrawals;

    const result: ExchangeFlowData = {
      asset,
      deposits,
      withdrawals,
      netFlow,
      timestamp: Date.now(),
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
    console.error('Error fetching exchange flows:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch exchange flows',
        data: {
          asset: 'BTC',
          deposits: 0,
          withdrawals: 0,
          netFlow: 0,
          timestamp: Date.now(),
        },
      },
      { status: 500 }
    );
  }
}
