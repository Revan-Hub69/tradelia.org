'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Play, CheckCircle2, FileText, Download, Award, Clock, BarChart3 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { Button } from '@/components/ui/button';
import { CourseProgress } from '@/components/courses/CourseProgress';
import { MaterialsDownload } from '@/components/courses/MaterialsDownload';
import { NotesSystem } from '@/components/courses/NotesSystem';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/i18n/paths';

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  content_type: string;
  order_index: number;
  estimated_minutes: number;
  is_completed?: boolean;
  completed_at?: string;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  total_lessons: number;
  estimated_hours: number;
  difficulty: string;
  created_at: string;
  lessons?: Lesson[];
  progress?: number;
  completed_lessons?: number;
  completion_badge_available?: boolean;
  materials?: Array<{
    id: string;
    title: string;
    type: string;
    url: string;
    size?: number;
  }>;
  notes?: Array<{
    id: string;
    lesson_id: string;
    lesson_title: string;
    notes: string;
    updated_at: string;
  }>;
  progress_data?: {
    started_at: string | null;
    completed_at: string | null;
  };
}

/**
 * Course Detail Page
 * Visualizza dettagli corso completo con lesson list, progress, materials
 * Riferimento: Educational Best Practices, Bloom Taxonomy, Spaced Repetition
 */
export default function CourseDetailPage() {
  const params = useParams();
  const { t, locale } = useTranslations();
  const slug = params.slug as string;

  const { data: course, loading, error, retry } = useApi<Course>(
    `/api/courses/${slug}`,
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState message={t('courses.detail.loading') || 'Caricamento corso...'} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState
          title={t('courses.detail.errorTitle') || 'Errore'}
          message={t('courses.detail.errorMessage') || 'Corso non trovato'}
          onRetry={retry}
        />
      </div>
    );
  }

  const nextLesson = course.lessons?.find((lesson) => !lesson.is_completed);
  const completedCount = course.lessons?.filter((l) => l.is_completed).length || 0;

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-accent" />
              {course.title}
            </h1>
            {course.description && (
              <p className="text-text-secondary text-lg mb-4">{course.description}</p>
            )}
          </div>
          {course.progress === 100 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-400/30 rounded-lg">
              <Award className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                {t('courses.detail.courseCompleted') || 'Corso Completato!'}
              </span>
            </div>
          )}
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm">{t('courses.detail.lessons') || 'Lezioni'}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{course.total_lessons}</p>
          </div>
          <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t('courses.detail.duration') || 'Durata'}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {course.estimated_hours || Math.ceil((course.total_lessons * 15) / 60)}h
            </p>
          </div>
          <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">{t('courses.detail.progress') || 'Progresso'}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{course.progress || 0}%</p>
          </div>
          <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">{t('courses.detail.completed') || 'Completate'}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {completedCount} / {course.total_lessons}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {course.progress !== undefined && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-text-secondary">
                {t('courses.detail.progressLabel') || 'Progresso corso'}
              </span>
              <span className="font-semibold text-text-primary">{course.progress}%</span>
            </div>
            <div className="w-full h-3 bg-bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Lessons List */}
        <div className="lg:col-span-2">
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-accent" />
              {t('courses.detail.lessonsTitle') || 'Lezioni'}
            </h2>

            {course.lessons && course.lessons.length > 0 ? (
              <div className="space-y-3">
                {course.lessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    href={buildLocalePath(locale, `/courses/${course.slug}/lessons/${lesson.id}`)}
                    className="block bg-bg-surface border border-border-subtle rounded-lg p-4 hover:border-accent/40 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-text-primary">{lesson.title}</h3>
                            {lesson.is_completed && (
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-text-tertiary">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.estimated_minutes || 15} {t('courses.detail.minutes') || 'min'}
                            </span>
                            {lesson.content_type && (
                              <span className="px-2 py-0.5 bg-bg-soft rounded text-text-secondary">
                                {lesson.content_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {lesson.is_completed && (
                        <div className="flex-shrink-0 ml-4">
                          <span className="text-xs text-green-400 font-medium">
                            {t('courses.detail.completed') || 'Completata'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                {t('courses.detail.noLessons') || 'Nessuna lezione disponibile'}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('courses.detail.quickActions') || 'Azioni Rapide'}
            </h3>
            <div className="space-y-3">
              {nextLesson ? (
                <Link
                  href={buildLocalePath(locale, `/courses/${course.slug}/lessons/${nextLesson.id}`)}
                  className="w-full"
                >
                  <Button variant="default" className="w-full flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    {t('courses.detail.continueLesson') || 'Continua Lezione'}
                  </Button>
                </Link>
              ) : course.progress === 100 ? (
                <div className="w-full px-4 py-3 bg-green-400/10 border border-green-400/30 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Award className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {t('courses.detail.courseCompleted') || 'Corso Completato!'}
                    </span>
                  </div>
                </div>
              ) : (
                course.lessons && course.lessons.length > 0 && (
                  <Link
                    href={buildLocalePath(locale, `/courses/${course.slug}/lessons/${course.lessons[0].id}`)}
                    className="w-full"
                  >
                    <Button variant="default" className="w-full flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      {t('courses.detail.startCourse') || 'Inizia Corso'}
                    </Button>
                  </Link>
                )
              )}
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => {
                  // TODO: Open materials download
                }}
              >
                <Download className="w-4 h-4" />
                {t('courses.detail.downloadMaterials') || 'Scarica Materiali'}
              </Button>
            </div>
          </div>

          {/* Course Info */}
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('courses.detail.courseInfo') || 'Informazioni Corso'}
            </h3>
            <div className="space-y-3 text-sm">
              {course.difficulty && (
                <div>
                  <span className="text-text-secondary">{t('courses.detail.difficulty') || 'Difficoltà'}: </span>
                  <span className="text-text-primary font-medium">{course.difficulty}</span>
                </div>
              )}
              <div>
                <span className="text-text-secondary">{t('courses.detail.totalLessons') || 'Lezioni totali'}: </span>
                <span className="text-text-primary font-medium">{course.total_lessons}</span>
              </div>
              <div>
                <span className="text-text-secondary">{t('courses.detail.estimatedTime') || 'Tempo stimato'}: </span>
                <span className="text-text-primary font-medium">
                  {course.estimated_hours || Math.ceil((course.total_lessons * 15) / 60)} {t('courses.detail.hours') || 'ore'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

