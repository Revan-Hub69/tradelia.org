/**
 * Imbalance Chart Component
 * 
 * Visualizza imbalance per fasce di prezzo
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ImbalanceData {
  range: string;
  imbalance: number;
  imbalancePercent: number;
  bidVolume: number;
  askVolume: number;
}

interface ImbalanceChartProps {
  imbalances: ImbalanceData[];
}

export function ImbalanceChart({ imbalances }: ImbalanceChartProps) {
  const data = imbalances.map((imb) => ({
    range: imb.range,
    imbalance: imb.imbalancePercent,
    bidVolume: imb.bidVolume,
    askVolume: imb.askVolume,
  }));

  return (
    <div className="w-full">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Bid/Ask Imbalance per Fascia
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="range" 
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Imbalance %', angle: -90, position: 'insideLeft' }}
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Imbalance']}
          />
          <Bar dataKey="imbalance" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.imbalance > 0 ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Verde = più domanda (bid), Rosso = più offerta (ask)
      </div>
    </div>
  );
}

