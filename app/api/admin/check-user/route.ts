/**
 * Admin API - Check User
 * Verifica se un utente esiste e il suo stato
 * 
 * POST /api/admin/check-user
 * Body: { email: "email@example.com" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Cerca utente
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json(
        { error: `Error listing users: ${listError.message}` },
        { status: 500 }
      );
    }

    const user = users?.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({
        exists: false,
        email,
        message: 'User not found',
      });
    }

    // Ottieni ruolo
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role, valid_until')
      .eq('user_id', user.id)
      .single()
      .catch(() => ({ data: null }));

    // Verifica se email è confermata
    const emailConfirmed = !!user.email_confirmed_at;

    return NextResponse.json({
      exists: true,
      email: user.email,
      user_id: user.id,
      email_confirmed: emailConfirmed,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      role: roleData?.role || 'guest',
      role_valid_until: roleData?.valid_until || null,
      metadata: user.user_metadata,
      // Nota: Non possiamo vedere la password, ma possiamo verificare se l'utente può fare login
      can_login: emailConfirmed,
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
