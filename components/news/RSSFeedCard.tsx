'use client';

import { memo } from 'react';
import { ExternalLink, Clock, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { RSSIcon } from '@/components/icons/IndicatorIcons';

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category?: string;
}

interface RSSFeedCardProps {
  item: RSSItem;
  className?: string;
}

/**
 * RSS Feed Card - Tradelia Style
 * Card per visualizzare una singola news RSS
 */
export const RSSFeedCard = memo(function RSSFeedCard({
  item,
  className,
}: RSSFeedCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.RelativeTimeFormat('it', { numeric: 'auto' }).format(
        Math.round((date.getTime() - Date.now()) / (1000 * 60)),
        'minute'
      );
    } catch {
      return dateString;
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      reuters: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      bloomberg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      ft: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
      wsj: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      marketwatch: 'bg-green-500/20 text-green-400 border-green-500/40',
      coindesk: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      cointelegraph: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    };
    return colors[source] || 'bg-gray-500/20 text-gray-400 border-gray-500/40';
  };

  return (
    <article
      className={cn(
        'bg-bg-soft border-2 border-border-subtle rounded-xl p-6',
        'hover:border-accent/60 hover:shadow-lg transition-all duration-200',
        'flex flex-col gap-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <RSSIcon size={16} className="text-accent" />
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                getSourceColor(item.source)
              )}
            >
              {item.source.toUpperCase()}
            </span>
            {item.category && (
              <span className="text-xs text-text-tertiary">
                {item.category}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-3 mb-4">
            {item.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
        <div className="flex items-center gap-4 text-xs text-text-tertiary">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(item.pubDate)}
          </div>
          <div className="flex items-center gap-1">
            <Newspaper className="w-3 h-3" />
            {item.source}
          </div>
        </div>
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
        >
          Leggi <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
});
