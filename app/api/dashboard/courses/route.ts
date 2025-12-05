import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLocaleFromRequest } from '@/lib/i18n/api-messages';
import { localizeContentArray } from '@/lib/i18n/dynamic-content';

/**
 * GET /api/dashboard/courses
 * Lista tutti i corsi disponibili con progresso utente
 * Best Practice: Supports multilingual content and locale detection
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Detect locale from request
    const locale = getLocaleFromRequest(request);

    // Ottieni corsi - gestisci errori gracefully
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, slug, title, title_it, title_en, description, description_it, description_en, total_lessons, created_at')
      .order('created_at', { ascending: false });

    // Se la tabella non esiste o c'è un errore, restituisci array vuoto
    if (coursesError) {
      // Log solo se non è un errore di tabella mancante
      if (!coursesError.message.includes('relation') && !coursesError.message.includes('does not exist')) {
        console.error('Error fetching courses:', coursesError);
      }
      return NextResponse.json([]);
    }

    // Localize course content
    const localizedCourses = localizeContentArray(courses || [], locale);

    // Se utente autenticato, ottieni progresso
    if (user) {
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('course_id, completed_lessons, progress')
        .eq('user_id', user.id);

      // Merge progresso con corsi localizzati
      const coursesWithProgress = localizedCourses.map((course) => {
        const progress = progressData?.find((p) => p.course_id === course.id);
        return {
          ...course,
          progress: progress?.progress || 0,
          completed_lessons: progress?.completed_lessons || 0,
        };
      });

      return NextResponse.json(coursesWithProgress);
    }

    // Guest: solo corsi localizzati senza progresso
    return NextResponse.json(localizedCourses);
  } catch (error) {
    // In caso di errore, restituisci array vuoto invece di 500
    console.error('Error in GET /api/dashboard/courses:', error);
    return NextResponse.json([]);
  }
}

