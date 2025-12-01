import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getModules } from '@/lib/supabase/server-services';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Modules are public (visible to all, including guests)
    // Non richiediamo autenticazione per i moduli

    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority') as 'primary' | 'secondary' | null;

    try {
      const { data, error } = await getModules(priority || undefined);

      if (error) {
        // Se c'è un errore (es. tabella non esiste), restituisci array vuoto
        console.error('Error getting modules (table might not exist):', error);
        return NextResponse.json({ data: [] });
      }

      return NextResponse.json({ data: data || [] });
    } catch (dbError) {
      // Se c'è un errore del database (tabella mancante), restituisci array vuoto
      console.error('Database error in modules GET (table might not exist):', dbError);
      return NextResponse.json({ data: [] });
    }
  } catch (error) {
    console.error('Error in modules API:', error);
    // Restituisci array vuoto invece di errore 500
    return NextResponse.json({ data: [] });
  }
}

