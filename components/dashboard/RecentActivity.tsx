'use client';

import { useState, useEffect } from 'react';
import { Clock, FileText, BookOpen, TrendingUp, ArrowRight, Filter } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'report_viewed' | 'course_started' | 'course_completed' | 'analysis_requested';
  title: string;
  description: string;
  timestamp: string;
  href: string;
  icon: React.ReactNode;
}

export function RecentActivity() {
  const { t, locale } = useTranslations();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // TODO: Integrare con API reale
      // Per ora usiamo dati mock
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'report_viewed',
          title: 'Report Analisi Mercato',
          description: 'Hai visualizzato questo report',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          href: '/dashboard#reports',
          icon: <FileText className="w-4 h-4" />,
        },
        {
          id: '2',
          type: 'course_started',
          title: 'Corso Fondamenti Trading',
          description: 'Hai iniziato questo corso',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          href: '/dashboard#education',
          icon: <BookOpen className="w-4 h-4" />,
        },
        {
          id: '3',
          type: 'analysis_requested',
          title: 'Analisi Personalizzata',
          description: 'Hai richiesto un analisi',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          href: '/dashboard#requests-history',
          icon: <TrendingUp className="w-4 h-4" />,
        },
      ];

      const filtered = filter === 'all' 
        ? mockActivities 
        : mockActivities.filter(a => a.type === filter);
      
      setActivities(filtered);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeLabel = (type: Activity['type']) => {
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
      <section className="mb-8" aria-label={t('dashboard.activity.title') || 'Attività recenti'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.activity.title') || 'Attività Recenti'}
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-bg-soft rounded-xl animate-pulse" />
          ))}
        </div>
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
      {activities.length >= 3 && (
        <div className="mt-4 text-center">
          <Link
            href="/dashboard#activity"
            className="text-sm text-accent hover:text-accent-hover inline-flex items-center gap-1"
          >
            {t('dashboard.activity.viewAll') || 'Vedi tutte le attività'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

