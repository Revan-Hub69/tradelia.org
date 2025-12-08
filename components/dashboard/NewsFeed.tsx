'use client';

import { useState, useEffect, useMemo } from 'react';
import { ExternalLink, TrendingUp, TrendingDown, Minus, Filter, Search, Shield, Layers } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useAutoTranslateArray } from '@/lib/hooks/useAutoTranslate';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import { API_CONFIG } from '@/lib/config/api';
import { MOCK_NEWS } from '@/lib/config/mock-data';
import { mockFetch } from '@/lib/utils/fetch-wrapper';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  sentiment: {
    compound: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  impactScore: number;
  description?: string;
  credibilityScore?: number;
  clusterId?: string;
}

export function NewsFeed() {
  const { t, locale } = useTranslations();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCategories] = useState<string[]>(['all', 'markets', 'crypto']);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Se API disattivate, usa dati mock
        if (API_CONFIG.DISABLE_API_CALLS) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setNews(MOCK_NEWS as any);
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          category: category === 'all' ? '' : category,
          limit: '30',
        });
        const fetchFn = API_CONFIG.DISABLE_API_CALLS ? mockFetch : fetch;
        const response = await fetchFn(`/api/news/rss?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setNews(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    if (!API_CONFIG.DISABLE_API_CALLS) {
      const interval = setInterval(fetchNews, 5 * 60 * 1000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [category]);

  const filteredNews = news.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.source.toLowerCase().includes(query)
    );
  });

  // Auto-translate all news items in batch
  const titlesToTranslate = useMemo(() => 
    filteredNews.map(item => item.title),
    [filteredNews]
  );
  const descriptionsToTranslate = useMemo(() => 
    filteredNews.map(item => item.description || ''),
    [filteredNews]
  );
  
  const translatedTitles = useAutoTranslateArray(titlesToTranslate, locale === 'it');
  const translatedDescriptions = useAutoTranslateArray(descriptionsToTranslate, locale === 'it');
  
  // Create translated news items
  const translatedNews = useMemo(() => 
    filteredNews.map((item, index) => ({
      ...item,
      translatedTitle: translatedTitles[index] || item.title,
      translatedDescription: translatedDescriptions[index] || item.description,
    })),
    [filteredNews, translatedTitles, translatedDescriptions]
  );

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 7) return 'text-red-400 bg-red-400/10';
    if (score >= 4) return 'text-amber-400 bg-amber-400/10';
    return 'text-blue-400 bg-blue-400/10';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="News Feed"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent" />
            {t('dashboard.news.title') || 'Market News'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.news.description') || 'Aggregated news from top financial sources'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex gap-2 flex-wrap">
          {availableCategories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat)}
              className="capitalize"
            >
              {cat === 'all' ? 'All' : cat}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* News List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-bg-base border border-border-subtle rounded-lg p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No news found
          </div>
        ) : (
          translatedNews.map((item, index) => (
              <a
                key={`${item.link}-${index}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'block bg-bg-base border border-border-subtle rounded-lg p-4 transition-all hover:border-accent/40 hover:shadow-md',
                  item.impactScore >= 7 && 'border-red-500/30 bg-red-500/5',
                  item.impactScore >= 4 && item.impactScore < 7 && 'border-amber-500/30 bg-amber-500/5'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded font-semibold',
                        getImpactColor(item.impactScore)
                      )}>
                        Impact {item.impactScore}/10
                      </span>
                      {item.credibilityScore && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {item.credibilityScore}
                        </span>
                      )}
                      {item.clusterId && (
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {locale === 'it' ? 'Cluster' : 'Cluster'}
                        </span>
                      )}
                      <span className="text-xs text-text-tertiary capitalize">
                        {item.category}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {item.source}
                      </span>
                      {getSentimentIcon(item.sentiment.label)}
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1 line-clamp-2">
                      {item.translatedTitle}
                    </h3>
                    {item.translatedDescription && (
                      <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                        {item.translatedDescription}
                      </p>
                    )}
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <span>{formatDate(item.pubDate)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </section>
  );
}
