import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/supabase/admin';

/**
 * GET /api/admin/social/posts
 * Lista tutti i post social
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      // Restituisci array vuoto invece di 401 per guest access
      return NextResponse.json({ posts: [] });
    }

    const admin = await isAdminEmail(user.email);
    if (!admin) {
      // Restituisci array vuoto invece di 403 per non-admin
      return NextResponse.json({ posts: [] });
    }

    try {
      // Query per ottenere i post social (se la tabella esiste)
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Se la tabella non esiste, restituisci array vuoto
        console.warn('Error fetching social posts (table might not exist):', error.message);
        return NextResponse.json({ posts: [] });
      }

      return NextResponse.json({ posts: data || [] });
    } catch (dbError) {
      // Se c'è un errore del database, restituisci array vuoto
      console.warn('Database error in social posts GET (table might not exist):', dbError);
      return NextResponse.json({ posts: [] });
    }
  } catch (error) {
    console.error('Error in social posts API:', error);
    return NextResponse.json({ posts: [] });
  }
}

