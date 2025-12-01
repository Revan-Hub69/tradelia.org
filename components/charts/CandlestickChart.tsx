'use client';

import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface CandlestickChartProps {
  data: CandlestickData[];
  height?: number;
  showVolume?: boolean;
  className?: string;
}

/**
 * Candlestick Chart Component
 * Grafico candlestick per dati finanziari (OHLC)
 * Riferimento: Trading Chart Best Practices, Financial Data Visualization
 */
export function CandlestickChart({
  data,
  height = 400,
  showVolume = false,
  className,
}: CandlestickChartProps) {
  // Transform data for candlestick visualization
  const chartData = data.map((d) => {
    const isUp = d.close >= d.open;
    return {
      date: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      isUp,
      volume: d.volume || 0,
    };
  });

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          />
          <YAxis
            yAxisId="price"
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          />
          {showVolume && (
            <YAxis
              yAxisId="volume"
              orientation="right"
              stroke="rgba(255, 255, 255, 0.5)"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 18, 26, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number, name: string, props: any) => {
              if (name === 'body' || name === 'upperShadow' || name === 'lowerShadow') return null;
              if (name === 'open' || name === 'high' || name === 'low' || name === 'close') {
                return [`€${value.toFixed(2)}`, name.toUpperCase()];
              }
              return [value, name];
            }}
          />
          <Legend
            wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
          />
          {/* Simplified candlestick: High-Low line and Close price */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="high"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={1}
            dot={false}
            connectNulls
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="low"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={1}
            dot={false}
            connectNulls
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke={(entry: any) => (entry.isUp ? '#10b981' : '#ef4444')}
            strokeWidth={2}
            dot={{ r: 4, fill: (entry: any) => (entry.isUp ? '#10b981' : '#ef4444') }}
            connectNulls
          />
          {showVolume && (
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill="rgba(59, 130, 246, 0.3)"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

