import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/courses/[slug]/lessons/[lessonId]/complete
 * Segna lezione come completata e aggiorna progress
 * Riferimento: Educational Best Practices, Progress Tracking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; lessonId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { time_spent_minutes } = await request.json().catch(() => ({}));

    // Verifica che lesson esista
    const { data: lesson } = await supabase
      .from('education_lessons')
      .select('id, module_id')
      .eq('id', params.lessonId)
      .single();

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Aggiorna lesson progress
    const { error: progressError } = await supabase
      .from('education_user_lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: params.lessonId,
        status: 'completed',
        time_spent_minutes: time_spent_minutes || 0,
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,lesson_id',
      });

    if (progressError) {
      console.error('Error updating lesson progress:', progressError);
      return NextResponse.json({ error: progressError.message }, { status: 500 });
    }

    // Aggiorna module progress (calcola percentuale)
    // Usa education_user_progress per i moduli
    const { data: allLessons } = await supabase
      .from('education_lessons')
      .select('id')
      .eq('module_id', lesson.module_id)
      .eq('is_active', true);

    const { data: completedLessons } = await supabase
      .from('education_user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .in('lesson_id', allLessons?.map((l) => l.id) || []);

    const totalLessons = allLessons?.length || 0;
    const completedCount = completedLessons?.length || 0;
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Aggiorna module progress (education_user_progress)
    const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
    await supabase
      .from('education_user_progress')
      .upsert({
        user_id: user.id,
        module_id: lesson.module_id,
        status,
        progress_percentage: progress,
        updated_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        ...(progress === 100 && !completedAt ? { completed_at: new Date().toISOString() } : {}),
      }, {
        onConflict: 'user_id,module_id',
      });

    return NextResponse.json({
      success: true,
      progress,
      completed_lessons: completedCount,
      total_lessons: totalLessons,
      status,
    });
  } catch (error) {
    console.error('Error in POST /api/courses/[slug]/lessons/[lessonId]/complete:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

