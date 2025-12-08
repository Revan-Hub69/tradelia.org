'use client';

import { useState } from 'react';
import { Clock, Filter, FileText, BookOpen, TrendingUp } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { VirtualizedList } from '@/components/dashboard/VirtualizedList';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  type: 'report_viewed' | 'course_started' | 'course_completed' | 'analysis_requested';
  title: string;
  description: string;
  created_at: string;
  href: string;
}

/**
 * Activity Page
 * Visualizza tutte le attività dell'utente
 * BASE: Visualizzazione completa attività
 */
export default function ActivityPage() {
  const { t, locale } = useTranslations();
  const [filter, setFilter] = useState<string>('all');
  const [limit] = useState(100);

  const { data: activitiesData, loading, error, retry } = useApi<Activity[]>(
    `/api/dashboard/activities?limit=${limit}&filter=${filter}`,
    {
      cacheTime: 1 * 60 * 1000, // 1 minute
    }
  );

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'report_viewed':
        return <FileText className="w-5 h-5" />;
      case 'course_started':
      case 'course_completed':
        return <BookOpen className="w-5 h-5" />;
      case 'analysis_requested':
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getActivityTypeLabel = (type: Activity['type']) => {
    switch (type) {
      case 'report_viewed':
        return t('dashboard.activity.types.reportViewed') || 'Report visualizzato';
      case 'analysis_requested':
        return t('dashboard.activity.types.analysisRequested') || 'Analisi richiesta';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: locale === 'it' ? itLocale : undefined,
      });
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState message={t('dashboard.activity.loading') || 'Caricamento attività...'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState
          title={t('dashboard.activity.errorTitle') || 'Errore'}
          message={t('dashboard.activity.errorMessage') || 'Impossibile caricare le attività'}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
          <Clock className="w-8 h-8 text-accent" />
          {t('dashboard.activity.title') || 'Attività'}
        </h1>
        <p className="text-text-secondary">
          {t('dashboard.activity.description') || 'Visualizza tutte le tue attività recenti'}
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-2">
        <Filter className="w-5 h-5 text-text-tertiary" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="all">{t('dashboard.activity.filterAll') || 'Tutte'}</option>
          <option value="report_viewed">{t('dashboard.activity.filterReports') || 'Report'}</option>
          <option value="analysis_requested">{t('dashboard.activity.filterAnalysis') || 'Analisi'}</option>
        </select>
      </div>

      {/* Activities List */}
      {!activitiesData || activitiesData.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-12 h-12" />}
          title={t('dashboard.activity.empty') || 'Nessuna attività'}
          description={t('dashboard.activity.emptyDesc') || 'Non ci sono attività da mostrare'}
        />
      ) : (
        <div className="bg-bg-soft border border-border-subtle rounded-xl overflow-hidden">
          {activitiesData.length > 20 ? (
            <VirtualizedList
              items={activitiesData}
              renderItem={(activity, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link
                    href={activity.href}
                    className="block p-4 border-b border-border-subtle last:border-b-0 hover:bg-bg-surface transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary">{activity.title}</h3>
                          <span className="px-2 py-0.5 bg-bg-surface border border-border-subtle rounded text-xs text-text-tertiary">
                            {getActivityTypeLabel(activity.type)}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{activity.description}</p>
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(activity.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
              itemHeight={100}
              className="max-h-[600px]"
              aria-label={t('dashboard.activity.title') || 'Lista attività'}
            />
          ) : (
            <div>
              {activitiesData.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={activity.href}
                    className="block p-4 border-b border-border-subtle last:border-b-0 hover:bg-bg-surface transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary">{activity.title}</h3>
                          <span className="px-2 py-0.5 bg-bg-surface border border-border-subtle rounded text-xs text-text-tertiary">
                            {getActivityTypeLabel(activity.type)}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{activity.description}</p>
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(activity.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

