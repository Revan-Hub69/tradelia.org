import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/courses/[slug]/lessons/[lessonId]
 * Recupera dettagli lezione con progress utente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; lessonId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Recupera lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('education_lessons')
      .select('id, title, content, content_type, video_url, pdf_url, order_index, estimated_minutes, is_active')
      .eq('id', params.lessonId)
      .eq('is_active', true)
      .maybeSingle();

    if (lessonError) {
      console.error('Error fetching lesson:', lessonError);
      return NextResponse.json({ error: lessonError.message }, { status: 500 });
    }

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Se utente autenticato, recupera progress e notes
    let isCompleted = false;
    let completedAt: string | null = null;
    let notes: string | null = null;

    if (user) {
      const { data: lessonProgress } = await supabase
        .from('education_user_lesson_progress')
        .select('status, completed_at')
        .eq('user_id', user.id)
        .eq('lesson_id', params.lessonId)
        .maybeSingle();

      if (lessonProgress) {
        isCompleted = lessonProgress.status === 'completed';
        completedAt = lessonProgress.completed_at || null;
      }

      // Recupera notes (da education_user_lesson_progress.notes se esiste, altrimenti da tabella dedicata)
      // Nota: Se notes non è in education_user_lesson_progress, creare tabella lesson_notes
      // Per ora usiamo un campo JSONB o una tabella separata
      const { data: lessonNotes } = await supabase
        .from('lesson_notes')
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', params.lessonId)
        .maybeSingle();

      if (lessonNotes) {
        notes = lessonNotes.notes;
      }
    }

    return NextResponse.json({
      ...lesson,
      is_completed: isCompleted,
      completed_at: completedAt,
      notes,
    });
  } catch (error) {
    console.error('Error in GET /api/courses/[slug]/lessons/[lessonId]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

