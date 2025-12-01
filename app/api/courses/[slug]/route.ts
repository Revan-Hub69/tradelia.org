import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/courses/[slug]
 * Recupera dettagli corso completo con lessons e progress
 * Riferimento: Educational Best Practices, REST API Design
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Recupera corso per slug
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, slug, title, description, total_lessons, created_at')
      .eq('slug', params.slug)
      .maybeSingle();

    if (courseError) {
      console.error('Error fetching course:', courseError);
      return NextResponse.json({ error: courseError.message }, { status: 500 });
    }

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Recupera lessons del corso (da education_lessons tramite module_id)
    // Nota: Assumiamo che courses.id corrisponda a education_modules.id
    const { data: lessons, error: lessonsError } = await supabase
      .from('education_lessons')
      .select('id, title, content, content_type, order_index, estimated_minutes, is_active')
      .eq('module_id', course.id) // Assumiamo che course.id = module_id
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      // Non bloccare se lessons non disponibili
    }

    // Se utente autenticato, recupera progress
    let progress = 0;
    let completedLessons = 0;
    let lessonsWithProgress: any[] = lessons || [];

    if (user) {
      // Recupera progress modulo (course.id = module_id)
      const { data: moduleProgress } = await supabase
        .from('education_user_progress')
        .select('progress_percentage, status')
        .eq('user_id', user.id)
        .eq('module_id', course.id)
        .maybeSingle();

      if (moduleProgress) {
        progress = moduleProgress.progress_percentage || 0;
      }

      // Recupera lesson completate
      if (lessons && lessons.length > 0) {
        const { data: lessonProgress } = await supabase
          .from('education_user_lesson_progress')
          .select('lesson_id, completed_at, status')
          .eq('user_id', user.id)
          .in('lesson_id', lessons.map((l) => l.id));

        // Conta completate
        completedLessons = lessonProgress?.filter((lp) => lp.status === 'completed').length || 0;

        // Merge progress con lessons
        lessonsWithProgress = lessons.map((lesson) => {
          const lessonProg = lessonProgress?.find((lp) => lp.lesson_id === lesson.id);
          return {
            ...lesson,
            is_completed: lessonProg?.status === 'completed',
            completed_at: lessonProg?.completed_at || null,
          };
        });
      }
    }

    // Calcola estimated_hours (se non presente)
    const estimatedMinutes = lessons?.reduce((acc, l) => acc + (l.estimated_minutes || 15), 0) || 0;
    const estimatedHours = Math.ceil(estimatedMinutes / 60);

    return NextResponse.json({
      ...course,
      lessons: lessonsWithProgress,
      progress,
      completed_lessons: completedLessons,
      estimated_hours: estimatedHours,
      completion_badge_available: progress === 100, // Badge completamento disponibile se corso completato
    });
  } catch (error) {
    console.error('Error in GET /api/courses/[slug]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

