/**
 * Admin API - Force Email Verification
 * Forza la verifica email per un utente (bypass Supabase email system)
 * 
 * POST /api/admin/verify-email
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
        { error: `Error: ${listError.message}` },
        { status: 500 }
      );
    }

    const user = users?.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Forza verifica email usando updateUserById
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
        app_metadata: {
          email_verified: true,
        },
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: `Error verifying email: ${updateError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: user.email,
      user_id: user.id,
      email_verified: true,
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
