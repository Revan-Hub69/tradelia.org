'use client';

import { useState, useEffect, memo, useMemo } from 'react';
import { TrendingUp, BookOpen, CheckCircle2, Circle, Award, Target } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

interface CourseProgress {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  totalLessons: number;
  completedLessons: number;
  href: string;
  badge?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: string;
}

export const ProgressTracking = memo(function ProgressTracking() {
  const { t } = useTranslations();

  const { data: progressData, loading, error, retry } = useApi<{
    courses: any[];
    achievements: any[];
  }>('/api/dashboard/progress', {
    cacheTime: 2 * 60 * 1000, // 2 minutes
    onError: (err) => {
      toast.error('Errore nel caricamento del progresso', {
        action: {
          label: 'Riprova',
          onClick: retry,
        },
      });
    },
  });

  // Map courses (memoized)
  const courses = useMemo<CourseProgress[]>(() => {
    if (!progressData?.courses) return [];

    return progressData.courses.map((item: any) => {
      const course = item.courses || {};
      const progress = item.progress || 0;
      const totalLessons = course.total_lessons || 0;
      const completedLessons = item.completed_lessons || 0;

      return {
        id: item.id,
        title: course.title || 'Corso',
        description: course.description || '',
        progress: Math.round(progress),
        totalLessons,
        completedLessons,
        href: course.slug ? `/courses/${course.slug}` : '/dashboard/education',
        badge: progress > 0 && progress < 100 ? 'In Corso' : undefined,
      };
    });
  }, [progressData?.courses]);

  // Map achievements (memoized)
  const iconMap: Record<string, React.ReactNode> = useMemo(() => ({
    check: <CheckCircle2 className="w-5 h-5" />,
    book: <BookOpen className="w-5 h-5" />,
    award: <Award className="w-5 h-5" />,
  }), []);

  const achievements = useMemo<Achievement[]>(() => {
    if (!progressData?.achievements) return [];

    return progressData.achievements.map((item: any) => {
      const achievement = item.achievements || {};
      const iconType = achievement.icon_type || 'award';
      
      return {
        id: item.id,
        title: achievement.title || 'Achievement',
        description: achievement.description || '',
        icon: iconMap[iconType] || <Award className="w-5 h-5" />,
        unlocked: item.unlocked || false,
        unlockedAt: item.unlocked_at || undefined,
      };
    });
  }, [progressData?.achievements, iconMap]);

  const overallProgress = useMemo(() => {
    return courses.length > 0
      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
      : 0;
  }, [courses]);

  if (loading) {
    return (
      <section className="mb-8" aria-label={t('dashboard.progress.title') || 'Progresso'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.progress.title') || 'Il Tuo Progresso'}
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton variant="rectangular" height={24} width="40%" />
            <Skeleton variant="rectangular" height={100} />
            <Skeleton variant="rectangular" height={100} />
          </div>
          <div className="space-y-4">
            <Skeleton variant="rectangular" height={24} width="40%" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton variant="rectangular" height={120} />
              <Skeleton variant="rectangular" height={120} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8" aria-label={t('dashboard.progress.title') || 'Progresso'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.progress.title') || 'Il Tuo Progresso'}
          </h2>
        </div>
        <div className="p-6 bg-error/10 border border-error/30 rounded-xl">
          <p className="text-sm text-error mb-3">
            Errore nel caricamento del progresso
          </p>
          <button
            onClick={retry}
            className="px-4 py-2 rounded-lg bg-error/20 hover:bg-error/30 border border-error/40 text-error text-sm font-medium transition-colors"
          >
            Riprova
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8" aria-label={t('dashboard.progress.title') || 'Progresso'}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('dashboard.progress.title') || 'Il Tuo Progresso'}
        </h2>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Target className="w-4 h-4" />
          <span>{overallProgress}% {t('dashboard.progress.complete') || 'completato'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses Progress */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {t('dashboard.progress.courses') || 'Corsi'}
          </h3>
          {courses.length === 0 ? (
            <div className="bg-bg-soft border border-border-subtle rounded-xl p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-text-tertiary opacity-50" />
              <p className="text-sm text-text-tertiary">
                {t('dashboard.progress.noCourses') || 'Nessun corso in corso'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={course.href}
                    className="block p-4 bg-bg-soft border border-border-subtle rounded-xl hover:border-accent/40 transition-all duration-200"
                    aria-label={`${course.title}: ${course.progress}% completato`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-text-primary text-sm truncate">
                            {course.title}
                          </h4>
                          {course.badge && (
                            <span className="px-2 py-0.5 bg-accent/20 border border-accent/40 rounded text-xs text-accent font-medium">
                              {course.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-1">{course.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-tertiary">
                          {Math.round(course.completedLessons)} / {course.totalLessons} {t('dashboard.progress.lessons') || 'lezioni'}
                        </span>
                        <span className="font-semibold text-text-primary">{course.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-bg-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Award className="w-4 h-4" />
            {t('dashboard.progress.achievements') || 'Achievement'}
          </h3>
          {achievements.length === 0 ? (
            <div className="bg-bg-soft border border-border-subtle rounded-xl p-8 text-center">
              <Award className="w-12 h-12 mx-auto mb-3 text-text-tertiary opacity-50" />
              <p className="text-sm text-text-tertiary">
                {t('dashboard.progress.noAchievements') || 'Nessun achievement sbloccato'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'p-4 rounded-xl border transition-all duration-200',
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/30'
                      : 'bg-bg-soft border-border-subtle opacity-60'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                    achievement.unlocked
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-bg-surface text-text-tertiary'
                  )}>
                    {achievement.icon}
                  </div>
                  <h4 className={cn(
                    'font-semibold text-sm mb-1',
                    achievement.unlocked ? 'text-text-primary' : 'text-text-tertiary'
                  )}>
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {achievement.description}
                  </p>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-text-tertiary mt-2">
                      {t('dashboard.progress.unlocked') || 'Sbloccato'}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

