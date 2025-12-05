'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';

interface AggregatedDepthData {
  symbol: string;
  exchanges: Array<{
    name: string;
    bidTotal: number;
    askTotal: number;
    spread: number;
    imbalance: number;
  }>;
  aggregated: {
    totalBid: number;
    totalAsk: number;
    avgSpread: number;
    globalImbalance: number;
  };
  aiReading: string;
  timestamp: string;
}

interface CryptoDepthAggregatedProps {
  isPro: boolean;
}

/**
 * Crypto Aggregated Depth Analysis
 * 
 * Features:
 * - Multi-exchange order book L400 (Binance, Coinbase, Kraken, OKX)
 * - Aggregated depth analysis
 * - Cross-exchange comparison
 * - Groq AI reading
 * 
 * Updates: Every 1 minute (real-time)
 */
export default function CryptoDepthAggregated({ isPro }: CryptoDepthAggregatedProps) {
  const { t } = useTranslations();
  const [data, setData] = useState<AggregatedDepthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');

  useEffect(() => {
    if (!isPro) {
      setIsLoading(false);
      return;
    }

    const fetchAggregatedDepth = async () => {
      try {
        const response = await fetch('/api/crypto/aggregated-depth');
        if (!response.ok) throw new Error('Failed to fetch aggregated depth');
        
        const depthData = await response.json();
        setData(depthData.depths || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading aggregated depth');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAggregatedDepth();
    // Update every 1 minute
    const interval = setInterval(fetchAggregatedDepth, 60000);
    return () => clearInterval(interval);
  }, [isPro]);

  if (!isPro) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Upgrade to Pro to access Aggregated Depth Analysis</p>
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Upgrade to Pro
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading aggregated depth...</div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive">Error loading aggregated depth data</div>
      </div>
    );
  }

  const selectedData = data.find(d => d.symbol === selectedSymbol) || data[0];

  return (
    <div className="space-y-6">
      {/* Symbol Selector */}
      <div>
        <label className="text-sm font-medium mb-2 block">Select Crypto</label>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="w-full p-2 border rounded-lg bg-background"
        >
          {data.map((d) => (
            <option key={d.symbol} value={d.symbol}>
              {d.symbol}
            </option>
          ))}
        </select>
      </div>

      {/* Aggregated Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Bid (L400)</p>
          <p className="text-xl font-bold">${(selectedData.aggregated.totalBid / 1e6).toFixed(2)}M</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Ask (L400)</p>
          <p className="text-xl font-bold">${(selectedData.aggregated.totalAsk / 1e6).toFixed(2)}M</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Avg Spread</p>
          <p className="text-xl font-bold">{selectedData.aggregated.avgSpread.toFixed(4)}%</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Global Imbalance</p>
          <p className={`text-xl font-bold ${selectedData.aggregated.globalImbalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {selectedData.aggregated.globalImbalance >= 0 ? '+' : ''}{selectedData.aggregated.globalImbalance.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Exchange Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Exchange Comparison</h3>
        <div className="space-y-2">
          {selectedData.exchanges.map((exchange, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{exchange.name}</p>
                <p className="text-sm text-muted-foreground">Spread: {exchange.spread.toFixed(4)}%</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Bid</p>
                  <p className="font-semibold">${(exchange.bidTotal / 1e6).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ask</p>
                  <p className="font-semibold">${(exchange.askTotal / 1e6).toFixed(2)}M</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  Imbalance: {exchange.imbalance >= 0 ? '+' : ''}{exchange.imbalance.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Groq AI Reading */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Market Reading (Groq AI)</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm leading-relaxed">{selectedData.aiReading}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Reference: Garbade & Silber (1979) - "Price Dispersion in Securities Markets"
          </p>
        </div>
      </div>

      {/* Update Time */}
      <div className="text-xs text-muted-foreground text-center">
        Updated: {new Date(selectedData.timestamp).toLocaleTimeString('it-IT')}
      </div>
    </div>
  );
}
