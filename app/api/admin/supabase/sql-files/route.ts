import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/supabase/admin';
import { readdir } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/admin/supabase/sql-files
 * Lista tutti i file SQL disponibili nella directory supabase/
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      // Restituisci array vuoto invece di 401 per guest access
      return NextResponse.json({ files: [] });
    }

    const admin = await isAdminEmail(user.email);
    if (!admin) {
      // Restituisci array vuoto invece di 403 per non-admin
      return NextResponse.json({ files: [] });
    }

    try {
      // Leggi i file SQL dalla directory supabase/
      const supabaseDir = join(process.cwd(), 'supabase');
      const files = await readdir(supabaseDir);
      const sqlFiles = files
        .filter((file) => file.endsWith('.sql'))
        .sort();

      return NextResponse.json({ files: sqlFiles });
    } catch (error) {
      // Se la directory non esiste o c'è un errore, restituisci array vuoto
      console.warn('Error reading SQL files directory:', error);
      return NextResponse.json({ files: [] });
    }
  } catch (error) {
    console.error('Error in sql-files API:', error);
    return NextResponse.json({ files: [] });
  }
}

