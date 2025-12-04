'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface WhaleData {
  transactions: Array<{
    symbol: string;
    amount: number;
    value: number;
    from: string;
    to: string;
    timestamp: string;
  }>;
  exchangeFlows: {
    deposits: number;
    withdrawals: number;
    netFlow: number;
  };
  whaleRatio: number;
  aiReading: string;
  timestamp: string;
}

interface CryptoWhaleAnalysisProps {
  isPro: boolean;
}

/**
 * Crypto Whale Analysis Component
 * 
 * Features:
 * - Real-time whale transactions (Whale Alert API)
 * - Exchange flows (Glassnode API)
 * - Whale ratio analysis
 * - Groq AI reading
 * 
 * Updates: Every 30 seconds (real-time)
 */
export default function CryptoWhaleAnalysis({ isPro }: CryptoWhaleAnalysisProps) {
  const t = useTranslations('Dashboard');
  const [data, setData] = useState<WhaleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPro) {
      setIsLoading(false);
      return;
    }

    const fetchWhaleData = async () => {
      try {
        const response = await fetch('/api/crypto/whale-analysis');
        if (!response.ok) throw new Error('Failed to fetch whale data');
        
        const whaleData = await response.json();
        setData(whaleData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading whale data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWhaleData();
    // Update every 30 seconds
    const interval = setInterval(fetchWhaleData, 30000);
    return () => clearInterval(interval);
  }, [isPro]);

  if (!isPro) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Upgrade to Pro to access Whale Analysis</p>
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Upgrade to Pro
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading whale analysis...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive">Error loading whale data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Whale Ratio</p>
          <p className="text-2xl font-bold">{data.whaleRatio.toFixed(2)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Net Exchange Flow</p>
          <p className={`text-2xl font-bold ${data.exchangeFlows.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.exchangeFlows.netFlow >= 0 ? '+' : ''}${(data.exchangeFlows.netFlow / 1e6).toFixed(2)}M
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Recent Transactions</p>
          <p className="text-2xl font-bold">{data.transactions.length}</p>
        </div>
      </div>

      {/* Recent Whale Transactions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Whale Transactions</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data.transactions.slice(0, 10).map((tx, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{tx.symbol}</p>
                  <p className="text-sm text-muted-foreground">
                    ${(tx.value / 1e6).toFixed(2)}M
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleTimeString('it-IT')}
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
          <p className="text-xs text-muted-foreground mt-2">
            Reference: Kyle (1985) - "Continuous Auctions and Insider Trading"
          </p>
        </div>
      </div>

      {/* Update Time */}
      <div className="text-xs text-muted-foreground text-center">
        Updated: {new Date(data.timestamp).toLocaleTimeString('it-IT')}
      </div>
    </div>
  );
}
