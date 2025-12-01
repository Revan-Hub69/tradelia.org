'use client';

import { useMemo } from 'react';
import { LineChart, LineChartData } from './LineChart';
import { BarChart, BarChartData } from './BarChart';
import { PieChart, PieChartData } from './PieChart';

export interface Trade {
  id: string;
  symbol: string;
  entry_date: string;
  exit_date?: string;
  entry_price: number;
  exit_price?: number;
  quantity: number;
  profit_loss?: number;
  profit_loss_percent?: number;
  trade_type: 'buy' | 'sell' | 'long' | 'short';
  strategy?: string;
  is_closed: boolean;
}

interface TradingJournalChartsProps {
  trades: Trade[];
}

/**
 * Trading Journal Charts Component
 * Grafici per trading journal: equity curve, P&L distribution, win rate
 * Riferimento: Trading Analytics Best Practices, Performance Metrics
 */
export function TradingJournalCharts({ trades }: TradingJournalChartsProps) {
  // Equity Curve
  const equityCurveData: LineChartData[] = useMemo(() => {
    const closedTrades = trades.filter((t) => t.is_closed && t.profit_loss !== null);
    let runningTotal = 0;

    return closedTrades
      .sort((a, b) => new Date(a.exit_date || a.entry_date).getTime() - new Date(b.exit_date || b.entry_date).getTime())
      .map((trade) => {
        runningTotal += trade.profit_loss || 0;
        return {
          name: new Date(trade.exit_date || trade.entry_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
          equity: runningTotal,
        };
      });
  }, [trades]);

  // P&L Distribution
  const pnlDistributionData: BarChartData[] = useMemo(() => {
    const closedTrades = trades.filter((t) => t.is_closed && t.profit_loss !== null);
    const ranges = [
      { min: -Infinity, max: -100, label: '< -100' },
      { min: -100, max: -50, label: '-100 to -50' },
      { min: -50, max: 0, label: '-50 to 0' },
      { min: 0, max: 50, label: '0 to 50' },
      { min: 50, max: 100, label: '50 to 100' },
      { min: 100, max: Infinity, label: '> 100' },
    ];

    return ranges.map((range) => ({
      name: range.label,
      count: closedTrades.filter((t) => {
        const pnl = t.profit_loss || 0;
        return pnl >= range.min && pnl < range.max;
      }).length,
    }));
  }, [trades]);

  // Win Rate by Strategy
  const winRateByStrategyData: PieChartData[] = useMemo(() => {
    const strategyStats = trades
      .filter((t) => t.is_closed && t.strategy && t.profit_loss !== null)
      .reduce((acc, trade) => {
        const strategy = trade.strategy || 'Unknown';
        if (!acc[strategy]) {
          acc[strategy] = { wins: 0, total: 0 };
        }
        acc[strategy].total++;
        if ((trade.profit_loss || 0) > 0) {
          acc[strategy].wins++;
        }
        return acc;
      }, {} as Record<string, { wins: number; total: number }>);

    return Object.entries(strategyStats).map(([strategy, stats]) => ({
      name: strategy,
      value: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
    }));
  }, [trades]);

  // Monthly P&L
  const monthlyPnLData: BarChartData[] = useMemo(() => {
    const closedTrades = trades.filter((t) => t.is_closed && t.profit_loss !== null);
    const monthly = closedTrades.reduce((acc, trade) => {
      const date = new Date(trade.exit_date || trade.entry_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += trade.profit_loss || 0;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, pnl]) => ({
        name: new Date(month + '-01').toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        pnl: Math.round(pnl * 100) / 100,
      }));
  }, [trades]);

  const totalTrades = trades.filter((t) => t.is_closed).length;
  const winningTrades = trades.filter((t) => t.is_closed && (t.profit_loss || 0) > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = trades
    .filter((t) => t.is_closed && t.profit_loss !== null)
    .reduce((sum, t) => sum + (t.profit_loss || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
          <p className="text-xs text-text-tertiary mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-text-primary">{totalTrades}</p>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
          <p className="text-xs text-text-tertiary mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-text-primary">{winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
          <p className="text-xs text-text-tertiary mb-1">Total P&L</p>
          <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}€{totalPnL.toFixed(2)}
          </p>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
          <p className="text-xs text-text-tertiary mb-1">Avg P&L</p>
          <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalTrades > 0 ? (totalPnL / totalTrades).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        {equityCurveData.length > 0 && (
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Equity Curve
            </h3>
            <LineChart
              data={equityCurveData}
              lines={[{ key: 'equity', label: 'Equity', color: '#3b82f6' }]}
              height={300}
            />
          </div>
        )}

        {/* P&L Distribution */}
        {pnlDistributionData.length > 0 && (
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Distribuzione P&L
            </h3>
            <BarChart
              data={pnlDistributionData}
              bars={[{ key: 'count', label: 'Numero Trade', color: '#3b82f6' }]}
              height={300}
            />
          </div>
        )}

        {/* Monthly P&L */}
        {monthlyPnLData.length > 0 && (
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              P&L Mensile
            </h3>
            <BarChart
              data={monthlyPnLData}
              bars={[
                {
                  key: 'pnl',
                  label: 'P&L',
                  color: '#3b82f6',
                },
              ]}
              height={300}
            />
          </div>
        )}

        {/* Win Rate by Strategy */}
        {winRateByStrategyData.length > 0 && (
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Win Rate per Strategia
            </h3>
            <PieChart data={winRateByStrategyData} height={300} />
          </div>
        )}
      </div>
    </div>
  );
}

