'use client';

import { useState, useEffect, memo } from 'react';
import { RSSFeedCard } from './RSSFeedCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category?: string;
}

interface RSSFeedListProps {
  category?: 'finance' | 'crypto';
  source?: string;
  limit?: number;
  className?: string;
}

/**
 * RSS Feed List - Tradelia Style
 * Lista di news RSS con virtualizzazione per performance
 */
export const RSSFeedList = memo(function RSSFeedList({
  category,
  source,
  limit = 20,
  className,
}: RSSFeedListProps) {
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRSS() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (source) params.set('source', source);
        params.set('limit', limit.toString());

        const response = await fetch(`/api/news/rss?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch RSS feeds');

        const data = await response.json();
        setItems(data.items || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchRSS();
    const interval = setInterval(fetchRSS, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [category, source, limit]);

  if (loading) {
    return (
      <div className={cn('grid gap-4', className)}>
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-soft border-2 border-border-subtle rounded-xl p-6"
          >
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-text-secondary">Errore nel caricamento delle news: {error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-text-secondary">Nessuna news disponibile al momento.</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', className)}>
      {items.map((item, index) => (
        <RSSFeedCard key={`${item.link}-${index}`} item={item} />
      ))}
    </div>
  );
});
