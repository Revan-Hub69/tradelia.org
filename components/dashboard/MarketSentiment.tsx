'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, Minus, Filter, Lock } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import { ProLockOverlay } from './utilities/ProLockOverlay';

interface SentimentData {
  asset: string;
  assetType: 'crypto' | 'stock' | 'forex' | 'commodity';
  sentiment: number;
  socialVolume: number;
  source: string;
  timestamp: number;
}

const ASSETS_FREE = {
  crypto: ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'],
  stock: ['SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL'],
  forex: ['EURUSD', 'GBPUSD', 'USDJPY'],
  commodity: ['GOLD', 'OIL'],
};

const ASSETS_PRO = {
  crypto: ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'BNB', 'XRP', 'MATIC', 'LTC', 'AVAX', 'ATOM', 'LINK', 'UNI', 'AAVE', 'ALGO'],
  stock: ['SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'DIA', 'IWM', 'VTI', 'ARKK', 'TQQQ'],
  forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'],
  commodity: ['GOLD', 'OIL', 'SILVER', 'NATURAL_GAS', 'COPPER', 'WHEAT', 'CORN', 'SOYBEAN'],
};

export function MarketSentiment() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [sentiments, setSentiments] = useState<Record<string, SentimentData>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'crypto' | 'stock' | 'forex' | 'commodity'>('all');
  
  const ASSETS = isPro ? ASSETS_PRO : ASSETS_FREE;

  useEffect(() => {
    const fetchSentiments = async () => {
      setLoading(true);
      try {
        const allAssets: Array<{ asset: string; assetType: string }> = [];
        
        Object.entries(ASSETS).forEach(([type, assets]) => {
          assets.forEach(asset => {
            allAssets.push({ asset, assetType: type });
          });
        });

        const promises = allAssets.map(({ asset, assetType }) =>
          fetch(`/api/market/sentiment?asset=${asset}&assetType=${assetType}`)
            .then(res => res.json())
            .then(data => ({ asset, assetType, data: data.data }))
            .catch(() => ({ asset, assetType, data: null }))
        );

        const results = await Promise.all(promises);
        const sentimentMap: Record<string, SentimentData> = {};

        results.forEach(({ asset, assetType, data }) => {
          if (data) {
            sentimentMap[`${assetType}-${asset}`] = data;
          }
        });

        setSentiments(sentimentMap);
      } catch (error) {
        console.error('Error fetching market sentiment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentiments();
    const interval = setInterval(fetchSentiments, 60 * 60 * 1000); // Refresh every hour
    return () => clearInterval(interval);
  }, []);

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 20) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (sentiment <= -20) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 20) return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (sentiment <= -20) return 'text-red-400 bg-red-400/10 border-red-400/30';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  };

  const getAssetTypeColor = (assetType: string) => {
    switch (assetType) {
      case 'crypto': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'stock': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'forex': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'commodity': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
  };

  const filteredSentiments = Object.entries(sentiments).filter(([_, data]) => 
    filter === 'all' || data.assetType === filter
  );

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Market Sentiment"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            {t('dashboard.marketSentiment.title') || 'Market Sentiment'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.marketSentiment.description') || 'Social media sentiment across Crypto, Stocks, Forex, and Commodities'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'crypto', 'stock', 'forex', 'commodity'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === 'all' ? 'All' : f}
          </Button>
        ))}
      </div>

      {!isPro && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-sm text-amber-400">
          <Lock className="w-4 h-4" />
          <span>
            {locale === 'it' 
              ? 'Versione Pro: 30+ asset vs 15 free. Aggiorna per sbloccare tutti gli asset.'
              : 'Pro Version: 30+ assets vs 15 free. Upgrade to unlock all assets.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: isPro ? 16 : 8 }).map((_, i) => (
            <div key={i} className="bg-bg-base border border-border-subtle rounded-lg p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : filteredSentiments.length === 0 ? (
          <div className="col-span-full text-center py-8 text-text-secondary">
            No sentiment data available
          </div>
        ) : (
          filteredSentiments.map(([key, data]) => (
            <div
              key={key}
              className={cn(
                'bg-bg-base border rounded-lg p-4 transition-all',
                getSentimentColor(data.sentiment)
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {data.asset}
                  </span>
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase',
                    getAssetTypeColor(data.assetType)
                  )}>
                    {data.assetType}
                  </span>
                  {getSentimentIcon(data.sentiment)}
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary mb-1">
                {data.sentiment > 0 ? '+' : ''}{data.sentiment.toFixed(1)}
              </div>
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span>Vol: {formatVolume(data.socialVolume)}</span>
                <span className="capitalize">{data.source}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
