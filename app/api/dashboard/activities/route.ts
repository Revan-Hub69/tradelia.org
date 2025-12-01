import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserActivities } from '@/lib/supabase/server-services';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Permetti accesso guest - restituisci array vuoto invece di 401
    if (authError || !user) {
      return NextResponse.json({ data: [] });
    }

    try {
      const { searchParams } = new URL(request.url);
      const limit = Number(searchParams.get('limit') ?? 10);
      const filter = searchParams.get('filter') || undefined;

      const { data, error } = await getUserActivities(user.id, limit, filter);

      if (error) {
        // Se c'è un errore (es. tabella non esiste), restituisci array vuoto
        console.error('Error getting activities (might be missing table):', error);
        return NextResponse.json({ data: [] });
      }

      return NextResponse.json({ 
        data: data || [],
      });
    } catch (dbError) {
      // Se c'è un errore del database (tabella mancante), restituisci array vuoto
      console.error('Database error in activities GET (table might not exist):', dbError);
      return NextResponse.json({ data: [] });
    }
  } catch (error) {
    console.error('Error in activities API:', error);
    // Restituisci array vuoto invece di errore
    return NextResponse.json({ data: [] });
  }
}

