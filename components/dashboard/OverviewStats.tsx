'use client';

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import styles from './dashboard.module.css';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';
import { useApi } from '@/lib/hooks/useApi';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { ContextualHelp } from './ContextualHelp';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { cn } from '@/lib/utils/cn';

/**
 * OverviewStats Component - Premium Academic Design
 * Based on Few (2006) "Information Dashboard Design"
 * 
 * Displays 4-6 key metrics at-a-glance with:
 * - Value (large, prominent)
 * - Trend indicator (up/down/neutral)
 * - Context (previous value, target, or date)
 * - Action link (optional)
 */
export function OverviewStats() {
  const { t, locale } = useTranslations();
  const [stats, setStats] = useState([
    {
      id: 'total-reports',
      value: '0',
      label: t('dashboard.overview.stats.totalReports.label'),
      trend: 'neutral' as const,
      context: t('dashboard.overview.stats.totalReports.context'),
      action: {
        label: t('dashboard.overview.stats.totalReports.action'),
        href: buildLocalePath(locale, '/dashboard/analysis'),
      },
    },
    {
      id: 'active-courses',
      value: '0',
      label: t('dashboard.overview.stats.activeCourses.label'),
      trend: 'neutral' as const,
      context: t('dashboard.overview.stats.activeCourses.context'),
      action: {
        label: t('dashboard.overview.stats.activeCourses.action'),
        href: buildLocalePath(locale, '/dashboard/education'),
      },
    },
    {
      id: 'pending-requests',
      value: '0',
      label: t('dashboard.overview.stats.pendingRequests.label'),
      trend: 'neutral' as const,
      context: t('dashboard.overview.stats.pendingRequests.context'),
      action: {
        label: t('dashboard.overview.stats.pendingRequests.action'),
        href: buildLocalePath(locale, '/dashboard/requests'),
      },
    },
    {
      id: 'recent-activity',
      value: '—',
      label: t('dashboard.overview.stats.recentActivity.label'),
      trend: 'neutral' as const,
      context: t('dashboard.overview.stats.recentActivity.context'),
      action: {
        label: t('dashboard.overview.stats.recentActivity.action'),
        href: buildLocalePath(locale, '/dashboard'),
      },
    },
  ]);

  const { data: statsData, loading, error, retry } = useApi<{
    totalReports: number;
    activeCourses: number;
    pendingRequests: number;
    recentActivity: { created_at: string } | null;
  }>('/api/dashboard/stats', {
    cacheTime: 2 * 60 * 1000, // 2 minutes
    requireAuth: false, // Permetti accesso guest
    onError: (err) => {
      // Non mostrare errore per 401 - è normale per guest
      if (err instanceof Error && (err as any).status === 401) {
        return;
      }
      toast.error('Errore nel caricamento delle statistiche', {
        action: {
          label: 'Riprova',
          onClick: retry,
        },
      });
    },
  });

  useEffect(() => {
    if (statsData) {
      setStats(prev => prev.map(stat => {
        if (stat.id === 'total-reports') {
          return { ...stat, value: String(statsData.totalReports || 0) };
        }
        if (stat.id === 'active-courses') {
          return { ...stat, value: String(statsData.activeCourses || 0) };
        }
        if (stat.id === 'pending-requests') {
          return { ...stat, value: String(statsData.pendingRequests || 0) };
        }
        if (stat.id === 'recent-activity' && statsData.recentActivity) {
          const timeAgo = formatDistanceToNow(new Date(statsData.recentActivity.created_at), {
            addSuffix: true,
            locale: locale === 'it' ? itLocale : undefined,
          });
          return { ...stat, value: timeAgo };
        }
        return stat;
      }));
    }
  }, [statsData, locale]);

  if (loading) {
    return (
      <div className={styles.overviewSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>{t('dashboard.overview.eyebrow')}</span>
          <div>
            <h2 className={styles.sectionTitle}>{t('dashboard.overview.title')}</h2>
            <p className={styles.sectionDescription}>{t('dashboard.overview.description')}</p>
          </div>
        </div>
        <LoadingState message={t('dashboard.overview.loading') || 'Caricamento statistiche...'} />
      </div>
    );
  }

  // Non mostrare errore per 401 - è normale per guest access
  // L'API ora restituisce dati vuoti invece di 401, ma gestiamo comunque il caso
  if (error && !(error instanceof Error && (error as any).status === 401)) {
    return (
      <div className={styles.overviewSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>{t('dashboard.overview.eyebrow')}</span>
          <div>
            <h2 className={styles.sectionTitle}>{t('dashboard.overview.title')}</h2>
            <p className={styles.sectionDescription}>{t('dashboard.overview.description')}</p>
          </div>
        </div>
        <ErrorState
          title={t('dashboard.overview.errorTitle') || 'Errore nel caricamento'}
          message={t('dashboard.overview.errorMessage') || 'Impossibile caricare le statistiche. Riprova più tardi.'}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className={styles.overviewSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionEyebrow}>{t('dashboard.overview.eyebrow')}</span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className={styles.sectionTitle}>{t('dashboard.overview.title')}</h2>
            <ContextualHelp
              content={t('dashboard.overview.help') || 'Le statistiche mostrano un riepilogo delle tue attività principali. Clicca su una statistica per vedere i dettagli.'}
              aria-label="Informazioni sulle statistiche"
            />
          </div>
          <p className={styles.sectionDescription}>{t('dashboard.overview.description')}</p>
        </div>
      </div>
      <ul 
        className={styles.overviewStatsGrid}
        aria-label={t('dashboard.overview.ariaLabel') || 'Statistiche dashboard'}
      >
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} isFirst={index === 0} />
        ))}
      </ul>
    </div>
  );
}

export default memo(OverviewStats);

interface StatCardProps {
  stat: {
    id: string;
    value: number | string;
    label: string;
    trend: 'up' | 'down' | 'neutral';
    context: string;
    action?: {
      label: string;
      href: string;
    };
  };
  isFirst?: boolean;
}

const StatCard = memo(function StatCard({ stat, isFirst }: StatCardProps) {
  const TrendIcon = 
    stat.trend === 'up' ? ArrowUpRight :
    stat.trend === 'down' ? ArrowDownRight :
    Minus;

  const trendClass =
    stat.trend === 'up'
      ? styles.statTrendUp
      : stat.trend === 'down'
      ? styles.statTrendDown
      : styles.statTrendNeutral;

  return (
    <li 
      className={styles.statCard}
      aria-label={`${stat.label}: ${stat.value}, ${stat.context}`}
    >
      <div className={styles.statHeader}>
        <div className={styles.statValue}>{stat.value}</div>
        <div 
          className={`${styles.statTrend} ${trendClass}`}
          aria-label={`Trend: ${stat.trend === 'up' ? 'in aumento' : stat.trend === 'down' ? 'in diminuzione' : 'neutrale'}`}
        >
          <TrendIcon className={styles.statTrendIcon} aria-hidden="true" />
        </div>
      </div>
      <div className={styles.statLabel}>{stat.label}</div>
      <div className={styles.statContext}>{stat.context}</div>
      {stat.action && (
        <Link 
          href={stat.action.href}
          className={cn(styles.statAction, 'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2')}
          aria-label={stat.action.label}
          tabIndex={isFirst ? 0 : undefined}
          prefetch={true}
        >
          {stat.action.label}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="14"
            height="14"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      )}
    </li>
  );
});
