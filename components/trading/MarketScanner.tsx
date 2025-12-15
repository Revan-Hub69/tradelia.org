/**
 * Market Scanner Component
 * 
 * Scanner automatico per trovare le migliori opportunità di trading
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';

interface ScannerResult {
  symbol: string;
  name: string;
  price: number;
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  winRate: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  recommendedLeverage: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  reasons: string[];
  score: number;
  metrics: {
    fundingRate: number;
    orderFlowImbalance: number;
    marketPressure: number;
    liquidationRisk: string;
  };
}

export function MarketScanner({ onSelectCrypto }: { onSelectCrypto?: (symbol: string) => void }) {
  const [results, setResults] = useState<ScannerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minConfidence: 70,
    minWinRate: 75,
    maxRisk: 'high' as 'low' | 'medium' | 'high',
    limit: 20,
  });

  const scanMarket = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        minConfidence: filters.minConfidence.toString(),
        minWinRate: filters.minWinRate.toString(),
        maxRisk: filters.maxRisk,
        limit: filters.limit.toString(),
      });

      const response = await fetch(`/api/crypto/market-scanner?${params}`);
      if (!response.ok) {
        throw new Error('Errore nello scanner');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanMarket();
  }, []); // Initial scan

  const getSignalColor = (signal: string) => {
    if (signal.includes('BUY')) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (signal.includes('SELL')) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'low') return 'text-green-600';
    if (risk === 'medium') return 'text-yellow-600';
    if (risk === 'high') return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Market Scanner
          </h3>
          <button
            onClick={scanMarket}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scansione...' : 'Scansiona'}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Min Confidence: {filters.minConfidence}%
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={filters.minConfidence}
              onChange={(e) => setFilters({ ...filters, minConfidence: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Min Win Rate: {filters.minWinRate}%
            </label>
            <input
              type="range"
              min="60"
              max="90"
              step="5"
              value={filters.minWinRate}
              onChange={(e) => setFilters({ ...filters, minWinRate: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Max Risk
            </label>
            <select
              value={filters.maxRisk}
              onChange={(e) => setFilters({ ...filters, maxRisk: e.target.value as any })}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Limit: {filters.limit}
            </label>
            <input
              type="range"
              min="10"
              max="50"
              step="10"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {loading && results.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Scansione mercato in corso...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Nessuna opportunità trovata con i filtri attuali
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((result, i) => (
              <div
                key={i}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                  onSelectCrypto ? '' : ''
                }`}
                onClick={() => onSelectCrypto?.(result.symbol)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {result.symbol}
                      </span>
                      <span className="text-xs text-gray-500">{result.name}</span>
                      <span className={`px-2 py-1 text-xs rounded ${getSignalColor(result.signal)}`}>
                        {result.signal.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-blue-600">
                        Score: {result.score.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      ${result.price.toFixed(2)} | Confidence: {result.confidence}% | Win Rate: {result.winRate}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Leverage: {result.recommendedLeverage}x
                    </div>
                  </div>
                </div>

                {/* Entry/Exit */}
                {result.entryPrice && (
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-gray-500">Entry:</span>
                      <span className="ml-1 font-semibold">${result.entryPrice.toFixed(2)}</span>
                    </div>
                    {result.stopLoss && (
                      <div>
                        <span className="text-gray-500">Stop:</span>
                        <span className="ml-1 font-semibold text-red-600">${result.stopLoss.toFixed(2)}</span>
                      </div>
                    )}
                    {result.takeProfit && (
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <span className="ml-1 font-semibold text-green-600">${result.takeProfit.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-2 mt-2 text-xs text-gray-500">
                  <div>Funding: {(result.metrics.fundingRate * 100).toFixed(3)}%</div>
                  <div>Flow: {(result.metrics.orderFlowImbalance * 100).toFixed(1)}%</div>
                  <div>Pressure: {(result.metrics.marketPressure * 100).toFixed(1)}%</div>
                  <div>Risk: {result.metrics.liquidationRisk}</div>
                </div>

                {/* Reasons */}
                {result.reasons.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {result.reasons.slice(0, 2).join(' • ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 text-center">
          {results.length} opportunità trovate
        </div>
      )}
    </div>
  );
}

