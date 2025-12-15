'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';

interface RedditPost {
  title: string;
  score: number;
  upvoteRatio: number;
  sentiment: number;
  permalink: string;
}

interface RedditSentimentData {
  subreddit: string;
  averageSentiment: number;
  totalPosts: number;
  averageScore: number;
  averageUpvoteRatio: number;
  topPosts: RedditPost[];
}

const SUBREDDITS = ['cryptocurrency', 'wallstreetbets'];

export function RedditSentiment() {
  const { t, locale } = useTranslations();
  const [sentiments, setSentiments] = useState<Record<string, RedditSentimentData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentiments = async () => {
      setLoading(true);
      try {
        const promises = SUBREDDITS.map(subreddit =>
          fetch(`/api/social/reddit-sentiment?subreddit=${subreddit}&limit=25`)
            .then(res => res.json())
            .then(data => ({ subreddit, data: data.data }))
            .catch(() => ({ subreddit, data: null }))
        );

        const results = await Promise.all(promises);
        const sentimentMap: Record<string, RedditSentimentData> = {};

        results.forEach(({ subreddit, data }) => {
          if (data) {
            sentimentMap[subreddit] = data;
          }
        });

        setSentiments(sentimentMap);
      } catch (error) {
        console.error('Error fetching Reddit sentiment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentiments();
    const interval = setInterval(fetchSentiments, 30 * 60 * 1000); // Refresh every 30 minutes
    return () => clearInterval(interval);
  }, []);

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 0.05) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (sentiment <= -0.05) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.05) return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (sentiment <= -0.05) return 'text-red-400 bg-red-400/10 border-red-400/30';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  };

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Reddit Sentiment"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            {t('dashboard.redditSentiment.title') || 'Reddit Sentiment'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.redditSentiment.description') || 'Sentiment analysis from Reddit communities'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-bg-base border border-border-subtle rounded-lg p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : Object.entries(sentiments).length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No Reddit sentiment data available
          </div>
        ) : (
          Object.entries(sentiments).map(([subreddit, data]) => (
            <div
              key={subreddit}
              className={cn(
                'bg-bg-base border rounded-lg p-4 transition-all',
                getSentimentColor(data.averageSentiment)
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    r/{subreddit}
                  </span>
                  {getSentimentIcon(data.averageSentiment)}
                </div>
                <div className="text-xs text-text-tertiary">
                  {data.totalPosts} posts analyzed
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary mb-1">
                {data.averageSentiment > 0 ? '+' : ''}{data.averageSentiment.toFixed(3)}
              </div>
              <div className="text-xs text-text-tertiary mb-4">
                Avg Score: {data.averageScore.toLocaleString()} • Upvote Ratio: {(data.averageUpvoteRatio * 100).toFixed(1)}%
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-text-secondary mb-2">
                  Top Posts:
                </div>
                {data.topPosts.slice(0, 3).map((post, index) => (
                  <a
                    key={index}
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-text-secondary hover:text-accent transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-text-tertiary">•</span>
                      <span className="line-clamp-2 flex-1">{post.title}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-4 text-text-tertiary">
                      <span>{post.score.toLocaleString()} upvotes</span>
                      <span>•</span>
                      <span>{getSentimentIcon(post.sentiment)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
