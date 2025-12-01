import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE /api/courses/[slug]/lessons/[lessonId]/notes
 * Elimina note lezione
 */
export async function DELETE(
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

    // Elimina note (assumiamo tabella lesson_notes)
    const { error: deleteError } = await supabase
      .from('lesson_notes')
      .delete()
      .eq('user_id', user.id)
      .eq('lesson_id', params.lessonId);

    if (deleteError) {
      console.error('Error deleting notes:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/courses/[slug]/lessons/[lessonId]/notes:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
