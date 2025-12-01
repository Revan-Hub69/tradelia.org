import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/courses/[slug]/materials/[materialId]/track
 * Traccia download materiale
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; materialId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Salva download tracking (assumiamo tabella material_downloads)
    const { error: trackError } = await supabase
      .from('material_downloads')
      .insert({
        user_id: user.id,
        material_id: params.materialId,
        downloaded_at: new Date().toISOString(),
      });

    if (trackError) {
      console.error('Error tracking download:', trackError);
      // Non bloccare se tracking fallisce
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/courses/[slug]/materials/[materialId]/track:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

