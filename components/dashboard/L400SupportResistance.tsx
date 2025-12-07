'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface OrderBookLevel {
  price: number;
  volume: number;
}

interface SupportResistanceLevel {
  price: number;
  volume: number;
  type: 'support' | 'resistance';
}

interface L400Data {
  currentPrice: number;
  supportLevels: SupportResistanceLevel[];
  resistanceLevels: SupportResistanceLevel[];
  imbalance: number; // -1 to +1
  totalBidVolume: number;
  totalAskVolume: number;
}

/**
 * L400 Support/Resistance Component
 * 
 * Academic References:
 * - Glosten & Milgrom (1985) - "Bid, Ask and Transaction Prices"
 * - Kyle (1985) - "Continuous Auctions and Insider Trading"
 * 
 * Methodology:
 * - Support: Price levels with bid volume > 2σ above mean
 * - Resistance: Price levels with ask volume > 2σ above mean
 * - Imbalance: (Total Bid - Total Ask) / (Total Bid + Total Ask)
 */
export function L400SupportResistance() {
  const { t, locale } = useTranslations();
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [data, setData] = useState<L400Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState<Array<{ timestamp: string; price: number }>>([]);

  useEffect(() => {
    const fetchL400Data = async () => {
      try {
        setLoading(true);

        // Fetch multi-exchange order book (aggregated from Binance, Coinbase, Kraken, OKX)
        const multiExchangeResponse = await fetch(`/api/crypto/multi-exchange-depth?symbol=${symbol}`);
        if (!multiExchangeResponse.ok) {
          // Fallback to Binance only if multi-exchange fails
          const orderBookResponse = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=400`);
          if (!orderBookResponse.ok) throw new Error('Failed to fetch order book');
          const orderBook = await orderBookResponse.json();
          
          const tickerResponse = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
          const ticker = tickerResponse.ok ? await tickerResponse.json() : { price: '0' };
          const currentPrice = parseFloat(ticker.price);

          const bids: OrderBookLevel[] = orderBook.bids.map(([price, qty]: [string, string]) => ({
            price: parseFloat(price),
            volume: parseFloat(qty) * parseFloat(price),
          }));

          const asks: OrderBookLevel[] = orderBook.asks.map(([price, qty]: [string, string]) => ({
            price: parseFloat(price),
            volume: parseFloat(qty) * parseFloat(price),
          }));
          
          // Continue with existing logic...
          const bidVolumes = bids.map(b => b.volume);
          const meanBid = bidVolumes.reduce((a, b) => a + b, 0) / bidVolumes.length;
          const stdDevBid = Math.sqrt(
            bidVolumes.reduce((sum, v) => sum + Math.pow(v - meanBid, 2), 0) / bidVolumes.length
          );
          const thresholdBid = meanBid + 2 * stdDevBid;

          const askVolumes = asks.map(a => a.volume);
          const meanAsk = askVolumes.reduce((a, b) => a + b, 0) / askVolumes.length;
          const stdDevAsk = Math.sqrt(
            askVolumes.reduce((sum, v) => sum + Math.pow(v - meanAsk, 2), 0) / askVolumes.length
          );
          const thresholdAsk = meanAsk + 2 * stdDevAsk;

          const supportLevels: SupportResistanceLevel[] = bids
            .filter(b => b.volume > thresholdBid && b.price < currentPrice)
            .map(b => ({ ...b, type: 'support' as const }))
            .sort((a, b) => b.price - a.price)
            .slice(0, 10);

          const resistanceLevels: SupportResistanceLevel[] = asks
            .filter(a => a.volume > thresholdAsk && a.price > currentPrice)
            .map(a => ({ ...a, type: 'resistance' as const }))
            .sort((a, b) => a.price - b.price)
            .slice(0, 10);

          const totalBidVolume = bids.reduce((sum, b) => sum + b.volume, 0);
          const totalAskVolume = asks.reduce((sum, a) => sum + a.volume, 0);
          const imbalance = totalBidVolume > 0 && totalAskVolume > 0
            ? (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume)
            : 0;

          setData({
            currentPrice,
            supportLevels,
            resistanceLevels,
            imbalance,
            totalBidVolume,
            totalAskVolume,
          });

          // Fetch price history for chart
          const klinesResponse = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`);
          if (klinesResponse.ok) {
            const klines = await klinesResponse.json();
            setPriceHistory(klines.map((k: any[]) => ({
              timestamp: new Date(k[0]).toISOString(),
              price: parseFloat(k[4]), // Close price
            })));
          }

          setLoading(false);
          return;
        }

        const multiExchangeData = await multiExchangeResponse.json();
        if (!multiExchangeData.success || !multiExchangeData.data) {
          throw new Error('Invalid multi-exchange data');
        }

        const aggregated = multiExchangeData.data.aggregated;
        const currentPrice = aggregated.bids[0]?.price || aggregated.asks[0]?.price || 0;

        // Process aggregated bids and asks
        const bids: OrderBookLevel[] = aggregated.bids.map((level: { price: number; quantity: number }) => ({
          price: level.price,
          volume: level.quantity * level.price, // Volume in USD
        }));

        const asks: OrderBookLevel[] = aggregated.asks.map((level: { price: number; quantity: number }) => ({
          price: level.price,
          volume: level.quantity * level.price, // Volume in USD
        }));

        // Calculate mean and std dev for bids
        const bidVolumes = bids.map(b => b.volume);
        const meanBid = bidVolumes.reduce((a, b) => a + b, 0) / bidVolumes.length;
        const stdDevBid = Math.sqrt(
          bidVolumes.reduce((sum, v) => sum + Math.pow(v - meanBid, 2), 0) / bidVolumes.length
        );
        const thresholdBid = meanBid + 2 * stdDevBid;

        const askVolumes = asks.map(a => a.volume);
        const meanAsk = askVolumes.reduce((a, b) => a + b, 0) / askVolumes.length;
        const stdDevAsk = Math.sqrt(
          askVolumes.reduce((sum, v) => sum + Math.pow(v - meanAsk, 2), 0) / askVolumes.length
        );
        const thresholdAsk = meanAsk + 2 * stdDevAsk;

        const supportLevels: SupportResistanceLevel[] = bids
          .filter(b => b.volume > thresholdBid && b.price < currentPrice)
          .map(b => ({ ...b, type: 'support' as const }))
          .sort((a, b) => b.price - a.price)
          .slice(0, 10);

        const resistanceLevels: SupportResistanceLevel[] = asks
          .filter(a => a.volume > thresholdAsk && a.price > currentPrice)
          .map(a => ({ ...a, type: 'resistance' as const }))
          .sort((a, b) => a.price - b.price)
          .slice(0, 10);

        const totalBidVolume = aggregated.totalBidVolume;
        const totalAskVolume = aggregated.totalAskVolume;
        const imbalance = aggregated.imbalance / 100; // Convert from percentage to ratio

        setData({
          currentPrice,
          supportLevels,
          resistanceLevels,
          imbalance,
          totalBidVolume,
          totalAskVolume,
        });

        // Fetch price history for chart
        const klinesResponse = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`);
        if (klinesResponse.ok) {
          const klines = await klinesResponse.json();
          setPriceHistory(klines.map((k: any[]) => ({
            timestamp: new Date(k[0]).toISOString(),
            price: parseFloat(k[4]), // Close price
          })));
        }

        setLoading(false);

        // Calculate mean and std dev for bids
        const bidVolumes = bids.map(b => b.volume);
        const meanBid = bidVolumes.reduce((a, b) => a + b, 0) / bidVolumes.length;
        const stdDevBid = Math.sqrt(
          bidVolumes.reduce((sum, v) => sum + Math.pow(v - meanBid, 2), 0) / bidVolumes.length
        );

        // Calculate mean and std dev for asks
        const askVolumes = asks.map(a => a.volume);
        const meanAsk = askVolumes.reduce((a, b) => a + b, 0) / askVolumes.length;
        const stdDevAsk = Math.sqrt(
          askVolumes.reduce((sum, v) => sum + Math.pow(v - meanAsk, 2), 0) / askVolumes.length
        );

        // Identify support levels (bid volume > mean + 2σ)
        const supportLevels: SupportResistanceLevel[] = bids
          .filter(bid => bid.volume > meanBid + 2 * stdDevBid)
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 5)
          .map(bid => ({
            price: bid.price,
            volume: bid.volume,
            type: 'support' as const,
          }));

        // Identify resistance levels (ask volume > mean + 2σ)
        const resistanceLevels: SupportResistanceLevel[] = asks
          .filter(ask => ask.volume > meanAsk + 2 * stdDevAsk)
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 5)
          .map(ask => ({
            price: ask.price,
            volume: ask.volume,
            type: 'resistance' as const,
          }));

        // Calculate imbalance
        const totalBidVolume = bids.reduce((sum, b) => sum + b.volume, 0);
        const totalAskVolume = asks.reduce((sum, a) => sum + a.volume, 0);
        const imbalance = (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume);

        setData({
          currentPrice,
          supportLevels,
          resistanceLevels,
          imbalance,
          totalBidVolume,
          totalAskVolume,
        });

        // Fetch price history for chart
        const klineResponse = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`);
        if (klineResponse.ok) {
          const klines = await klineResponse.json();
          setPriceHistory(klines.map((k: any[]) => ({
            timestamp: new Date(k[0]).toISOString(),
            price: parseFloat(k[4]), // Close price
          })));
        }
      } catch (error) {
        console.error('Error fetching L400 data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchL400Data();
    
    // Refresh ogni 2 minuti (order book cambia veloce)
    const interval = setInterval(fetchL400Data, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  if (loading) {
    return (
      <section className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6">
        <Skeleton className="h-96 w-full" />
      </section>
    );
  }

  if (!data) {
    return null;
  }

  // Chart data with support/resistance lines
  const chartData = {
    labels: priceHistory.map((_, i) => i),
    datasets: [
      {
        label: 'Price',
        data: priceHistory.map(p => p.price),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.4,
      },
      // Support levels as horizontal lines
      ...data.supportLevels.map((level, i) => ({
        label: `Support ${i + 1}`,
        data: Array(priceHistory.length).fill(level.price),
        borderColor: '#10b981',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      })),
      // Resistance levels as horizontal lines
      ...data.resistanceLevels.map((level, i) => ({
        label: `Resistance ${i + 1}`,
        data: Array(priceHistory.length).fill(level.price),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      })),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (context.datasetIndex === 0) {
              return `Price: $${context.parsed.y.toLocaleString()}`;
            }
            return `$${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: true,
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="L400 Support and Resistance based on real order book"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            {t('dashboard.l400SupportResistance.title') || 'L400 Support & Resistance'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.l400SupportResistance.description') || 'Supporti e resistenze reali basati su order book L400'}
          </p>
        </div>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-sm text-text-primary"
        >
          <option value="BTCUSDT">BTC/USDT</option>
          <option value="ETHUSDT">ETH/USDT</option>
          <option value="BNBUSDT">BNB/USDT</option>
          <option value="SOLUSDT">SOL/USDT</option>
        </select>
      </div>

      {/* Price Chart with Support/Resistance Lines */}
      <div className="mb-6">
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-2 text-center">
          <span className="text-lg font-bold text-text-primary">
            Current Price: ${data.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Support Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Support Levels (Bid L400)
          </h3>
          <div className="space-y-2">
            {data.supportLevels.length > 0 ? (
              data.supportLevels.map((level, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/30 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-text-primary">
                      ${level.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {formatVolume(level.volume)} bid volume
                    </div>
                  </div>
                  <div className="text-xs text-green-400">
                    {((level.price / data.currentPrice - 1) * 100).toFixed(2)}%
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-text-tertiary">No significant support levels</div>
            )}
          </div>
        </div>

        {/* Resistance Levels */}
        <div>
          <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Resistance Levels (Ask L400)
          </h3>
          <div className="space-y-2">
            {data.resistanceLevels.length > 0 ? (
              data.resistanceLevels.map((level, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-text-primary">
                      ${level.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {formatVolume(level.volume)} ask volume
                    </div>
                  </div>
                  <div className="text-xs text-red-400">
                    {((level.price / data.currentPrice - 1) * 100).toFixed(2)}%
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-text-tertiary">No significant resistance levels</div>
            )}
          </div>
        </div>
      </div>

      {/* Imbalance Indicator */}
      <div className={cn(
        'p-4 rounded-lg border',
        data.imbalance > 0.05 
          ? 'bg-green-500/10 border-green-500/30'
          : data.imbalance < -0.05
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-bg-base border-border-subtle'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className={cn(
              'w-5 h-5',
              data.imbalance > 0.05 ? 'text-green-400' : data.imbalance < -0.05 ? 'text-red-400' : 'text-text-tertiary'
            )} />
            <div>
              <div className="font-semibold text-text-primary">
                Order Book Imbalance
              </div>
              <div className="text-xs text-text-tertiary">
                {data.imbalance > 0 
                  ? 'More bids than asks (bullish pressure)'
                  : data.imbalance < 0
                  ? 'More asks than bids (bearish pressure)'
                  : 'Balanced order book'}
              </div>
            </div>
          </div>
          <div className={cn(
            'text-lg font-bold',
            data.imbalance > 0 ? 'text-green-400' : data.imbalance < 0 ? 'text-red-400' : 'text-text-primary'
          )}>
            {data.imbalance > 0 ? '+' : ''}{(data.imbalance * 100).toFixed(2)}%
          </div>
        </div>
        <div className="mt-2 text-xs text-text-tertiary">
          Total Bid: {formatVolume(data.totalBidVolume)} | Total Ask: {formatVolume(data.totalAskVolume)}
        </div>
      </div>

      {/* Academic Note */}
      <div className="mt-4 text-xs text-text-tertiary">
        <p>
          <strong>Academic Reference:</strong> Glosten & Milgrom (1985) - "Bid, Ask and Transaction Prices". 
          Support/Resistance levels identified using 2σ threshold above mean order book volume. 
          Data from Binance public API (L400 order book depth).
        </p>
      </div>
    </section>
  );
}
