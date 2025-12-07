/**
 * Admin API - Single User Management
 * Gestisce un singolo utente (SOLO LETTURA per sicurezza)
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
      .select('role, valid_until, plan_source, created_at, updated_at')
      .eq('user_id', userId)
      .single();

    // Ottieni stats
    const { data: statsData } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Ottieni preferenze
    const { data: preferencesData } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Conta report
    const { count: reportsCount } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .catch(() => ({ count: 0 }));

    // Conta watchlist
    const { count: watchlistCount } = await supabaseAdmin
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .catch(() => ({ count: 0 }));

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      phone: user.phone,
      role: roleData?.role || 'guest',
      role_valid_until: roleData?.valid_until || null,
      plan_source: roleData?.plan_source || null,
      stats: statsData,
      preferences: preferencesData,
      counts: {
        reports: reportsCount || 0,
        watchlist: watchlistCount || 0,
      },
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

// PUT - Aggiorna ruolo utente (SOLO RUOLO, non password/email per sicurezza)
export async function PUT(
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
    const body = await request.json();
    const { role, role_valid_until, plan_source } = body;

    // Permetti solo modifica ruolo, non password/email (troppo pericoloso)
    if (role !== undefined) {
      if (role && ['guest', 'trial', 'pro', 'desk', 'admin'].includes(role)) {
        await supabaseAdmin.from('user_roles').upsert({
          user_id: userId,
          role,
          valid_until: role_valid_until || null,
          plan_source: plan_source || null,
        });
      } else {
        // Rimuovi ruolo se non valido
        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
      }
    }

    // Ottieni utente aggiornato
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role, valid_until, plan_source')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        role: roleData?.role || 'guest',
        role_valid_until: roleData?.valid_until || null,
        plan_source: roleData?.plan_source || null,
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
