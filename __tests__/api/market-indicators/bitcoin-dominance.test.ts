import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/market-indicators/bitcoin-dominance/route';

// Mock fetch
global.fetch = vi.fn();

describe('Bitcoin Dominance API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return Bitcoin Dominance data', async () => {
    const mockData = {
      data: {
        total_market_cap: { usd: 2000000000000 },
        active_cryptocurrencies: 10000,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('dominance');
    expect(data).toHaveProperty('bitcoinMarketCap');
    expect(data).toHaveProperty('totalMarketCap');
  });

  it('should handle API errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

    const response = await GET();
    expect(response.status).toBe(500);
  });
});
