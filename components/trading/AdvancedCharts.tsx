/**
 * Advanced Charts Component
 * 
 * Integra Order Book Depth e Volume Profile charts
 */

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy load heavy chart components
const OrderBookDepthChart = dynamic(
  () => import('@/components/charts/OrderBookDepthChart').then(mod => ({ default: mod.OrderBookDepthChart })),
  { ssr: false }
);

const VolumeProfileChart = dynamic(
  () => import('@/components/charts/VolumeProfileChart').then(mod => ({ default: mod.VolumeProfileChart })),
  { ssr: false }
);
import { BarChart3, TrendingUp } from 'lucide-react';

interface AdvancedChartsProps {
  symbol: string;
}

interface OrderBookData {
  bids: Array<[number, number]>;
  asks: Array<[number, number]>;
}

interface VolumeProfileData {
  price: number;
  volume: number;
}

export function AdvancedCharts({ symbol }: AdvancedChartsProps) {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [volumeProfile, setVolumeProfile] = useState<VolumeProfileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orderbook' | 'volume'>('orderbook');

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

        // Fetch order book
        const orderBookRes = await fetch(
          `https://api.binance.com/api/v3/depth?symbol=${binanceSymbol}&limit=20`
        );
        if (orderBookRes.ok) {
          const orderBookData = await orderBookRes.json();
          setOrderBook({
            bids: orderBookData.bids.map(([price, qty]: [string, string]) => [
              parseFloat(price),
              parseFloat(qty),
            ]),
            asks: orderBookData.asks.map(([price, qty]: [string, string]) => [
              parseFloat(price),
              parseFloat(qty),
            ]),
          });
        }

        // Fetch klines for volume profile
        const klinesRes = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1h&limit=100`
        );
        if (klinesRes.ok) {
          const klinesData = await klinesRes.json();
          const profile: Record<number, number> = {};

          klinesData.forEach((kline: any[]) => {
            const price = parseFloat(kline[4]); // Close price
            const volume = parseFloat(kline[5]);
            const priceRounded = Math.round(price * 100) / 100; // Round to 2 decimals

            if (profile[priceRounded]) {
              profile[priceRounded] += volume;
            } else {
              profile[priceRounded] = volume;
            }
          });

          setVolumeProfile(
            Object.entries(profile)
              .map(([price, volume]) => ({
                price: parseFloat(price),
                volume: volume as number,
              }))
              .sort((a, b) => b.price - a.price)
          );
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header with Tabs */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Advanced Charts
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('orderbook')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'orderbook'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Order Book Depth
          </button>
          <button
            onClick={() => setActiveTab('volume')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'volume'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Volume Profile
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="p-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Caricamento...</div>
          </div>
        ) : activeTab === 'orderbook' ? (
          orderBook ? (
            <div className="h-[400px]">
              <OrderBookDepthChart
                bids={orderBook.bids.map(([price, qty]) => ({ price, quantity: qty }))}
                asks={orderBook.asks.map(([price, qty]) => ({ price, quantity: qty }))}
                height={400}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nessun dato disponibile
            </div>
          )
        ) : (
          volumeProfile.length > 0 ? (
            <div className="h-[400px]">
              <VolumeProfileChart
                data={volumeProfile}
                height={400}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nessun dato disponibile
            </div>
          )
        )}
      </div>
    </div>
  );
}

