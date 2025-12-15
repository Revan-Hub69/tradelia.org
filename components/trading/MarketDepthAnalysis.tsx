/**
 * Market Depth Analysis Component
 * 
 * Visualizza analisi completa del mercato:
 * - Volume multi-exchange
 * - Whale movements
 * - Exchange flows
 */

'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Waves, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface MarketDepthAnalysisProps {
  symbol: string;
}

export function MarketDepthAnalysis({ symbol }: MarketDepthAnalysisProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/crypto/market-depth?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error('Errore nel fetch dati');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  if (loading && !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Market Depth Analysis
        </h3>
        <p className="text-xs text-gray-500 mt-1">{symbol}</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Volume Multi-Exchange */}
        {data.volume && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Volume Multi-Exchange
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Volume 24h</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${(data.volume.totalVolume24h / 1e9).toFixed(2)}B
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Spot Volume</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${(data.volume.totalSpotVolume24h / 1e9).toFixed(2)}B
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Futures Volume</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${(data.volume.totalFuturesVolume24h / 1e9).toFixed(2)}B
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Spot/Futures Ratio</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {data.volume.spotVsFuturesRatio.toFixed(2)}
                </div>
              </div>
            </div>
            {data.volume.exchanges.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">Per Exchange:</div>
                {data.volume.exchanges.map((ex: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{ex.exchange}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(ex.totalVolume24h / 1e6).toFixed(1)}M
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Whale Movements */}
        {data.whales && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Whale Movements
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Whale Volume</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${(data.whales.totalAmountUsd / 1e6).toFixed(2)}M
                </div>
                <div className="text-xs text-gray-500">
                  {data.whales.transactions.length} transactions
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Direction</div>
                <div className={`text-lg font-bold flex items-center gap-1 ${
                  data.whales.direction === 'accumulation' ? 'text-green-600' :
                  data.whales.direction === 'distribution' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {data.whales.direction === 'accumulation' ? <TrendingUp className="w-4 h-4" /> :
                   data.whales.direction === 'distribution' ? <TrendingDown className="w-4 h-4" /> : null}
                  {data.whales.direction.toUpperCase()}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Top Whale</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${(data.whales.topWhale.amountUsd / 1e6).toFixed(2)}M
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exchange Flows */}
        {data.exchangeFlows && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4" />
              Exchange Flows
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Inflow 24h</div>
                <div className="text-lg font-bold text-red-600">
                  ${(data.exchangeFlows.totalInflowUsd24h / 1e6).toFixed(2)}M
                </div>
                <div className="text-xs text-gray-500">
                  {data.exchangeFlows.totalInflow24h.toFixed(2)} {symbol}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Outflow 24h</div>
                <div className="text-lg font-bold text-green-600">
                  ${(data.exchangeFlows.totalOutflowUsd24h / 1e6).toFixed(2)}M
                </div>
                <div className="text-xs text-gray-500">
                  {data.exchangeFlows.totalOutflow24h.toFixed(2)} {symbol}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Net Flow 24h</div>
                <div className={`text-lg font-bold ${
                  data.exchangeFlows.totalNetFlowUsd24h > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${(data.exchangeFlows.totalNetFlowUsd24h / 1e6).toFixed(2)}M
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">Trend</div>
                <div className={`text-lg font-bold flex items-center gap-1 ${
                  data.exchangeFlows.overallTrend === 'accumulation' ? 'text-green-600' :
                  data.exchangeFlows.overallTrend === 'distribution' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {data.exchangeFlows.overallTrend === 'accumulation' ? <ArrowDownCircle className="w-4 h-4" /> :
                   data.exchangeFlows.overallTrend === 'distribution' ? <ArrowUpCircle className="w-4 h-4" /> : null}
                  {data.exchangeFlows.overallTrend.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              {data.exchangeFlows.overallTrend === 'accumulation' 
                ? '💰 Accumulo: Più prelievi che depositi = potenziale rialzo'
                : data.exchangeFlows.overallTrend === 'distribution'
                ? '📉 Distribuzione: Più depositi che prelievi = potenziale ribasso'
                : '⚖️ Neutrale: Flussi bilanciati'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

