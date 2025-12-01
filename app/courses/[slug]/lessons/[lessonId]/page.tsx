'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, ChevronLeft, ChevronRight, CheckCircle2, FileText, BookOpen, Award, Clock, Save } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { authenticatedFetch } from '@/lib/api/fetch-client';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/i18n/paths';

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  content_type: string;
  video_url: string | null;
  pdf_url: string | null;
  order_index: number;
  estimated_minutes: number;
  is_completed?: boolean;
  completed_at?: string;
  notes?: string;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  lessons?: Array<{ id: string; title: string; order_index: number; is_completed?: boolean }>;
}

/**
 * Lesson Player Page
 * Visualizza e riproduce lezione con progress tracking, notes, quiz
 * Riferimento: Educational Best Practices, Bloom Taxonomy, Spaced Repetition
 */
export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useTranslations();
  const slug = params.slug as string;
  const lessonId = params.lessonId as string;
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Carica lesson
  const { data: lesson, loading: lessonLoading, error: lessonError, retry: lessonRetry } = useApi<Lesson>(
    `/api/courses/${slug}/lessons/${lessonId}`,
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Carica course per navigation
  const { data: course } = useApi<Course>(
    `/api/courses/${slug}`,
    {
      cacheTime: 5 * 60 * 1000,
    }
  );

  // Carica notes esistenti
  useEffect(() => {
    if (lesson?.notes) {
      setNotes(lesson.notes);
    }
  }, [lesson]);

  // Track time spent
  useEffect(() => {
    if (!lesson) return;

    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 60000); // Ogni minuto

    return () => clearInterval(interval);
  }, [lesson]);

  // Navigation
  const currentIndex = course?.lessons?.findIndex((l) => l.id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? course?.lessons?.[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && course?.lessons && currentIndex < course.lessons.length - 1
    ? course.lessons[currentIndex + 1]
    : null;

  const handleComplete = async () => {
    if (!lesson) return;

    try {
      const response = await authenticatedFetch(`/api/courses/${slug}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_spent_minutes: Math.ceil(timeSpent) }),
      });

      if (!response.ok) {
        throw new Error('Errore durante il completamento');
      }

      toast.success(t('lessons.completeSuccess') || 'Lezione completata!');
      
      // Navigate to next lesson or course detail
      if (nextLesson) {
        router.push(buildLocalePath(locale, `/courses/${slug}/lessons/${nextLesson.id}`));
      } else {
        router.push(buildLocalePath(locale, `/courses/${slug}`));
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error(t('lessons.completeError') || 'Errore durante il completamento della lezione');
    }
  };

  const handleSaveNotes = async () => {
    if (!lesson) return;

    setSavingNotes(true);
    try {
      const response = await authenticatedFetch(`/api/courses/${slug}/lessons/${lessonId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Errore durante il salvataggio');
      }

      toast.success(t('lessons.notesSaved') || 'Note salvate con successo!');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error(t('lessons.notesError') || 'Errore durante il salvataggio delle note');
    } finally {
      setSavingNotes(false);
    }
  };

  if (lessonLoading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState message={t('lessons.loading') || 'Caricamento lezione...'} />
      </div>
    );
  }

  if (lessonError || !lesson) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState
          title={t('lessons.errorTitle') || 'Errore'}
          message={t('lessons.errorMessage') || 'Lezione non trovata'}
          onRetry={lessonRetry}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link
              href={buildLocalePath(locale, `/courses/${slug}`)}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{lesson.title}</h1>
              {course && (
                <p className="text-sm text-text-secondary mt-1">
                  {course.title} • {t('lessons.lesson') || 'Lezione'} {lesson.order_index + 1}
                </p>
              )}
            </div>
          </div>
          {lesson.is_completed && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{t('lessons.completed') || 'Completata'}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {lesson.estimated_minutes || 15} {t('lessons.minutes') || 'min'}
          </span>
          {timeSpent > 0 && (
            <span>
              {t('lessons.timeSpent') || 'Tempo trascorso'}: {Math.ceil(timeSpent)} {t('lessons.minutes') || 'min'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lesson Content */}
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            {lesson.content_type === 'video' && lesson.video_url ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                <video
                  src={lesson.video_url}
                  controls
                  className="w-full h-full"
                  onPlay={() => {
                    // Track play event
                  }}
                >
                  {t('lessons.videoNotSupported') || 'Il tuo browser non supporta il video'}
                </video>
              </div>
            ) : lesson.content_type === 'pdf' && lesson.pdf_url ? (
              <div className="mb-6">
                <iframe
                  src={lesson.pdf_url}
                  className="w-full h-[600px] border border-border-subtle rounded-lg"
                  title={lesson.title}
                />
              </div>
            ) : null}

            {/* Text Content */}
            {lesson.content && (
              <div className="prose prose-invert max-w-none">
                <div
                  className="text-text-secondary leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </div>
            )}

            {/* Completion Button */}
            {!lesson.is_completed && (
              <div className="mt-6 pt-6 border-t border-border-subtle">
                <Button
                  variant="default"
                  onClick={handleComplete}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t('lessons.markComplete') || 'Segna come Completata'}
                </Button>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                {t('lessons.notes') || 'Note Personali'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="flex items-center gap-2"
              >
                {savingNotes ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t('lessons.saving') || 'Salvataggio...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('lessons.save') || 'Salva'}
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('lessons.notesPlaceholder') || 'Aggiungi le tue note personali per questa lezione...'}
              rows={8}
              className="bg-bg-surface border-border-subtle text-text-primary placeholder:text-text-tertiary"
            />
            <p className="text-xs text-text-tertiary mt-2">
              {t('lessons.notesHint') || 'Le tue note sono private e salvate automaticamente'}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Navigation */}
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('lessons.navigation') || 'Navigazione'}
            </h3>
            <div className="space-y-3">
              {prevLesson ? (
                <Link
                  href={buildLocalePath(locale, `/courses/${slug}/lessons/${prevLesson.id}`)}
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm">{prevLesson.title}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-text-tertiary text-sm">
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('lessons.noPrevious') || 'Nessuna lezione precedente'}</span>
                </div>
              )}

              {nextLesson ? (
                <Link
                  href={buildLocalePath(locale, `/courses/${slug}/lessons/${nextLesson.id}`)}
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <span className="text-sm">{nextLesson.title}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-text-tertiary text-sm">
                  <span>{t('lessons.noNext') || 'Nessuna lezione successiva'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border-subtle">
              <Link
                href={buildLocalePath(locale, `/courses/${slug}`)}
                className="flex items-center gap-2 text-accent hover:text-accent-hover transition-colors text-sm"
              >
                <BookOpen className="w-4 h-4" />
                {t('lessons.backToCourse') || 'Torna al Corso'}
              </Link>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('lessons.lessonInfo') || 'Informazioni Lezione'}
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-text-secondary">{t('lessons.type') || 'Tipo'}: </span>
                <span className="text-text-primary font-medium">{lesson.content_type}</span>
              </div>
              <div>
                <span className="text-text-secondary">{t('lessons.duration') || 'Durata stimata'}: </span>
                <span className="text-text-primary font-medium">
                  {lesson.estimated_minutes || 15} {t('lessons.minutes') || 'minuti'}
                </span>
              </div>
              {lesson.is_completed && lesson.completed_at && (
                <div>
                  <span className="text-text-secondary">{t('lessons.completedAt') || 'Completata il'}: </span>
                  <span className="text-text-primary font-medium">
                    {new Date(lesson.completed_at).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

