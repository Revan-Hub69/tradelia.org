'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface TopMoversData {
  gainers: Array<{
    symbol: string;
    name: string;
    change: number;
    changePercent: number;
    volume: number;
    price: number;
  }>;
  losers: Array<{
    symbol: string;
    name: string;
    change: number;
    changePercent: number;
    volume: number;
    price: number;
  }>;
  highVolume: Array<{
    symbol: string;
    name: string;
    volume: number;
    price: number;
  }>;
  aiReading: string;
  timestamp: string;
}

interface CryptoTopMoversProps {
  isPro: boolean;
}

/**
 * Crypto Top Movers Analysis
 * 
 * Features:
 * - Top gainers/losers
 * - High volume crypto
 * - Groq AI reading
 * 
 * Updates: Every 1 minute (real-time)
 */
export default function CryptoTopMovers({ isPro }: CryptoTopMoversProps) {
  const t = useTranslations('Dashboard');
  const [data, setData] = useState<TopMoversData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPro) {
      setIsLoading(false);
      return;
    }

    const fetchTopMovers = async () => {
      try {
        const response = await fetch('/api/crypto/top-movers');
        if (!response.ok) throw new Error('Failed to fetch top movers');
        
        const moversData = await response.json();
        setData(moversData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading top movers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopMovers();
    // Update every 1 minute
    const interval = setInterval(fetchTopMovers, 60000);
    return () => clearInterval(interval);
  }, [isPro]);

  if (!isPro) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Upgrade to Pro to access Top Movers Analysis</p>
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Upgrade to Pro
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading top movers...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive">Error loading top movers data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Gainers */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Gainers</h3>
        <div className="space-y-2">
          {data.gainers.slice(0, 10).map((gainer, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{gainer.symbol} ({gainer.name})</p>
                  <p className="text-sm text-muted-foreground">${gainer.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    +{gainer.changePercent.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vol: ${(gainer.volume / 1e6).toFixed(2)}M
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Losers</h3>
        <div className="space-y-2">
          {data.losers.slice(0, 10).map((loser, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{loser.symbol} ({loser.name})</p>
                  <p className="text-sm text-muted-foreground">${loser.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    {loser.changePercent.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vol: ${(loser.volume / 1e6).toFixed(2)}M
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High Volume */}
      <div>
        <h3 className="text-lg font-semibold mb-4">High Volume</h3>
        <div className="space-y-2">
          {data.highVolume.slice(0, 10).map((crypto, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{crypto.symbol} ({crypto.name})</p>
                  <p className="text-sm text-muted-foreground">${crypto.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    ${(crypto.volume / 1e6).toFixed(2)}M
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Groq AI Reading */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Market Reading (Groq AI)</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm leading-relaxed">{data.aiReading}</p>
        </div>
      </div>

      {/* Update Time */}
      <div className="text-xs text-muted-foreground text-center">
        Updated: {new Date(data.timestamp).toLocaleTimeString('it-IT')}
      </div>
    </div>
  );
}
