'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import styles from './dashboard.module.css';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';

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
  const stats = [
    {
      id: 'total-reports',
      value: t('dashboard.overview.stats.totalReports.value', '0'),
      label: t('dashboard.overview.stats.totalReports.label'),
      trend: 'neutral' as const,
      context: t('dashboard.overview.stats.totalReports.context'),
      action: {
        label: t('dashboard.overview.stats.totalReports.action'),
        href: buildLocalePath(locale, '/dashboard#reports'),
      },
    },
    {
      id: 'active-courses',
      value: t('dashboard.overview.stats.activeCourses.value', '0'),
      label: t('dashboard.overview.stats.activeCourses.label'),
      trend: 'neutral' as const,
      context: t('dashboard.overview.stats.activeCourses.context'),
      action: {
        label: t('dashboard.overview.stats.activeCourses.action'),
        href: buildLocalePath(locale, '/dashboard#education'),
      },
    },
    {
      id: 'pending-requests',
      value: t('dashboard.overview.stats.pendingRequests.value', '0'),
      label: t('dashboard.overview.stats.pendingRequests.label'),
      trend: 'neutral' as const,
      context: t('dashboard.overview.stats.pendingRequests.context'),
      action: {
        label: t('dashboard.overview.stats.pendingRequests.action'),
        href: buildLocalePath(locale, '/dashboard#requests-history'),
      },
    },
    {
      id: 'recent-activity',
      value: t('dashboard.overview.stats.recentActivity.value', '—'),
      label: t('dashboard.overview.stats.recentActivity.label'),
      trend: 'neutral' as const,
      context: t('dashboard.overview.stats.recentActivity.context'),
      action: {
        label: t('dashboard.overview.stats.recentActivity.action'),
        href: buildLocalePath(locale, '/dashboard#activity'),
      },
    },
  ];

  return (
    <div className={styles.overviewSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionEyebrow}>{t('dashboard.overview.eyebrow')}</span>
        <div>
          <h2 className={styles.sectionTitle}>{t('dashboard.overview.title')}</h2>
          <p className={styles.sectionDescription}>{t('dashboard.overview.description')}</p>
        </div>
      </div>
      <div 
        className={styles.overviewStatsGrid}
        role="list"
        aria-label={t('dashboard.overview.ariaLabel')}
      >
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </div>
  );
}

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
}

function StatCard({ stat }: StatCardProps) {
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
    <div 
      className={styles.statCard}
      role="listitem"
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
          className={styles.statAction}
          aria-label={stat.action.label}
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
    </div>
  );
}
