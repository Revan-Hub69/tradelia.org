'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Award, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Button } from '@/components/ui/button';
import { authenticatedFetch } from '@/lib/api/fetch-client';
import { toast } from '@/components/ui/Toast';

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  order_index: number;
  points: number;
  explanation: string | null;
  options?: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
    explanation: string | null;
  }>;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  question_count: number;
  passing_score: number;
  max_attempts: number;
  allow_retry: boolean;
  show_immediate_feedback: boolean;
  questions: QuizQuestion[];
}

interface QuizSystemProps {
  quizId: string;
  lessonId: string;
  courseSlug: string;
  onComplete?: (score: number, passed: boolean) => void;
}

/**
 * Quiz System Component
 * Sistema quiz interattivo con feedback immediato, retry, scoring
 * Riferimento: Bloom Taxonomy, Educational Assessment Best Practices
 */
export function QuizSystem({ quizId, lessonId, courseSlug, onComplete }: QuizSystemProps) {
  const { t } = useTranslations();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [canRetry, setCanRetry] = useState(true);

  // Carica quiz
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await authenticatedFetch(`/api/courses/${courseSlug}/lessons/${lessonId}/quizzes/${quizId}`);
        if (!response.ok) {
          throw new Error('Errore nel caricamento quiz');
        }
        const data = await response.json();
        setQuiz(data);
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast.error(t('quiz.loadError') || 'Errore nel caricamento del quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, lessonId, courseSlug, t]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Calcola score
    let correct = 0;
    const total = quiz.questions.length;

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
        const correctOption = question.options?.find((opt) => opt.is_correct);
        if (correctOption && userAnswer === correctOption.id) {
          correct++;
        }
      }
      // TODO: Handle short_answer (potrebbe richiedere valutazione manuale)
    });

    const calculatedScore = Math.round((correct / total) * 100);
    const isPassed = calculatedScore >= quiz.passing_score;

    setScore(calculatedScore);
    setPassed(isPassed);
    setSubmitted(true);
    setShowFeedback(quiz.show_immediate_feedback);

    // Salva tentativo
    try {
      const response = await authenticatedFetch(`/api/courses/${courseSlug}/lessons/${lessonId}/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          score: calculatedScore,
          passed: isPassed,
          attempt_number: attemptNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nel salvataggio');
      }

      const data = await response.json();
      setCanRetry(data.can_retry && quiz.allow_retry && attemptNumber < quiz.max_attempts);

      if (onComplete) {
        onComplete(calculatedScore, isPassed);
      }

      if (isPassed) {
        toast.success(t('quiz.passed') || `Quiz superato! Punteggio: ${calculatedScore}%`);
      } else {
        toast.error(t('quiz.failed') || `Quiz non superato. Punteggio: ${calculatedScore}%`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(t('quiz.submitError') || 'Errore durante l\'invio del quiz');
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setPassed(false);
    setShowFeedback(false);
    setAttemptNumber((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
        <div className="text-center text-text-secondary">
          {t('quiz.loading') || 'Caricamento quiz...'}
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
        <div className="text-center text-text-secondary">
          {t('quiz.notFound') || 'Quiz non trovato'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">{quiz.title}</h3>
        {quiz.description && (
          <p className="text-text-secondary text-sm">{quiz.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-xs text-text-secondary">
          <span>{quiz.question_count} {t('quiz.questions') || 'domande'}</span>
          <span>{t('quiz.passingScore') || 'Punteggio minimo'}: {quiz.passing_score}%</span>
          {quiz.max_attempts > 1 && (
            <span>{t('quiz.attempt') || 'Tentativo'}: {attemptNumber} / {quiz.max_attempts}</span>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question, index) => {
          const userAnswer = answers[question.id];
          const correctOption = question.options?.find((opt) => opt.is_correct);
          const isCorrect = correctOption && userAnswer === correctOption.id;
          const showAnswer = submitted && showFeedback;

          return (
            <div
              key={question.id}
              className="bg-bg-surface border border-border-subtle rounded-lg p-4"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-blue-400 font-semibold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-text-primary mb-3">{question.question_text}</p>
                  {showAnswer && (
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect
                          ? (t('quiz.correct') || 'Corretto')
                          : (t('quiz.incorrect') || 'Non corretto')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              {question.question_type === 'multiple_choice' && question.options && (
                <div className="space-y-2 ml-11">
                  {question.options.map((option) => {
                    const isSelected = userAnswer === option.id;
                    const showCorrect = showAnswer && option.is_correct;
                    const showIncorrect = showAnswer && isSelected && !option.is_correct;

                    return (
                      <label
                        key={option.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          showCorrect
                            ? 'bg-green-400/10 border-green-400/40'
                            : showIncorrect
                            ? 'bg-red-400/10 border-red-400/40'
                            : isSelected
                            ? 'bg-accent/10 border-accent/40'
                            : 'bg-bg-soft border-border-subtle hover:border-accent/20'
                        } ${submitted ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(question.id, option.id)}
                          disabled={submitted}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <span className="text-text-primary">{option.option_text}</span>
                          {showAnswer && option.explanation && (
                            <p className="text-xs text-text-secondary mt-1">{option.explanation}</p>
                          )}
                        </div>
                        {showCorrect && <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />}
                        {showIncorrect && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              {showAnswer && question.explanation && (
                <div className="mt-3 ml-11 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm text-text-secondary">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
        {submitted ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {passed ? (
                <Award className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-semibold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {score}% {passed ? (t('quiz.passed') || 'Superato') : (t('quiz.failed') || 'Non superato')}
              </span>
            </div>
            {canRetry && (
              <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                {t('quiz.retry') || 'Riprova'}
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < quiz.questions.length}
            className="flex items-center gap-2"
          >
            {t('quiz.submit') || 'Invia Quiz'}
          </Button>
        )}
      </div>
    </div>
  );
}

