import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/courses/[slug]/lessons/[lessonId]/quizzes/[quizId]
 * Recupera quiz completo con domande e opzioni
 * Riferimento: Educational Assessment Best Practices, Bloom Taxonomy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; lessonId: string; quizId: string } }
) {
  try {
    const supabase = await createClient();

    // Recupera quiz
    const { data: quiz, error: quizError } = await supabase
      .from('education_lesson_quizzes')
      .select('id, title, description, question_count, passing_score, max_attempts, allow_retry, show_immediate_feedback')
      .eq('id', params.quizId)
      .eq('lesson_id', params.lessonId)
      .eq('is_active', true)
      .maybeSingle();

    if (quizError) {
      console.error('Error fetching quiz:', quizError);
      return NextResponse.json({ error: quizError.message }, { status: 500 });
    }

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Recupera domande
    const { data: questions, error: questionsError } = await supabase
      .from('education_lesson_quiz_questions')
      .select('id, question_text, question_type, order_index, points, explanation, bloom_level')
      .eq('lesson_quiz_id', params.quizId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json({ error: questionsError.message }, { status: 500 });
    }

    // Recupera opzioni per ogni domanda
    const questionIds = questions?.map((q) => q.id) || [];
    const { data: options, error: optionsError } = await supabase
      .from('education_lesson_quiz_options')
      .select('id, question_id, option_text, is_correct, order_index, explanation')
      .in('question_id', questionIds)
      .order('order_index', { ascending: true });

    if (optionsError) {
      console.error('Error fetching options:', optionsError);
      // Non bloccare se opzioni non disponibili
    }

    // Merge opzioni con domande
    const questionsWithOptions = questions?.map((question) => ({
      ...question,
      options: options?.filter((opt) => opt.question_id === question.id) || [],
    }));

    // Calcola passing_score se non presente (default 70%)
    const passingScore = quiz.passing_score || 70;
    const maxAttempts = quiz.max_attempts || 3;

    return NextResponse.json({
      ...quiz,
      passing_score: passingScore,
      max_attempts: maxAttempts,
      questions: questionsWithOptions || [],
    });
  } catch (error) {
    console.error('Error in GET /api/courses/[slug]/lessons/[lessonId]/quizzes/[quizId]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

