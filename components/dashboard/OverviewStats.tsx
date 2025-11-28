'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import styles from '../../app/dashboard/dashboard.module.css';

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
  // TODO: Caricare dati reali da API
  const stats = [
    {
      id: 'total-reports',
      value: 0,
      label: 'Report Totali',
      trend: 'neutral' as const,
      context: 'Ultimo aggiornamento: —',
      action: {
        label: 'Vedi tutti i report',
        href: '/dashboard#reports',
      },
    },
    {
      id: 'active-courses',
      value: 0,
      label: 'Corsi Attivi',
      trend: 'neutral' as const,
      context: 'Completati: 0/0',
      action: {
        label: 'Continua a studiare',
        href: '/dashboard#education',
      },
    },
    {
      id: 'pending-requests',
      value: 0,
      label: 'Richieste in Attesa',
      trend: 'neutral' as const,
      context: 'In attesa: 0',
      action: {
        label: 'Vedi richieste',
        href: '/dashboard#requests-history',
      },
    },
    {
      id: 'recent-activity',
      value: '—',
      label: 'Attività Recente',
      trend: 'neutral' as const,
      context: 'Nessuna attività recente',
      action: {
        label: 'Vedi tutte le attività',
        href: '/dashboard#activity',
      },
    },
  ];

  return (
    <div className={styles.overviewSection}>
      <h2 className={styles.sectionTitle}>Panoramica</h2>
      <div 
        className={styles.overviewStatsGrid}
        role="list"
        aria-label="Statistiche principali della dashboard"
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

  return (
    <div 
      className={styles.statCard}
      role="listitem"
      aria-label={`${stat.label}: ${stat.value}, ${stat.context}`}
    >
      <div className={styles.statHeader}>
        <div className={styles.statValue}>{stat.value}</div>
        <div 
          className={`${styles.statTrend} ${styles[`statTrend-${stat.trend}`]}`}
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
