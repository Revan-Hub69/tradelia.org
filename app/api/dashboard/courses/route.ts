import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/dashboard/courses
 * Lista tutti i corsi disponibili con progresso utente
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Ottieni corsi - gestisci errori gracefully
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, slug, title, description, total_lessons, created_at')
      .order('created_at', { ascending: false });

    // Se la tabella non esiste o c'è un errore, restituisci array vuoto
    if (coursesError) {
      // Log solo se non è un errore di tabella mancante
      if (!coursesError.message.includes('relation') && !coursesError.message.includes('does not exist')) {
        console.error('Error fetching courses:', coursesError);
      }
      return NextResponse.json([]);
    }

    // Se utente autenticato, ottieni progresso
    if (user) {
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('course_id, completed_lessons, progress')
        .eq('user_id', user.id);

      // Merge progresso con corsi
      const coursesWithProgress = (courses || []).map((course) => {
        const progress = progressData?.find((p) => p.course_id === course.id);
        return {
          ...course,
          progress: progress?.progress || 0,
          completed_lessons: progress?.completed_lessons || 0,
        };
      });

      return NextResponse.json(coursesWithProgress);
    }

    // Guest: solo corsi senza progresso
    return NextResponse.json(courses || []);
  } catch (error) {
    // In caso di errore, restituisci array vuoto invece di 500
    console.error('Error in GET /api/dashboard/courses:', error);
    return NextResponse.json([]);
  }
}

