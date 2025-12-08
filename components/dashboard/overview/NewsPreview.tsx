'use client';

import { useState, useEffect, memo } from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { SectionBanner } from '../SectionBanner';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { API_CONFIG } from '@/lib/config/api';
import { MOCK_NEWS } from '@/lib/config/mock-data';
import { mockFetch } from '@/lib/utils/fetch-wrapper';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  sentiment?: {
    compound: number;
    label: 'positive' | 'negative' | 'neutral';
  };
}

/**
 * News Preview - Ultime 5 notizie per Overview Tab
 * Link "Vedi tutte" → Sezione news completa
 */
export const NewsPreview = memo(function NewsPreview() {
  const { t, locale } = useTranslations();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        if (API_CONFIG.DISABLE_API_CALLS) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setNews((MOCK_NEWS as any).slice(0, 5));
          setLoading(false);
          return;
        }

        const fetchFn = API_CONFIG.DISABLE_API_CALLS ? mockFetch : fetch;
        const response = await fetchFn('/api/news/rss?limit=5');
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
      const interval = setInterval(fetchNews, 15 * 60 * 1000); // Refresh ogni 15 minuti
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <section className="mb-6" aria-label="Anteprima notizie">
      <div className="mb-4">
        <SectionBanner
          title="Ultime Notizie di Mercato"
          description="Le 5 notizie più recenti e rilevanti. Vedi tutte le notizie nella sezione completa."
        />
        <div className="mt-2 text-right">
          <Link
            href={buildLocalePath(locale, '/dashboard/market-data')}
            className="text-sm text-accent hover:underline inline-flex items-center gap-1"
          >
            Vedi tutte <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-bg-soft border border-border-subtle rounded-xl p-4">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="mt-4 text-center py-8 text-text-secondary">
          Nessuna notizia disponibile al momento.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {news.slice(0, 5).map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'block bg-bg-soft border border-border-subtle rounded-xl p-4',
                'hover:border-accent/60 hover:shadow-md transition-all duration-200',
                'group'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(item.pubDate), {
                        addSuffix: true,
                        locale: locale === 'it' ? itLocale : undefined,
                      })}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
});
