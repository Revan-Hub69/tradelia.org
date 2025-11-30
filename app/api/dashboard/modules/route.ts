import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getModules } from '@/lib/supabase/server-services';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Modules are public (visible to all, including guests)
    // But we still check auth for user-specific badge counts if needed

    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority') as 'primary' | 'secondary' | null;

    const { data, error } = await getModules(priority || undefined);

    if (error) {
      return NextResponse.json(
        { error: 'Errore nel caricamento dei moduli' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in modules API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

