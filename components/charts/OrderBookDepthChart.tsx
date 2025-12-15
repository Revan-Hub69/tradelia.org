/**
 * Order Book Depth Chart
 * 
 * Visualizzazione depth dell'order book (bid/ask levels)
 * 
 * Riferimenti Accademici:
 * - Glosten & Milgrom (1985) - "Bid, Ask and Transaction Prices"
 * - Kyle (1985) - "Continuous Auctions and Insider Trading"
 * - Hasbrouck (2007) - "Empirical Market Microstructure"
 */

'use client';

import { useMemo } from 'react';
// Translations removed - using static labels for now
// import { useTranslations } from 'next-intl';

export interface OrderBookLevel {
  price: number;
  quantity: number;
  cumulative?: number;
}

export interface OrderBookDepthChartProps {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  currentPrice?: number;
  height?: number;
  showCumulative?: boolean;
  maxLevels?: number;
  className?: string;
}

/**
 * Order Book Depth Chart
 * 
 * Visualizza order book depth con:
 * - Bid levels (verde, sinistra)
 * - Ask levels (rosso, destra)
 * - Current price marker
 * - Cumulative volume
 */
export function OrderBookDepthChart({
  bids,
  asks,
  currentPrice,
  height = 500,
  showCumulative = true,
  maxLevels = 20,
  className = '',
}: OrderBookDepthChartProps) {
  // const { t } = useTranslations();

  // Processa e ordina levels
  const processedBids = useMemo(() => {
    const sorted = [...bids]
      .sort((a, b) => b.price - a.price)
      .slice(0, maxLevels);

    if (showCumulative) {
      let cumulative = 0;
      return sorted.map((level) => {
        cumulative += level.quantity;
        return { ...level, cumulative };
      });
    }

    return sorted;
  }, [bids, maxLevels, showCumulative]);

  const processedAsks = useMemo(() => {
    const sorted = [...asks]
      .sort((a, b) => a.price - b.price)
      .slice(0, maxLevels);

    if (showCumulative) {
      let cumulative = 0;
      return sorted.map((level) => {
        cumulative += level.quantity;
        return { ...level, cumulative };
      });
    }

    return sorted;
  }, [asks, maxLevels, showCumulative]);

  // Calcola bounds
  const { priceMin, priceMax, volumeMax } = useMemo(() => {
    const allPrices = [
      ...processedBids.map((l) => l.price),
      ...processedAsks.map((l) => l.price),
    ];
    const allVolumes = [
      ...processedBids.map((l) => showCumulative ? l.cumulative || 0 : l.quantity),
      ...processedAsks.map((l) => showCumulative ? l.cumulative || 0 : l.quantity),
    ];

    return {
      priceMin: Math.min(...allPrices),
      priceMax: Math.max(...allPrices),
      volumeMax: Math.max(...allVolumes, 1),
    };
  }, [processedBids, processedAsks, showCumulative]);

  // Normalizza coordinate
  const normalizePrice = (price: number): number => {
    const range = priceMax - priceMin;
    if (range === 0) return 50;
    return ((price - priceMin) / range) * 100;
  };

  const normalizeVolume = (volume: number): number => {
    return (volume / volumeMax) * 100;
  };

  const spread = useMemo(() => {
    if (processedAsks.length === 0 || processedBids.length === 0) return 0;
    const bestAsk = processedAsks[0].price;
    const bestBid = processedBids[0].price;
    return bestAsk - bestBid;
  }, [processedAsks, processedBids]);

  const spreadPercent = useMemo(() => {
    if (processedAsks.length === 0 || processedBids.length === 0) return 0;
    const bestAsk = processedAsks[0].price;
    const bestBid = processedBids[0].price;
    const midPrice = (bestAsk + bestBid) / 2;
    return (spread / midPrice) * 100;
  }, [spread, processedAsks, processedBids]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Order Book Depth
        </h3>
        <div className="flex items-center gap-4 text-sm">
          {currentPrice && (
            <span className="text-gray-600 dark:text-gray-400">
              Price: <span className="font-semibold text-gray-900 dark:text-white">
                ${currentPrice.toFixed(2)}
              </span>
            </span>
          )}
          <span className="text-gray-600 dark:text-gray-400">
            Spread: <span className="font-semibold text-gray-900 dark:text-white">
              ${spread.toFixed(2)} ({spreadPercent.toFixed(3)}%)
            </span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full">
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = (i / 4) * 100;
            return (
              <line
                key={`grid-${i}`}
                x1="0%"
                y1={`${y}%`}
                x2="100%"
                y2={`${y}%`}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeWidth={1}
              />
            );
          })}

          {/* Current price line */}
          {currentPrice && (
            <line
              x1="0%"
              y1={`${100 - normalizePrice(currentPrice)}%`}
              x2="100%"
              y2={`${100 - normalizePrice(currentPrice)}%`}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.7}
            />
          )}

          {/* Bid levels (left side, green) */}
          {processedBids.map((level, index) => {
            const x = 0;
            const y = 100 - normalizePrice(level.price);
            const width = normalizeVolume(
              showCumulative ? level.cumulative || 0 : level.quantity
            );
            const height = 100 / Math.max(processedBids.length, processedAsks.length);

            return (
              <g key={`bid-${index}`}>
                <rect
                  x={`${x}%`}
                  y={`${y - height / 2}%`}
                  width={`${width}%`}
                  height={`${height}%`}
                  fill="#10b981"
                  opacity={0.6}
                  className="hover:opacity-100 transition-opacity cursor-pointer"
                />
                <text
                  x={`${x + 2}%`}
                  y={`${y}%`}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  ${level.price.toFixed(2)}
                </text>
                <text
                  x={`${width + 1}%`}
                  y={`${y}%`}
                  fill="#10b981"
                  fontSize="10"
                  className="pointer-events-none"
                >
                  {level.quantity.toFixed(4)}
                </text>
              </g>
            );
          })}

          {/* Ask levels (right side, red) */}
          {processedAsks.map((level, index) => {
            const x = 100;
            const y = 100 - normalizePrice(level.price);
            const width = normalizeVolume(
              showCumulative ? level.cumulative || 0 : level.quantity
            );
            const height = 100 / Math.max(processedBids.length, processedAsks.length);

            return (
              <g key={`ask-${index}`}>
                <rect
                  x={`${x - width}%`}
                  y={`${y - height / 2}%`}
                  width={`${width}%`}
                  height={`${height}%`}
                  fill="#ef4444"
                  opacity={0.6}
                  className="hover:opacity-100 transition-opacity cursor-pointer"
                />
                <text
                  x={`${x - width - 2}%`}
                  y={`${y}%`}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="end"
                  className="pointer-events-none"
                >
                  ${level.price.toFixed(2)}
                </text>
                <text
                  x={`${x - width - 1}%`}
                  y={`${y}%`}
                  fill="#ef4444"
                  fontSize="10"
                  textAnchor="end"
                  className="pointer-events-none"
                >
                  {level.quantity.toFixed(4)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Y-axis labels (prices) */}
        <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>${priceMax.toFixed(2)}</span>
          <span>${((priceMax + priceMin) / 2).toFixed(2)}</span>
          <span>${priceMin.toFixed(2)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Bids</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Asks</span>
        </div>
        {currentPrice && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Current Price</span>
          </div>
        )}
      </div>
    </div>
  );
}

