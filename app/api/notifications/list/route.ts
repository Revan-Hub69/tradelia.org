import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Endpoint per leggere le notifiche dell'utente
 * GET /api/notifications/list?limit=20&offset=0&unreadOnly=false
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Prova prima con getSession (più veloce e affidabile per verificare la sessione)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      // Se non c'è sessione, prova con getUser come fallback
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
      }
      
      // Usa user da getUser se disponibile
      const userId = user.id;
      
      const searchParams = request.nextUrl.searchParams;
      const limit = parseInt(searchParams.get('limit') || '20', 10);
      const offset = parseInt(searchParams.get('offset') || '0', 10);
      const unreadOnly = searchParams.get('unreadOnly') === 'true';

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Errore lettura notifiche:', error);
        return NextResponse.json({ error: 'Errore lettura notifiche' }, { status: 500 });
      }

      // Conta notifiche non lette
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      return NextResponse.json({
        notifications: data || [],
        unreadCount: unreadCount || 0,
        hasMore: (data?.length || 0) === limit,
      });
    }
    
    const userId = session.user.id;

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Errore lettura notifiche:', error);
      return NextResponse.json({ error: 'Errore lettura notifiche' }, { status: 500 });
    }

    // Conta notifiche non lette
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return NextResponse.json({
      notifications: data || [],
      unreadCount: unreadCount || 0,
      hasMore: (data?.length || 0) === limit,
    });
  } catch (error) {
    console.error('Errore GET notifications/list:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

