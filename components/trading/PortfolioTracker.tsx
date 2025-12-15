/**
 * Portfolio Tracker Component
 * 
 * Visualizza e gestisce posizioni aperte, P&L, e portfolio
 */

'use client';

import { useState, useEffect } from 'react';
import { getPortfolioTracker, type Position, type PortfolioStats } from '@/lib/trading/portfolio-tracker';
import { TrendingUp, TrendingDown, X, Plus } from 'lucide-react';

interface PortfolioTrackerProps {
  accountBalance: number;
  onOpenPosition?: () => void;
}

export function PortfolioTracker({ accountBalance, onOpenPosition }: PortfolioTrackerProps) {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(false);

  const tracker = getPortfolioTracker();

  const updateStats = () => {
    setStats(tracker.getStats(accountBalance));
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [accountBalance]);

  const closePosition = (positionId: string) => {
    const position = tracker.getPosition(positionId);
    if (position && position.currentPrice) {
      tracker.closePosition(positionId, position.currentPrice);
      updateStats();
    }
  };

  const updatePrices = async () => {
    setLoading(true);
    try {
      const positions = tracker.getOpenPositions();
      if (positions.length === 0) {
        setLoading(false);
        return;
      }

      const symbols = positions.map(p => p.symbol);
      
      // Fetch current prices with error handling per symbol
      const prices: Record<string, number> = {};
      const pricePromises = symbols.map(async (symbol) => {
        try {
          const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
            { next: { revalidate: 5 } } // Cache 5 seconds
          );
          if (response.ok) {
            const data = await response.json();
            return { symbol, price: parseFloat(data.price) };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(pricePromises);
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          prices[result.value.symbol] = result.value.price;
        }
      });

      tracker.updatePrices(prices);
      updateStats();
    } catch (error) {
      console.error('Error updating prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updatePrices();
    const interval = setInterval(updatePrices, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Portfolio Tracker
        </h3>
        <button
          onClick={onOpenPosition}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Open Position</span>
        </button>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total P&L</div>
            <div className={`text-xl font-bold ${
              stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${stats.totalPnL.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {stats.totalPnLPercent >= 0 ? '+' : ''}{stats.totalPnLPercent.toFixed(2)}%
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Open Positions</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {stats.openPositions}
            </div>
            <div className="text-xs text-gray-500">
              {stats.totalPositions} total
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Risk</div>
            <div className={`text-xl font-bold ${
              stats.totalRiskPercent > 10 ? 'text-red-600' :
              stats.totalRiskPercent > 5 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {stats.totalRiskPercent.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              ${stats.totalRisk.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Win Rate</div>
            <div className={`text-xl font-bold ${
              stats.winRate >= 80 ? 'text-green-600' :
              stats.winRate >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {stats.totalPositions > 0 ? `${Math.round((stats.winRate / 100) * stats.totalPositions)}/${stats.totalPositions}` : '0/0'}
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="p-4">
        {stats.positions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Nessuna posizione aperta</p>
            <button
              onClick={onOpenPosition}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
            >
              Apri una posizione
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.positions.map((position) => (
              <div
                key={position.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {position.symbol}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        position.side === 'long'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {position.side.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {position.leverage}x
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Entry: ${position.entryPrice.toFixed(2)} | 
                      Current: ${position.currentPrice?.toFixed(2) || 'N/A'} | 
                      Qty: {position.quantity.toFixed(4)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      (position.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${(position.pnl || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(position.pnlPercent || 0) >= 0 ? '+' : ''}{(position.pnlPercent || 0).toFixed(2)}%
                    </div>
                    <button
                      onClick={() => closePosition(position.id)}
                      className="mt-2 p-1 text-red-600 hover:text-red-700 rounded"
                      title="Close position"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stop Loss / Take Profit */}
                {(position.stopLoss || position.takeProfit) && (
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    {position.stopLoss && (
                      <div>
                        <span className="text-gray-500">Stop Loss:</span>
                        <span className="ml-1 font-semibold text-red-600">
                          ${position.stopLoss.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {position.takeProfit && (
                      <div>
                        <span className="text-gray-500">Take Profit:</span>
                        <span className="ml-1 font-semibold text-green-600">
                          ${position.takeProfit.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Risk */}
                <div className="mt-2 text-xs text-gray-500">
                  Risk: ${position.riskAmount.toFixed(2)} ({position.riskPercent.toFixed(2)}%)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

