/**
 * Performance Dashboard Component
 * 
 * Visualizza performance dei segnali in tempo reale
 * Win rate, profit factor, drawdown, etc.
 */

'use client';

import { useState, useEffect } from 'react';
import { getPerformanceTracker, type PerformanceStats } from '@/lib/trading/performance-tracker';
import { LineChart, LineChartData } from '@/components/charts/LineChart';
import { BarChart, BarChartData } from '@/components/charts/BarChart';

interface PerformanceDashboardProps {
  timeframe?: '24h' | '7d' | '30d' | 'all';
}

export function PerformanceDashboard({ timeframe = 'all' }: PerformanceDashboardProps) {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tracker = getPerformanceTracker();
    const updateStats = () => {
      setStats(tracker.getStats(timeframe));
      setLoading(false);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [timeframe]);

  if (loading || !stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  // Equity curve data
  const equityData: LineChartData[] = stats.equityCurve?.map((point, index) => ({
    name: new Date(point.time).toLocaleDateString(),
    value: point.equity,
  })) || [];

  // Win rate by signal type
  const winRateData: BarChartData[] = [
    {
      name: 'STRONG_BUY',
      value: stats.bySignalType.STRONG_BUY.winRate,
    },
    {
      name: 'BUY',
      value: stats.bySignalType.BUY.winRate,
    },
    {
      name: 'SELL',
      value: stats.bySignalType.SELL.winRate,
    },
    {
      name: 'STRONG_SELL',
      value: stats.bySignalType.STRONG_SELL.winRate,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
          <div className={`text-2xl font-bold ${
            stats.winRate >= 80 ? 'text-green-600' :
            stats.winRate >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.winningSignals}/{stats.closedSignals} trades
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Profit Factor</div>
          <div className={`text-2xl font-bold ${
            stats.profitFactor >= 2 ? 'text-green-600' :
            stats.profitFactor >= 1.5 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {stats.profitFactor.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Avg Win: ${stats.avgWin.toFixed(2)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total P&L</div>
          <div className={`text-2xl font-bold ${
            stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ${stats.totalPnL.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.totalPnLPercent.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</div>
          <div className={`text-2xl font-bold ${
            stats.maxDrawdownPercent < 10 ? 'text-green-600' :
            stats.maxDrawdownPercent < 20 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {stats.maxDrawdownPercent.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ${stats.maxDrawdown.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        {equityData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Equity Curve
            </h3>
            <LineChart
              data={equityData}
              lines={[{ key: 'value', label: 'Equity', color: '#3b82f6' }]}
              height={300}
            />
          </div>
        )}

        {/* Win Rate by Signal Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Win Rate by Signal Type
          </h3>
          <BarChart
            data={winRateData}
            bars={[{ key: 'value', label: 'Win Rate %', color: '#10b981' }]}
            height={300}
          />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Detailed Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Total Signals</div>
            <div className="font-semibold text-gray-900 dark:text-white">{stats.totalSignals}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Open Positions</div>
            <div className="font-semibold text-gray-900 dark:text-white">{stats.openSignals}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Avg Confidence</div>
            <div className="font-semibold text-gray-900 dark:text-white">{stats.avgConfidence.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Avg Duration</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {Math.floor(stats.avgDuration / 60)}m
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Largest Win</div>
            <div className="font-semibold text-green-600">${stats.largestWin.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Largest Loss</div>
            <div className="font-semibold text-red-600">${stats.largestLoss.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Sharpe Ratio</div>
            <div className="font-semibold text-gray-900 dark:text-white">{stats.sharpeRatio.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Avg Loss</div>
            <div className="font-semibold text-red-600">${stats.avgLoss.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

