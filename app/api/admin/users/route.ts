/**
 * Admin API - Users Management
 * Gestisce utenti su Supabase
 * 
 * GET /api/admin/users - Lista tutti gli utenti
 * POST /api/admin/users - Crea nuovo utente
 * GET /api/admin/users/[id] - Dettagli utente
 * PUT /api/admin/users/[id] - Aggiorna utente
 * DELETE /api/admin/users/[id] - Elimina utente
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - Lista tutti gli utenti
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Lista utenti da auth
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: limit,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      );
    }

    // Filtra per search se presente
    let filteredUsers = users || [];
    if (search) {
      filteredUsers = filteredUsers.filter(
        (u: { email?: string; user_metadata?: { full_name?: string } }) =>
          u.email?.toLowerCase().includes(search.toLowerCase()) ||
          u.user_metadata?.full_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Ottieni ruoli da user_roles
    const userIds = filteredUsers.map((u) => u.id);
    const { data: rolesData } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role, valid_until')
      .in('user_id', userIds);

    // Combina dati
    const usersWithRoles = filteredUsers.map((user) => {
      const userRole = rolesData?.find((r) => r.user_id === user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        role: userRole?.role || 'guest',
        role_valid_until: userRole?.valid_until || null,
        metadata: user.user_metadata,
      };
    });

    // Filtra per ruolo se specificato
    const finalUsers = role
      ? usersWithRoles.filter((u) => u.role === role)
      : usersWithRoles;

    return NextResponse.json({
      users: finalUsers,
      total: finalUsers.length,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Crea nuovo utente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, metadata } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Crea utente
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name || email.split('@')[0],
        ...metadata,
      },
    });

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    // Assegna ruolo se specificato
    if (role && userData.user) {
      await supabaseAdmin.from('user_roles').upsert({
        user_id: userData.user.id,
        role,
        valid_until: null,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.user.id,
        email: userData.user.email,
        name: userData.user.user_metadata?.full_name,
        role: role || 'guest',
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
