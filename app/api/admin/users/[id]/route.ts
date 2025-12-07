/**
 * Admin API - Single User Management
 * Gestisce un singolo utente
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/middleware/admin-auth';

// GET - Dettagli utente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verifica autenticazione admin
  const adminCheck = await isAdmin();
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const userId = params.id;

    // Ottieni utente da auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Ottieni ruolo
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role, valid_until')
      .eq('user_id', userId)
      .single();

    // Ottieni stats
    const { data: statsData } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      role: roleData?.role || 'guest',
      role_valid_until: roleData?.valid_until || null,
      stats: statsData,
      metadata: user.user_metadata,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna utente (RIMOSSO - vulnerabilità di sicurezza)
// Le modifiche utenti devono essere fatte solo manualmente via Supabase Dashboard

// DELETE - Elimina utente (RIMOSSO - vulnerabilità di sicurezza)
// L'eliminazione utenti deve essere fatta solo manualmente via Supabase Dashboard
