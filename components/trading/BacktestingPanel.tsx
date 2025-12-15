/**
 * Backtesting Panel Component
 * 
 * Interfaccia per eseguire backtesting di strategie
 */

'use client';

import { useState } from 'react';
import { Play, BarChart3, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { BacktestResult } from '@/lib/backtesting/backtest-engine';

export function BacktestingPanel() {
  const [symbol, setSymbol] = useState('BTC');
  const [strategy, setStrategy] = useState('high-precision-signal');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // 30 days ago
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [initialCapital, setInitialCapital] = useState(10000);
  const [leverage, setLeverage] = useState(10);
  const [stopLossPercent, setStopLossPercent] = useState(0.02);
  const [takeProfitPercent, setTakeProfitPercent] = useState(0.04);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBacktest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/crypto/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          strategy,
          startDate,
          endDate,
          initialCapital,
          leverage,
          stopLossPercent,
          takeProfitPercent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore nel backtesting');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Backtesting
        </h3>
      </div>

      {/* Configuration */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="BTC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Strategy
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="moving-average-crossover">Moving Average Crossover</option>
              <option value="rsi-mean-reversion">RSI Mean Reversion</option>
              <option value="macd-trend">MACD Trend</option>
              <option value="high-precision-signal">High-Precision Signal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Initial Capital: ${initialCapital.toLocaleString()}
            </label>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={initialCapital}
              onChange={(e) => setInitialCapital(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Leverage: {leverage}x
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stop Loss: {(stopLossPercent * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0.01"
              max="0.1"
              step="0.01"
              value={stopLossPercent}
              onChange={(e) => setStopLossPercent(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Take Profit: {(takeProfitPercent * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={takeProfitPercent}
              onChange={(e) => setTakeProfitPercent(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <button
          onClick={runBacktest}
          disabled={loading}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Play className="w-5 h-5" />
          {loading ? 'Backtesting in corso...' : 'Esegui Backtest'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="p-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Risultati Backtest
          </h4>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">Total P&L</div>
              <div className={`text-xl font-bold ${
                result.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${result.totalPnL.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                {(result.totalPnLPercent * 100).toFixed(2)}%
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">Win Rate</div>
              <div className={`text-xl font-bold ${
                result.winRate >= 80 ? 'text-green-600' :
                result.winRate >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {result.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                {result.winningTrades}/{result.totalTrades}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">Profit Factor</div>
              <div className={`text-xl font-bold ${
                result.profitFactor >= 2 ? 'text-green-600' :
                result.profitFactor >= 1.5 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {result.profitFactor.toFixed(2)}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">Sharpe Ratio</div>
              <div className={`text-xl font-bold ${
                result.sharpeRatio >= 2 ? 'text-green-600' :
                result.sharpeRatio >= 1 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {result.sharpeRatio.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Total Trades</div>
              <div className="font-semibold text-gray-900 dark:text-white">{result.totalTrades}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Max Drawdown</div>
              <div className="font-semibold text-red-600">
                {(result.maxDrawdown * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Avg Win</div>
              <div className="font-semibold text-green-600">${result.avgWin.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Avg Loss</div>
              <div className="font-semibold text-red-600">${result.avgLoss.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Largest Win</div>
              <div className="font-semibold text-green-600">${result.largestWin.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Largest Loss</div>
              <div className="font-semibold text-red-600">${result.largestLoss.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

