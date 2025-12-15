/**
 * Futures History Chart
 * 
 * Visualizza storico funding rate e OI
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface FundingHistoryPoint {
  timestamp: number;
  fundingRatePercent: number;
}

interface OIHistoryPoint {
  timestamp: number;
  openInterest: number;
}

interface FuturesHistoryChartProps {
  fundingHistory: FundingHistoryPoint[];
  oiHistory: OIHistoryPoint[];
}

export function FuturesHistoryChart({
  fundingHistory,
  oiHistory,
}: FuturesHistoryChartProps) {
  // Combina dati per grafico
  const combinedData = fundingHistory.map((funding, i) => {
    const oi = oiHistory[i];
    return {
      time: format(new Date(funding.timestamp), 'HH:mm'),
      timestamp: funding.timestamp,
      funding: funding.fundingRatePercent,
      oi: oi ? oi.openInterest / 1000000 : null, // Converti a milioni
    };
  });

  return (
    <div className="w-full">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Storico Futures (ultime 24h)
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            label={{ value: 'Funding %', angle: -90, position: 'insideLeft' }}
            stroke="#3b82f6"
            tick={{ fill: '#3b82f6', fontSize: 12 }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            label={{ value: 'OI (M$)', angle: 90, position: 'insideRight' }}
            stroke="#10b981"
            tick={{ fill: '#10b981', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'funding') return [`${value.toFixed(4)}%`, 'Funding Rate'];
              if (name === 'oi') return [`$${value.toFixed(2)}M`, 'Open Interest'];
              return [value, name];
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="funding"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Funding Rate"
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="oi"
            stroke="#10b981"
            strokeWidth={2}
            name="Open Interest"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

