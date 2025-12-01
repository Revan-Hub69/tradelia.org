import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/courses/[slug]/materials/[materialId]/download
 * Download materiale corso
 */
export async function GET(
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

    // Recupera materiale (assumiamo tabella course_materials)
    const { data: material, error: materialError } = await supabase
      .from('course_materials')
      .select('id, title, url, type')
      .eq('id', params.materialId)
      .eq('course_id', params.slug) // Assumiamo che slug = course_id o usare join
      .maybeSingle();

    if (materialError || !material) {
      return NextResponse.json({ error: 'Materiale non trovato' }, { status: 404 });
    }

    // Fetch file from URL (può essere Supabase Storage o URL esterno)
    const fileResponse = await fetch(material.url);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'Errore nel recupero del file' }, { status: 500 });
    }

    const blob = await fileResponse.blob();
    const buffer = await blob.arrayBuffer();

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': blob.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${material.title}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/courses/[slug]/materials/[materialId]/download:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

