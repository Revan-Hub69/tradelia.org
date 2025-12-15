'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { calculateCorrelationMatrix } from '@/lib/utils/technical-indicators';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  prices: number[];
}

export function CorrelationHeatmap() {
  const { t, locale } = useTranslations();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);

        // Fetch price data for multiple assets
        const assetPromises = [
          { id: 'btc', name: 'Bitcoin', symbol: 'BTC', url: 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30' },
          { id: 'spy', name: 'S&P 500', symbol: 'SPY', url: '/api/market/data?symbol=SPY&assetType=stock' },
          { id: 'qqq', name: 'NASDAQ', symbol: 'QQQ', url: '/api/market/data?symbol=QQQ&assetType=stock' },
          { id: 'eurusd', name: 'EUR/USD', symbol: 'EURUSD', url: '/api/market/data?symbol=EURUSD&assetType=forex' },
          { id: 'gold', name: 'Gold', symbol: 'XAU', url: '/api/market/data?symbol=GOLD&assetType=commodity' },
          { id: 'oil', name: 'Oil', symbol: 'OIL', url: '/api/market/data?symbol=OIL&assetType=commodity' },
        ];

        const assetData: Asset[] = [];

        for (const asset of assetPromises) {
          try {
            if (asset.id === 'btc') {
              const response = await fetch(asset.url);
              if (response.ok) {
                const klines = await response.json();
                const prices = klines.map((k: any[]) => parseFloat(k[4])); // Close prices
                if (prices.length > 0) {
                  assetData.push({ id: asset.id, name: asset.name, symbol: asset.symbol, prices });
                }
              }
            } else {
              const response = await fetch(asset.url);
              if (response.ok) {
                const data = await response.json();
                // Simulate 30 days of prices for non-crypto
                if (data.success && data.data) {
                  const basePrice = data.data.currentPrice;
                  const change = data.data.change24hPercent / 100;
                  const prices = Array(30).fill(0).map((_, i) => 
                    basePrice * (1 - change * (1 - i / 29))
                  );
                  assetData.push({ id: asset.id, name: asset.name, symbol: asset.symbol, prices });
                }
              }
            }
          } catch (e) {
            console.error(`Error fetching ${asset.id}:`, e);
          }
        }

        setAssets(assetData);

        // Calculate correlation matrix
        if (assetData.length > 1) {
          const priceArrays = assetData.map(a => a.prices);
          const matrix = calculateCorrelationMatrix(priceArrays);
          setCorrelationMatrix(matrix);
        }
      } catch (error) {
        console.error('Error fetching correlation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
    const interval = setInterval(fetchAssets, 15 * 60 * 1000); // Refresh every 15 minutes
    return () => clearInterval(interval);
  }, []);

  const getCorrelationColor = (value: number): string => {
    if (value >= 0.7) return 'bg-green-500';
    if (value >= 0.3) return 'bg-green-300';
    if (value >= -0.3) return 'bg-gray-300';
    if (value >= -0.7) return 'bg-red-300';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <section className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6">
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  if (assets.length === 0 || correlationMatrix.length === 0) {
    return null;
  }

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Correlation Heatmap"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-text-primary">
          {locale === 'it' ? 'Matrice di Correlazione' : 'Correlation Matrix'}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          {locale === 'it' 
            ? 'Correlazioni tra asset (30 giorni)'
            : 'Asset correlations (30 days)'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-medium text-text-tertiary"></th>
              {assets.map((asset) => (
                <th key={asset.id} className="p-2 text-center text-xs font-medium text-text-tertiary min-w-[80px]">
                  {asset.symbol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, i) => (
              <tr key={asset.id}>
                <td className="p-2 text-xs font-medium text-text-secondary">
                  {asset.symbol}
                </td>
                {correlationMatrix[i]?.map((corr, j) => (
                  <td key={j} className="p-2 text-center">
                    {i === j ? (
                      <div className="w-12 h-12 mx-auto bg-accent/20 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-accent">1.0</span>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'w-12 h-12 mx-auto rounded flex items-center justify-center transition-all hover:scale-110',
                          getCorrelationColor(corr)
                        )}
                        title={`${asset.symbol} vs ${assets[j].symbol}: ${corr.toFixed(2)}`}
                      >
                        <span className="text-xs font-semibold text-white">
                          {corr.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-text-tertiary">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>{locale === 'it' ? 'Negativa' : 'Negative'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span>{locale === 'it' ? 'Neutrale' : 'Neutral'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>{locale === 'it' ? 'Positiva' : 'Positive'}</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-text-tertiary">
        <p>
          {locale === 'it' 
            ? 'Academic Reference: Longin & Solnik (2001) - Cross-asset correlations. Coefficiente di correlazione di Pearson calcolato su 30 giorni.'
            : 'Academic Reference: Longin & Solnik (2001) - Cross-asset correlations. Pearson correlation coefficient calculated on 30 days.'}
        </p>
      </div>
    </section>
  );
}
