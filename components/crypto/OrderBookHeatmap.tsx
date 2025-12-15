/**
 * Order Book Heatmap Component
 * 
 * Visualizza order book come heatmap di profondità
 */

'use client';

import { OrderBookEntry } from '@/lib/price-apis/binance';

interface OrderBookHeatmapProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  midPrice: number;
  maxLevels?: number;
}

export function OrderBookHeatmap({
  bids,
  asks,
  midPrice,
  maxLevels = 50,
}: OrderBookHeatmapProps) {
  // Prendi primi N livelli
  const displayBids = bids.slice(0, maxLevels).reverse(); // Inverti per visualizzazione
  const displayAsks = asks.slice(0, maxLevels);

  // Calcola max volume per normalizzazione
  const allVolumes = [...bids, ...asks].map((e) => e.quantity);
  const maxVolume = Math.max(...allVolumes, 1);

  // Calcola percentuale dal mid-price
  const getPercentFromMid = (price: number) => {
    return ((price - midPrice) / midPrice) * 100;
  };

  return (
    <div className="w-full">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Order Book Heatmap (primi {maxLevels} livelli)
      </div>
      
      <div className="space-y-1">
        {/* Asks (sopra mid-price) */}
        {displayAsks.map((ask, i) => {
          const percentFromMid = getPercentFromMid(ask.price);
          const volumeIntensity = (ask.quantity / maxVolume) * 100;
          
          return (
            <div
              key={`ask-${i}`}
              className="flex items-center gap-2 text-xs"
              style={{
                opacity: 0.7 + (volumeIntensity / 100) * 0.3,
              }}
            >
              <div className="w-24 text-right text-red-600 dark:text-red-400">
                {ask.price.toFixed(2)}
              </div>
              <div
                className="flex-1 h-4 bg-red-500 dark:bg-red-600 rounded"
                style={{
                  width: `${volumeIntensity}%`,
                  minWidth: '2px',
                }}
                title={`Ask: ${ask.price.toFixed(2)} | Volume: ${ask.quantity.toFixed(4)} | ${percentFromMid.toFixed(3)}% dal mid`}
              />
              <div className="w-20 text-left text-gray-600 dark:text-gray-400">
                {ask.quantity.toFixed(4)}
              </div>
            </div>
          );
        })}

        {/* Mid Price Separator */}
        <div className="border-t-2 border-blue-500 dark:border-blue-400 my-2 py-1">
          <div className="text-center text-sm font-bold text-blue-600 dark:text-blue-400">
            Mid: {midPrice.toFixed(2)}
          </div>
        </div>

        {/* Bids (sotto mid-price) */}
        {displayBids.map((bid, i) => {
          const percentFromMid = getPercentFromMid(bid.price);
          const volumeIntensity = (bid.quantity / maxVolume) * 100;
          
          return (
            <div
              key={`bid-${i}`}
              className="flex items-center gap-2 text-xs"
              style={{
                opacity: 0.7 + (volumeIntensity / 100) * 0.3,
              }}
            >
              <div className="w-24 text-right text-green-600 dark:text-green-400">
                {bid.price.toFixed(2)}
              </div>
              <div
                className="flex-1 h-4 bg-green-500 dark:bg-green-600 rounded"
                style={{
                  width: `${volumeIntensity}%`,
                  minWidth: '2px',
                }}
                title={`Bid: ${bid.price.toFixed(2)} | Volume: ${bid.quantity.toFixed(4)} | ${percentFromMid.toFixed(3)}% dal mid`}
              />
              <div className="w-20 text-left text-gray-600 dark:text-gray-400">
                {bid.quantity.toFixed(4)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

