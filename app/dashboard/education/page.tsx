'use client';

import { useState } from 'react';
import { BookOpen, Search, Filter, Play, CheckCircle2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/i18n/paths';

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  total_lessons: number;
  created_at: string;
  progress?: number;
  completed_lessons?: number;
}

/**
 * Education Page
 * Lista tutti i corsi disponibili
 * BASE: Visualizzazione e accesso corsi base
 */
export default function EducationPage() {
  const { t, locale } = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed' | 'not-started'>('all');

  const { data: coursesData, loading, error, retry } = useApi<Course[]>(
    '/api/dashboard/courses',
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const filteredCourses = coursesData?.filter((course) => {
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'in-progress' && course.progress && course.progress > 0 && course.progress < 100) ||
      (filter === 'completed' && course.progress === 100) ||
      (filter === 'not-started' && (!course.progress || course.progress === 0));

    return matchesSearch && matchesFilter;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState message={t('dashboard.education.loading') || 'Caricamento corsi...'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState
          title={t('dashboard.education.errorTitle') || 'Errore'}
          message={t('dashboard.education.errorMessage') || 'Impossibile caricare i corsi'}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-accent" />
          {t('dashboard.education.title') || 'Educazione'}
        </h1>
        <p className="text-text-secondary">
          {t('dashboard.education.description') || 'Esplora i corsi disponibili e continua il tuo percorso formativo'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('dashboard.education.search') || 'Cerca corsi...'}
            className="w-full pl-10 pr-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-text-tertiary" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="all">{t('dashboard.education.filterAll') || 'Tutti'}</option>
            <option value="in-progress">{t('dashboard.education.filterInProgress') || 'In Corso'}</option>
            <option value="completed">{t('dashboard.education.filterCompleted') || 'Completati'}</option>
            <option value="not-started">{t('dashboard.education.filterNotStarted') || 'Non Iniziati'}</option>
          </select>
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title={t('dashboard.education.empty') || 'Nessun corso trovato'}
          description={t('dashboard.education.emptyDesc') || 'Non ci sono corsi disponibili al momento'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-bg-soft border border-border-subtle rounded-xl p-6 hover:border-accent/40 transition-all duration-200"
            >
              <div className="mb-4">
                <h3 className="font-semibold text-text-primary mb-2">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                    {course.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  <BookOpen className="w-3 h-3" />
                  <span>{course.total_lessons} {t('dashboard.education.lessons') || 'lezioni'}</span>
                </div>
              </div>

              {course.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-text-secondary">
                      {course.completed_lessons || 0} / {course.total_lessons} {t('dashboard.education.completed') || 'completate'}
                    </span>
                    <span className="font-semibold text-text-primary">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <Link
                href={course.slug ? `/courses/${course.slug}` : '#'}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium"
              >
                {course.progress === 100 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {t('dashboard.education.review') || 'Rivedi'}
                  </>
                ) : course.progress && course.progress > 0 ? (
                  <>
                    <Play className="w-4 h-4" />
                    {t('dashboard.education.continue') || 'Continua'}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {t('dashboard.education.start') || 'Inizia'}
                  </>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

