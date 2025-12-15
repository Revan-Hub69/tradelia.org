/**
 * Volume Profile Chart
 * 
 * Visualizzazione volume per livello di prezzo (Price-Volume Histogram)
 * 
 * Riferimenti Accademici:
 * - Steidlmayer (1989) - "Markets and Market Logic"
 * - Dalton (2007) - "Markets in Profile"
 * - TPO (Time Price Opportunity) Analysis
 */

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

export interface VolumeProfileLevel {
  price: number;
  volume: number;
  buyVolume?: number;
  sellVolume?: number;
}

export interface VolumeProfileChartProps {
  data: VolumeProfileLevel[];
  currentPrice?: number;
  height?: number;
  showBuySell?: boolean;
  priceBins?: number;
  className?: string;
}

/**
 * Volume Profile Chart
 * 
 * Visualizza:
 * - Volume per livello di prezzo
 * - POC (Point of Control) - livello con più volume
 * - Value Area (70% del volume)
 * - Buy/Sell volume split (opzionale)
 */
export function VolumeProfileChart({
  data,
  currentPrice,
  height = 500,
  showBuySell = false,
  priceBins = 50,
  className = '',
}: VolumeProfileChartProps) {
  const { t } = useTranslations();

  // Processa dati: raggruppa per bin di prezzo
  const processedData = useMemo(() => {
    if (data.length === 0) return [];

    const prices = data.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const binSize = (maxPrice - minPrice) / priceBins;

    const bins: Map<number, VolumeProfileLevel> = new Map();

    data.forEach((level) => {
      const binIndex = Math.floor((level.price - minPrice) / binSize);
      const binPrice = minPrice + binIndex * binSize + binSize / 2;

      const existing = bins.get(binPrice);
      if (existing) {
        existing.volume += level.volume;
        if (showBuySell) {
          existing.buyVolume = (existing.buyVolume || 0) + (level.buyVolume || 0);
          existing.sellVolume = (existing.sellVolume || 0) + (level.sellVolume || 0);
        }
      } else {
        bins.set(binPrice, {
          price: binPrice,
          volume: level.volume,
          buyVolume: level.buyVolume || 0,
          sellVolume: level.sellVolume || 0,
        });
      }
    });

    return Array.from(bins.values()).sort((a, b) => a.price - b.price);
  }, [data, priceBins, showBuySell]);

  // Calcola POC (Point of Control)
  const poc = useMemo(() => {
    if (processedData.length === 0) return null;
    return processedData.reduce((max, level) =>
      level.volume > max.volume ? level : max
    );
  }, [processedData]);

  // Calcola Value Area (70% del volume)
  const valueArea = useMemo(() => {
    if (processedData.length === 0) return { top: 0, bottom: 0 };

    const totalVolume = processedData.reduce((sum, level) => sum + level.volume, 0);
    const targetVolume = totalVolume * 0.7;

    // Trova POC index
    const pocIndex = processedData.findIndex((level) => level === poc);
    if (pocIndex === -1) return { top: 0, bottom: 0 };

    let accumulatedVolume = poc?.volume || 0;
    let topIndex = pocIndex;
    let bottomIndex = pocIndex;

    // Espandi verso top e bottom
    while (accumulatedVolume < targetVolume) {
      const topVolume = topIndex > 0 ? processedData[topIndex - 1].volume : 0;
      const bottomVolume =
        bottomIndex < processedData.length - 1
          ? processedData[bottomIndex + 1].volume
          : 0;

      if (topVolume > bottomVolume && topIndex > 0) {
        topIndex--;
        accumulatedVolume += topVolume;
      } else if (bottomIndex < processedData.length - 1) {
        bottomIndex++;
        accumulatedVolume += bottomVolume;
      } else {
        break;
      }
    }

    return {
      top: processedData[topIndex]?.price || 0,
      bottom: processedData[bottomIndex]?.price || 0,
    };
  }, [processedData, poc]);

  // Calcola bounds
  const { priceMin, priceMax, volumeMax } = useMemo(() => {
    if (processedData.length === 0) {
      return { priceMin: 0, priceMax: 100, volumeMax: 1 };
    }

    const prices = processedData.map((d) => d.price);
    const volumes = processedData.map((d) => d.volume);

    return {
      priceMin: Math.min(...prices),
      priceMax: Math.max(...prices),
      volumeMax: Math.max(...volumes, 1),
    };
  }, [processedData]);

  // Normalizza coordinate
  const normalizePrice = (price: number): number => {
    const range = priceMax - priceMin;
    if (range === 0) return 50;
    return ((price - priceMin) / range) * 100;
  };

  const normalizeVolume = (volume: number): number => {
    return (volume / volumeMax) * 100;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Volume Profile
        </h3>
        <div className="flex items-center gap-4 text-sm">
          {poc && (
            <span className="text-gray-600 dark:text-gray-400">
              POC: <span className="font-semibold text-gray-900 dark:text-white">
                ${poc.price.toFixed(2)}
              </span>
            </span>
          )}
          <span className="text-gray-600 dark:text-gray-400">
            Value Area: <span className="font-semibold text-gray-900 dark:text-white">
              ${valueArea.bottom.toFixed(2)} - ${valueArea.top.toFixed(2)}
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

          {/* Value Area highlight */}
          <rect
            x="0%"
            y={`${100 - normalizePrice(valueArea.top)}%`}
            width="100%"
            height={`${normalizePrice(valueArea.top) - normalizePrice(valueArea.bottom)}%`}
            fill="#3b82f6"
            opacity={0.1}
          />

          {/* Volume bars */}
          {processedData.map((level, index) => {
            const x = 0;
            const y = 100 - normalizePrice(level.price);
            const width = normalizeVolume(level.volume);
            const barHeight = 100 / processedData.length;

            if (showBuySell && level.buyVolume && level.sellVolume) {
              const buyWidth = normalizeVolume(level.buyVolume);
              const sellWidth = normalizeVolume(level.sellVolume);

              return (
                <g key={`level-${index}`}>
                  {/* Buy volume (green, left) */}
                  <rect
                    x={`${x}%`}
                    y={`${y - barHeight / 2}%`}
                    width={`${buyWidth}%`}
                    height={`${barHeight}%`}
                    fill="#10b981"
                    opacity={0.7}
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                  />
                  {/* Sell volume (red, right) */}
                  <rect
                    x={`${100 - sellWidth}%`}
                    y={`${y - barHeight / 2}%`}
                    width={`${sellWidth}%`}
                    height={`${barHeight}%`}
                    fill="#ef4444"
                    opacity={0.7}
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                  />
                </g>
              );
            }

            return (
              <rect
                key={`level-${index}`}
                x={`${x}%`}
                y={`${y - barHeight / 2}%`}
                width={`${width}%`}
                height={`${barHeight}%`}
                fill={level.price === poc?.price ? '#3b82f6' : '#6b7280'}
                opacity={0.7}
                className="hover:opacity-100 transition-opacity cursor-pointer"
              />
            );
          })}

          {/* POC line */}
          {poc && (
            <line
              x1="0%"
              y1={`${100 - normalizePrice(poc.price)}%`}
              x2="100%"
              y2={`${100 - normalizePrice(poc.price)}%`}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          )}

          {/* Current price line */}
          {currentPrice && (
            <line
              x1="0%"
              y1={`${100 - normalizePrice(currentPrice)}%`}
              x2="100%"
              y2={`${100 - normalizePrice(currentPrice)}%`}
              stroke="#f59e0b"
              strokeWidth={2}
            />
          )}
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
          <div className="w-4 h-4 bg-gray-500 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Volume</span>
        </div>
        {poc && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">POC</span>
          </div>
        )}
        {currentPrice && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-amber-500" />
            <span className="text-gray-600 dark:text-gray-400">Current Price</span>
          </div>
        )}
        {showBuySell && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-gray-600 dark:text-gray-400">Buy Volume</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-gray-600 dark:text-gray-400">Sell Volume</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

