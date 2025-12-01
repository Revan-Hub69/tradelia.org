'use client';

import { useMemo } from 'react';
import { PieChart, PieChartData } from './PieChart';
import { LineChart, LineChartData } from './LineChart';
import { BarChart, BarChartData } from './BarChart';

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  price: number;
  total_value: number;
  current_value?: number;
  change_percent?: number;
}

interface PortfolioChartsProps {
  positions: PortfolioPosition[];
  performanceData?: Array<{ date: string; value: number }>;
}

/**
 * Portfolio Charts Component
 * Grafici per portfolio: allocation e performance
 * Riferimento: Few (2006) - Information Dashboard Design
 */
export function PortfolioCharts({ positions, performanceData }: PortfolioChartsProps) {
  // Allocation Chart Data
  const allocationData: PieChartData[] = useMemo(() => {
    const total = positions.reduce((sum, p) => sum + (p.current_value || p.total_value), 0);
    return positions.map((p) => ({
      name: p.symbol,
      value: p.current_value || p.total_value,
      color: p.change_percent && p.change_percent >= 0 ? '#10b981' : '#ef4444',
    })).sort((a, b) => b.value - a.value);
  }, [positions]);

  // Performance Chart Data
  const performanceChartData: LineChartData[] = useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return [];
    }
    return performanceData.map((d) => ({
      name: d.date,
      value: d.value,
    }));
  }, [performanceData]);

  // Top Performers Chart
  const topPerformersData: BarChartData[] = useMemo(() => {
    return positions
      .filter((p) => p.change_percent !== undefined)
      .sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0))
      .slice(0, 5)
      .map((p) => ({
        name: p.symbol,
        performance: p.change_percent || 0,
      }));
  }, [positions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Allocation Chart */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Allocazione Portfolio
        </h3>
        {allocationData.length > 0 ? (
          <PieChart data={allocationData} height={300} showLabel />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-text-tertiary">
            Nessun dato disponibile
          </div>
        )}
      </div>

      {/* Performance Chart */}
      {performanceChartData.length > 0 && (
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Performance Portfolio
          </h3>
          <LineChart
            data={performanceChartData}
            lines={[{ key: 'value', label: 'Valore Portfolio', color: '#3b82f6' }]}
            height={300}
          />
        </div>
      )}

      {/* Top Performers */}
      {topPerformersData.length > 0 && (
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Top Performers
          </h3>
          <BarChart
            data={topPerformersData}
            bars={[
              {
                key: 'performance',
                label: 'Performance %',
                color: '#3b82f6',
              },
            ]}
            height={250}
          />
        </div>
      )}
    </div>
  );
}

