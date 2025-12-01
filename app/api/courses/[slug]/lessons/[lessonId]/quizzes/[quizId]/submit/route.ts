import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/courses/[slug]/lessons/[lessonId]/quizzes/[quizId]/submit
 * Salva tentativo quiz e calcola score
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; lessonId: string; quizId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { answers, score, passed, attempt_number } = await request.json();

    // Verifica quiz
    const { data: quiz } = await supabase
      .from('education_lesson_quizzes')
      .select('id, max_attempts, allow_retry')
      .eq('id', params.quizId)
      .single();

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Verifica tentativi precedenti
    const { data: previousAttempts } = await supabase
      .from('education_user_lesson_quiz_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_quiz_id', params.quizId);

    const attemptCount = (previousAttempts?.length || 0) + 1;
    const canRetry = quiz.allow_retry && attemptCount < (quiz.max_attempts || 3);

    // Salva tentativo
    const { error: attemptError } = await supabase
      .from('education_user_lesson_quiz_attempts')
      .insert({
        user_id: user.id,
        lesson_quiz_id: params.quizId,
        score,
        answers,
        completed_at: new Date().toISOString(),
      });

    if (attemptError) {
      console.error('Error saving quiz attempt:', attemptError);
      return NextResponse.json({ error: attemptError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      score,
      passed,
      attempt_number: attemptCount,
      can_retry: canRetry,
      max_attempts: quiz.max_attempts || 3,
    });
  } catch (error) {
    console.error('Error in POST /api/courses/[slug]/lessons/[lessonId]/quizzes/[quizId]/submit:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

