'use client';

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { TrendingUp, FileText, Star, Bell, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { useApi } from '@/lib/hooks/useApi';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

interface QuickStat {
  id: string;
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Quick Stats - 4 cards con statistiche rapide
 * Portfolio Value, Reports Generated, Favorites Count, Active Alerts
 */
export const QuickStats = memo(function QuickStats() {
  const { t, locale } = useTranslations();
  const [stats, setStats] = useState<QuickStat[]>([
    {
      id: 'portfolio',
      label: t('dashboard.quickStats.portfolio') || 'Portfolio',
      value: '—',
      icon: TrendingUp,
      href: buildLocalePath(locale, '/dashboard/watchlist'),
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      borderColor: 'border-green-400/30',
    },
    {
      id: 'reports',
      label: t('dashboard.quickStats.reports') || 'Report',
      value: '0',
      icon: FileText,
      href: buildLocalePath(locale, '/dashboard/reports'),
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      borderColor: 'border-blue-400/30',
    },
    {
      id: 'favorites',
      label: t('dashboard.quickStats.favorites') || 'Preferiti',
      value: '0',
      icon: Star,
      href: buildLocalePath(locale, '/dashboard/favorites'),
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/20',
      borderColor: 'border-amber-400/30',
    },
    {
      id: 'alerts',
      label: t('dashboard.quickStats.alerts') || 'Alert',
      value: '0',
      icon: Bell,
      href: buildLocalePath(locale, '/dashboard/watchlist'),
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
      borderColor: 'border-purple-400/30',
    },
  ]);

  const { data: statsData, loading } = useApi<{
    totalReports: number;
    favoritesCount: number;
    activeAlerts: number;
    portfolioValue?: number;
  }>('/api/dashboard/stats', {
    cacheTime: 2 * 60 * 1000, // 2 minutes
    requireAuth: false,
  });

  useEffect(() => {
    if (statsData) {
      setStats(prev => prev.map(stat => {
        if (stat.id === 'reports') {
          return { ...stat, value: statsData.totalReports || 0 };
        }
        if (stat.id === 'favorites') {
          return { ...stat, value: statsData.favoritesCount || 0 };
        }
        if (stat.id === 'alerts') {
          return { ...stat, value: statsData.activeAlerts || 0 };
        }
        if (stat.id === 'portfolio' && statsData.portfolioValue !== undefined) {
          return { ...stat, value: `€${statsData.portfolioValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` };
        }
        return stat;
      }));
    }
  }, [statsData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mb-6" aria-label="Statistiche rapide">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div
              className={cn(
                'relative p-6 rounded-xl border-2 transition-all duration-200',
                stat.bgColor,
                stat.borderColor,
                'hover:shadow-lg hover:scale-[1.02] cursor-pointer group'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.bgColor, stat.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.href && (
                  <ArrowRight className={cn('w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity', stat.color)} />
                )}
              </div>
              <div className="text-2xl font-extrabold text-text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-text-secondary">
                {stat.label}
              </div>
            </div>
          );

          if (stat.href) {
            return (
              <Link key={stat.id} href={stat.href} className="block">
                {content}
              </Link>
            );
          }

          return <div key={stat.id}>{content}</div>;
        })}
      </div>
    </section>
  );
});
