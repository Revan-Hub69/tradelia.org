'use client';

import { useEffect, useState } from 'react';

interface CryptoMarketCap {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  marketCapRank: number;
  priceChangePercent24h: number;
  marketCapChangePercent24h: number;
}

interface MarketCapHeatmapProps {
  limit?: number;
}

export function MarketCapHeatmap({ limit = 50 }: MarketCapHeatmapProps) {
  const [data, setData] = useState<CryptoMarketCap[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rank' | 'change' | 'marketCap'>('rank');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/crypto/market-cap?limit=${limit}`);
        const result = await response.json();
        setData(result.cryptos || []);
      } catch (error) {
        console.error('Error fetching market cap data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh ogni minuto
    return () => clearInterval(interval);
  }, [limit]);

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'rank') return a.marketCapRank - b.marketCapRank;
    if (sortBy === 'change') return b.priceChangePercent24h - a.priceChangePercent24h;
    return b.marketCap - a.marketCap;
  });

  const filteredData = sortedData.filter((crypto) => {
    if (filter === 'gainers') return crypto.priceChangePercent24h > 0;
    if (filter === 'losers') return crypto.priceChangePercent24h < 0;
    return true;
  });

  const getColor = (change: number) => {
    if (change > 5) return 'bg-green-600';
    if (change > 2) return 'bg-green-500';
    if (change > 0) return 'bg-green-400';
    if (change > -2) return 'bg-red-400';
    if (change > -5) return 'bg-red-500';
    return 'bg-red-600';
  };

  const formatMarketCap = (mc: number) => {
    if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`;
    if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`;
    if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}M`;
    return `$${mc.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">Caricamento heatmap...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Market Cap Heatmap
        </h2>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="rank">Rank</option>
            <option value="change">Variazione</option>
            <option value="marketCap">Market Cap</option>
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tutte</option>
            <option value="gainers">Gainers</option>
            <option value="losers">Losers</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {filteredData.map((crypto) => (
          <div
            key={crypto.symbol}
            className={`${getColor(crypto.priceChangePercent24h)} rounded p-3 text-white cursor-pointer hover:opacity-80 transition-opacity`}
            title={`${crypto.name} (${crypto.symbol})\nMarket Cap: ${formatMarketCap(crypto.marketCap)}\nVariazione: ${crypto.priceChangePercent24h.toFixed(2)}%`}
          >
            <div className="text-xs font-semibold mb-1">{crypto.symbol}</div>
            <div className="text-xs opacity-90">
              {crypto.priceChangePercent24h >= 0 ? '+' : ''}
              {crypto.priceChangePercent24h.toFixed(2)}%
            </div>
            <div className="text-xs opacity-75 mt-1">
              #{crypto.marketCapRank}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Colori: Verde = positivo, Rosso = negativo. Intensità basata su variazione % 24h
      </div>
    </div>
  );
}

