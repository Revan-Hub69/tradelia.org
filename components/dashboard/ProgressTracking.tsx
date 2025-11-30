'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, CheckCircle2, Circle, Award, Target } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

export function ProgressTracking() {
  const { t } = useTranslations();
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      // TODO: Integrare con API reale
      // Mock data per ora
      const mockCourses: CourseProgress[] = [
        {
          id: '1',
          title: 'Corso Fondamenti Trading',
          description: 'Introduzione ai concetti base',
          progress: 65,
          totalLessons: 10,
          completedLessons: 6.5,
          href: '/dashboard#education',
          badge: 'In Corso',
        },
        {
          id: '2',
          title: 'Analisi Tecnica Avanzata',
          description: 'Pattern e indicatori tecnici',
          progress: 30,
          totalLessons: 8,
          completedLessons: 2.4,
          href: '/dashboard#education',
        },
      ];

      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'Primo Passo',
          description: 'Completa la tua prima lezione',
          icon: <CheckCircle2 className="w-5 h-5" />,
          unlocked: true,
          unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'Studioso',
          description: 'Completa 5 lezioni',
          icon: <BookOpen className="w-5 h-5" />,
          unlocked: true,
          unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: 'Esperto',
          description: 'Completa un intero corso',
          icon: <Award className="w-5 h-5" />,
          unlocked: false,
        },
      ];

      setCourses(mockCourses);
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const overallProgress = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
    : 0;

  if (loading) {
    return (
      <section className="mb-8" aria-label={t('dashboard.progress.title') || 'Progresso'}>
        <div className="h-48 bg-bg-soft rounded-xl animate-pulse" />
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
            <div className="grid grid-cols-2 gap-3">
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
}

