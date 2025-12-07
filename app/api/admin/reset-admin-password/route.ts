/**
 * Admin API - Reset Admin Password
 * Reset password semplice per un utente admin
 * 
 * POST /api/admin/reset-admin-password
 * Body: { email: "email@example.com", password: "newpassword123" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Cerca utente
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json(
        { error: `Error: ${listError.message}` },
        { status: 500 }
      );
    }

    const user = users?.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Crea nuovo utente
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: email.split('@')[0],
        },
        app_metadata: {
          email_verified: true,
        },
      });

      if (createError) {
        return NextResponse.json(
          { error: `Error creating user: ${createError.message}` },
          { status: 400 }
        );
      }

      // Assegna ruolo admin
      await supabaseAdmin.from('user_roles').upsert({
        user_id: userData.user.id,
        role: 'admin',
        valid_until: null,
      });

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        email: userData.user.email,
        user_id: userData.user.id,
        password_set: true,
      });
    }

    // Aggiorna password esistente
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { 
        password,
        app_metadata: {
          email_verified: true,
        },
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: `Error updating password: ${updateError.message}` },
        { status: 400 }
      );
    }

    // Assicurati che abbia ruolo admin
    await supabaseAdmin.from('user_roles').upsert({
      user_id: user.id,
      role: 'admin',
      valid_until: null,
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      email: user.email,
      user_id: user.id,
      password_set: true,
    });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
