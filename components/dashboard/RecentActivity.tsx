'use client';

import { useState, useEffect, memo, useMemo } from 'react';
import { Clock, FileText, BookOpen, TrendingUp, ArrowRight, Filter } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsClient } from '@/lib/hooks/useIsClient';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { SkeletonList } from '@/components/ui/Skeleton';
import { VirtualizedList } from './VirtualizedList';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

interface Activity {
  id: string;
  type: 'report_viewed' | 'course_started' | 'course_completed' | 'analysis_requested';
  title: string;
  description: string;
  timestamp: string;
  href: string;
  icon: React.ReactNode;
}

export const RecentActivity = memo(function RecentActivity() {
  const { t, locale } = useTranslations();
  const isClient = useIsClient();
  const [filter, setFilter] = useState<string>('all');

  interface ActivityData {
    id: string;
    type: 'report_viewed' | 'course_started' | 'course_completed' | 'analysis_requested';
    title: string;
    description: string | null;
    created_at: string;
  }

  const { data: activitiesData, loading, error, retry } = useApi<ActivityData[]>(
    `/api/dashboard/activities?limit=10&filter=${filter}`,
    {
      cacheTime: 1 * 60 * 1000, // 1 minute
      onError: (err) => {
        toast.error('Errore nel caricamento delle attività', {
          action: {
            label: 'Riprova',
            onClick: retry,
          },
        });
      },
    }
  );

  // Map Supabase data to Activity format (memoized)
  // IMPORTANTE: Non eseguire sul server per evitare hydration mismatch
  const activities = useMemo<Activity[]>(() => {
    if (!isClient || !activitiesData) return [];

    return activitiesData.map((item: ActivityData) => {
      let icon = <FileText className="w-4 h-4" />;
      let href = '/dashboard';

      switch (item.type) {
        case 'report_viewed':
          icon = <FileText className="w-4 h-4" />;
          href = `/dashboard/analysis`;
          break;
        case 'course_started':
        case 'course_completed':
          icon = <BookOpen className="w-4 h-4" />;
          href = `/dashboard/education`;
          break;
        case 'analysis_requested':
          icon = <TrendingUp className="w-4 h-4" />;
          href = `/dashboard/analysis`;
          break;
      }

      return {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description || '',
        timestamp: item.created_at,
        href,
        icon,
      };
    });
  }, [activitiesData, locale, isClient]);

  const getActivityTypeLabel = useMemo(() => {
    return (type: Activity['type']) => {
      switch (type) {
        case 'report_viewed':
          return t('dashboard.activity.types.reportViewed') || 'Report visualizzato';
        case 'course_started':
          return t('dashboard.activity.types.courseStarted') || 'Corso iniziato';
        case 'course_completed':
          return t('dashboard.activity.types.courseCompleted') || 'Corso completato';
        case 'analysis_requested':
          return t('dashboard.activity.types.analysisRequested') || 'Analisi richiesta';
      }
    };
  }, [t]);

  const formatTime = useMemo(() => {
    return (timestamp: string) => {
      try {
        return formatDistanceToNow(new Date(timestamp), {
          addSuffix: true,
          locale: locale === 'it' ? itLocale : undefined,
        });
      } catch {
        return timestamp;
      }
    };
  }, [locale]);

  if (loading) {
    return (
      <section className="mb-8" aria-label={t('dashboard.activity.title') || 'Attività recenti'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.activity.title') || 'Attività Recenti'}
          </h2>
        </div>
        <LoadingState message={t('dashboard.activity.loading') || 'Caricamento attività...'} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8" aria-label={t('dashboard.activity.title') || 'Attività recenti'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.activity.title') || 'Attività Recenti'}
          </h2>
        </div>
        <ErrorState
          title={t('dashboard.activity.errorTitle') || 'Errore nel caricamento'}
          message={t('dashboard.activity.errorMessage') || 'Impossibile caricare le attività. Riprova più tardi.'}
          onRetry={retry}
        />
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section className="mb-8" aria-label={t('dashboard.activity.title') || 'Attività recenti'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.activity.title') || 'Attività Recenti'}
          </h2>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-text-tertiary opacity-50" />
          <p className="text-sm text-text-tertiary">
            {t('dashboard.activity.empty') || 'Nessuna attività recente'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8" aria-label={t('dashboard.activity.title') || 'Attività recenti'}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('dashboard.activity.title') || 'Attività Recenti'}
        </h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-tertiary" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-bg-soft border border-border-subtle rounded-lg px-2 py-1 text-text-secondary focus:outline-none focus:border-accent"
            aria-label={t('dashboard.activity.filterLabel') || 'Filtra attività per tipo'}
          >
            <option value="all">{t('dashboard.activity.filterAll') || 'Tutte'}</option>
            <option value="report_viewed">{t('dashboard.activity.filterReports') || 'Report'}</option>
            <option value="course_started">{t('dashboard.activity.filterCourses') || 'Corsi'}</option>
            <option value="analysis_requested">{t('dashboard.activity.filterAnalysis') || 'Analisi'}</option>
          </select>
        </div>
      </div>
      {activities.length > 10 ? (
        <VirtualizedList
          items={activities}
          renderItem={(activity, index) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={activity.href}
                className="block p-4 bg-bg-soft border border-border-subtle rounded-xl hover:border-accent/40 transition-all duration-200 group"
                aria-label={`${activity.title} - ${activity.description}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary text-sm">{activity.title}</h3>
                      <span className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-xs text-text-tertiary">
                        {getActivityTypeLabel(activity.type)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mb-2">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(activity.timestamp)}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            </motion.div>
          )}
          itemHeight={80}
          className="max-h-96"
          aria-label={t('dashboard.activity.title') || 'Lista attività recenti'}
        />
      ) : (
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={activity.href}
                className="block p-4 bg-bg-soft border border-border-subtle rounded-xl hover:border-accent/40 transition-all duration-200 group"
                aria-label={`${activity.title} - ${activity.description}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary text-sm">{activity.title}</h3>
                      <span className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-xs text-text-tertiary">
                        {getActivityTypeLabel(activity.type)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mb-2">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(activity.timestamp)}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
      {activities.length >= 3 && (
        <div className="mt-4 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-accent hover:text-accent-hover inline-flex items-center gap-1"
          >
            {t('dashboard.activity.viewAll') || 'Vedi tutte le attività'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
});

