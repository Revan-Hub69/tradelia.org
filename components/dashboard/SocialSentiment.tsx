'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';

interface SocialSentimentData {
  asset: string;
  sentiment: number;
  socialVolume: number;
  socialDominance: number;
  timestamp: number;
}

const ASSETS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];

export function SocialSentiment() {
  const { t, locale } = useTranslations();
  const [sentiments, setSentiments] = useState<Record<string, SocialSentimentData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentiments = async () => {
      setLoading(true);
      try {
        const promises = ASSETS.map(asset =>
          fetch(`/api/crypto/social-sentiment?asset=${asset}`)
            .then(res => res.json())
            .then(data => ({ asset, data: data.data }))
            .catch(() => ({ asset, data: null }))
        );

        const results = await Promise.all(promises);
        const sentimentMap: Record<string, SocialSentimentData> = {};

        results.forEach(({ asset, data }) => {
          if (data) {
            sentimentMap[asset] = data;
          }
        });

        setSentiments(sentimentMap);
      } catch (error) {
        console.error('Error fetching social sentiment:', error);
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

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Social Sentiment"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            {t('dashboard.socialSentiment.title') || 'Social Sentiment'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.socialSentiment.description') || 'Social media sentiment analysis for top cryptocurrencies'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-bg-base border border-border-subtle rounded-lg p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : Object.entries(sentiments).length === 0 ? (
          <div className="col-span-full text-center py-8 text-text-secondary">
            No social sentiment data available
          </div>
        ) : (
          Object.entries(sentiments).map(([asset, data]) => (
            <div
              key={asset}
              className={cn(
                'bg-bg-base border rounded-lg p-4 transition-all',
                getSentimentColor(data.sentiment)
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {asset}
                  </span>
                  {getSentimentIcon(data.sentiment)}
                </div>
                <div className="text-xs text-text-tertiary">
                  Vol: {formatVolume(data.socialVolume)}
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary mb-1">
                {data.sentiment > 0 ? '+' : ''}{data.sentiment.toFixed(1)}
              </div>
              <div className="text-xs text-text-tertiary">
                Sentiment Score (-100 to +100)
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
