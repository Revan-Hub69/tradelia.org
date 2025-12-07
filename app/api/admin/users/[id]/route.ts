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

// PUT - Aggiorna utente
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
    const { email, password, name, role, role_valid_until, metadata } = body;

    const updates: any = {};

    if (email) updates.email = email;
    if (password) updates.password = password;
    if (name || metadata) {
      updates.user_metadata = {
        ...metadata,
        full_name: name || undefined,
      };
    }

    // Aggiorna utente
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        updates
      );

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }
    }

    // Aggiorna ruolo se specificato
    if (role !== undefined) {
      if (role) {
        await supabaseAdmin.from('user_roles').upsert({
          user_id: userId,
          role,
          valid_until: role_valid_until || null,
        });
      } else {
        // Rimuovi ruolo
        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
      }
    }

    // Ottieni utente aggiornato
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role, valid_until')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.user_metadata?.full_name,
        role: roleData?.role || 'guest',
        role_valid_until: roleData?.valid_until || null,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina utente
export async function DELETE(
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

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
