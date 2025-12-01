import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/supabase/admin';

/**
 * GET /api/admin/social/config
 * Ottiene la configurazione dei social media
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      // Restituisci array vuoto invece di 401 per guest access
      return NextResponse.json({ configs: [] });
    }

    const admin = await isAdminEmail(user.email);
    if (!admin) {
      // Restituisci array vuoto invece di 403 per non-admin
      return NextResponse.json({ configs: [] });
    }

    try {
      // Query per ottenere le configurazioni social (se la tabella esiste)
      const { data, error } = await supabase
        .from('social_configs')
        .select('*');

      if (error) {
        // Se la tabella non esiste, restituisci configurazioni di default
        console.warn('Error fetching social configs (table might not exist):', error.message);
        return NextResponse.json({
          configs: [
            { platform: 'twitter', enabled: false, autoPostOnReport: false },
            { platform: 'linkedin', enabled: false, autoPostOnReport: false },
            { platform: 'reddit', enabled: false, autoPostOnReport: false },
            { platform: 'quora', enabled: false, autoPostOnReport: false },
          ],
        });
      }

      return NextResponse.json({ configs: data || [] });
    } catch (dbError) {
      // Se c'è un errore del database, restituisci configurazioni di default
      console.warn('Database error in social config GET (table might not exist):', dbError);
      return NextResponse.json({
        configs: [
          { platform: 'twitter', enabled: false, autoPostOnReport: false },
          { platform: 'linkedin', enabled: false, autoPostOnReport: false },
          { platform: 'reddit', enabled: false, autoPostOnReport: false },
          { platform: 'quora', enabled: false, autoPostOnReport: false },
        ],
      });
    }
  } catch (error) {
    console.error('Error in social config API:', error);
    return NextResponse.json({
      configs: [
        { platform: 'twitter', enabled: false, autoPostOnReport: false },
        { platform: 'linkedin', enabled: false, autoPostOnReport: false },
        { platform: 'reddit', enabled: false, autoPostOnReport: false },
        { platform: 'quora', enabled: false, autoPostOnReport: false },
      ],
    });
  }
}

