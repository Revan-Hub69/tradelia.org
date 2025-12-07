'use client';

import { useState, useEffect } from 'react';
import { Code, GitCommit, Users, Star, GitFork, Package } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';

interface DeveloperActivity {
  repository: string;
  commits7d: number;
  commits30d: number;
  contributors: number;
  stars: number;
  forks: number;
  lastCommit: string;
  releaseCount: number;
  lastRelease: string | null;
}

const ASSETS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];

export function DeveloperActivity() {
  const { t, locale } = useTranslations();
  const [activities, setActivities] = useState<Record<string, DeveloperActivity>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const promises = ASSETS.map(asset =>
          fetch(`/api/crypto/developer-activity?asset=${asset}`)
            .then(res => res.json())
            .then(data => ({ asset, data: data.data }))
            .catch(() => ({ asset, data: null }))
        );

        const results = await Promise.all(promises);
        const activityMap: Record<string, DeveloperActivity> = {};

        results.forEach(({ asset, data }) => {
          if (data) {
            activityMap[asset] = data;
          }
        });

        setActivities(activityMap);
      } catch (error) {
        console.error('Error fetching developer activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 6 * 60 * 60 * 1000); // Refresh every 6 hours
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Developer Activity"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Code className="w-5 h-5 text-accent" />
            {t('dashboard.developerActivity.title') || 'Developer Activity'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.developerActivity.description') || 'GitHub activity metrics for top cryptocurrency projects'}
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
        ) : Object.entries(activities).length === 0 ? (
          <div className="col-span-full text-center py-8 text-text-secondary">
            No developer activity data available
          </div>
        ) : (
          Object.entries(activities).map(([asset, activity]) => (
            <div
              key={asset}
              className="bg-bg-base border border-border-subtle rounded-lg p-4 transition-all hover:border-accent/40"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-text-primary">
                    {activity.repository}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {asset}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <div className="text-xs text-text-tertiary">7d</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {activity.commits7d}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <div className="text-xs text-text-tertiary">30d</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {activity.commits30d}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <div className="text-xs text-text-tertiary">Contributors</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {activity.contributors.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <div className="text-xs text-text-tertiary">Stars</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {activity.stars.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <div className="text-xs text-text-tertiary">Forks</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {activity.forks.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <div className="text-xs text-text-tertiary">Releases</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {activity.releaseCount}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-text-tertiary pt-3 border-t border-border-subtle">
                Last commit: {formatDate(activity.lastCommit)}
                {activity.lastRelease && (
                  <>
                    <br />
                    Last release: {formatDate(activity.lastRelease)}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
