'use client';

import { useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';

interface LessonProgress {
  id: string;
  title: string;
  order_index: number;
  is_completed: boolean;
  completed_at: string | null;
  time_spent_minutes: number;
}

interface CourseProgressData {
  course_id: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  started_at: string | null;
  completed_at: string | null;
  lessons: LessonProgress[];
}

interface CourseProgressProps {
  data: CourseProgressData;
}

/**
 * Course Progress Component
 * Grafici dettagliati, timeline, statistiche progresso corso
 * Riferimento: Data Visualization Best Practices, Educational Analytics
 */
export function CourseProgress({ data }: CourseProgressProps) {
  const { t } = useTranslations();

  // Calcola statistiche
  const stats = useMemo(() => {
    const totalTime = data.lessons.reduce((acc, lesson) => acc + (lesson.time_spent_minutes || 0), 0);
    const avgTimePerLesson = data.completed_lessons > 0 
      ? Math.round(totalTime / data.completed_lessons) 
      : 0;
    
    const completionRate = data.total_lessons > 0
      ? Math.round((data.completed_lessons / data.total_lessons) * 100)
      : 0;

    // Timeline: giorni dal start
    const daysSinceStart = data.started_at
      ? Math.floor((Date.now() - new Date(data.started_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Lessons completate per settimana
    const lessonsByWeek = data.lessons
      .filter((l) => l.is_completed && l.completed_at)
      .reduce((acc, lesson) => {
        if (!lesson.completed_at) return acc;
        const week = Math.floor(
          (Date.now() - new Date(lesson.completed_at).getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        acc[week] = (acc[week] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    return {
      totalTime,
      avgTimePerLesson,
      completionRate,
      daysSinceStart,
      lessonsByWeek,
    };
  }, [data]);

  // Timeline completamento
  const timelineData = useMemo(() => {
    return data.lessons
      .filter((l) => l.is_completed && l.completed_at)
      .map((lesson) => ({
        date: new Date(lesson.completed_at!),
        lesson: lesson.title,
        order: lesson.order_index,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data.lessons]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">{t('courses.progress.completion') || 'Completamento'}</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.progress}%</p>
          <p className="text-xs text-text-tertiary mt-1">
            {data.completed_lessons} / {data.total_lessons} {t('courses.progress.lessons') || 'lezioni'}
          </p>
        </div>

        <div className="bg-bg-soft border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{t('courses.progress.totalTime') || 'Tempo Totale'}</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {t('courses.progress.avgPerLesson') || 'Media'}: {stats.avgTimePerLesson} {t('courses.progress.minutes') || 'min'}
          </p>
        </div>

        <div className="bg-bg-soft border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">{t('courses.progress.rate') || 'Velocità'}</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {stats.daysSinceStart > 0 
              ? Math.round(data.completed_lessons / stats.daysSinceStart * 7)
              : 0}
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {t('courses.progress.lessonsPerWeek') || 'lezioni/settimana'}
          </p>
        </div>

        <div className="bg-bg-soft border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{t('courses.progress.started') || 'Iniziato'}</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {data.started_at 
              ? new Date(data.started_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
              : '—'}
          </p>
          {data.completed_at && (
            <p className="text-xs text-text-tertiary mt-1">
              {t('courses.progress.completed') || 'Completato'}: {new Date(data.completed_at).toLocaleDateString('it-IT')}
            </p>
          )}
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          {t('courses.progress.progressChart') || 'Grafico Progresso'}
        </h3>
        <div className="space-y-3">
          {data.lessons.map((lesson, index) => {
            const isCompleted = lesson.is_completed;
            const progress = ((index + 1) / data.total_lessons) * 100;
            
            return (
              <div key={lesson.id} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 text-xs text-text-tertiary text-right">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${isCompleted ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {lesson.title}
                    </span>
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="w-full h-2 bg-bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-400 to-green-500'
                          : 'bg-border-subtle'
                      }`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                </div>
                {isCompleted && lesson.completed_at && (
                  <div className="flex-shrink-0 text-xs text-text-tertiary">
                    {new Date(lesson.completed_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      {timelineData.length > 0 && (
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            {t('courses.progress.timeline') || 'Timeline Completamento'}
          </h3>
          <div className="space-y-4">
            {timelineData.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-accent mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{item.lesson}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {item.date.toLocaleDateString('it-IT', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

