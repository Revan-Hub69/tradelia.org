'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  marketCapRank: number;
  image: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  score: number;
  priceBtc: number;
}

export function TrendingCoins() {
  const { t, locale } = useTranslations();
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/crypto/trending?limit=10');
        if (response.ok) {
          const data = await response.json();
          setCoins(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching trending coins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
    const interval = setInterval(fetchTrending, 15 * 60 * 1000); // Refresh every 15 minutes
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Trending Coins"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            {t('dashboard.trending.title') || 'Trending Coins'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.trending.description') || 'Top trending cryptocurrencies in the last 24 hours'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-bg-base border border-border-subtle rounded-lg p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))
        ) : coins.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No trending coins available
          </div>
        ) : (
          coins.map((coin, index) => (
            <a
              key={coin.id}
              href={`https://www.coingecko.com/en/coins/${coin.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'block bg-bg-base border border-border-subtle rounded-lg p-4 transition-all hover:border-accent/40 hover:shadow-md',
                index === 0 && 'border-amber-500/30 bg-amber-500/5'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-tertiary w-6">
                      #{index + 1}
                    </span>
                    {coin.image && (
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">
                          {coin.name}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {coin.symbol}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent rounded font-semibold">
                          #{coin.marketCapRank}
                        </span>
                      </div>
                      <div className="text-xs text-text-tertiary">
                        Score: {coin.score.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {formatCurrency(coin.price)}
                    </div>
                    <div className={cn(
                      'text-xs font-medium flex items-center gap-1 justify-end',
                      coin.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {coin.priceChange24h > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(coin.priceChange24h).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-xs text-text-tertiary">
                    <div>Vol: {formatCurrency(coin.volume24h)}</div>
                    <div>MCap: {formatCurrency(coin.marketCap)}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </section>
  );
}
