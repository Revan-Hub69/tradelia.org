/**
 * Admin API - Create Admin Users
 * Crea utenti admin con password specificata
 * 
 * POST /api/admin/create-admin-users
 * Body: { password: "password123" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Ottieni email admin dalla tabella admin_emails
    const { data: adminEmails, error: emailsError } = await supabaseAdmin
      .from('admin_emails')
      .select('email');

    if (emailsError) {
      return NextResponse.json(
        { error: `Error fetching admin emails: ${emailsError.message}` },
        { status: 500 }
      );
    }

    if (!adminEmails || adminEmails.length === 0) {
      return NextResponse.json(
        { error: 'No admin emails found in admin_emails table. Run migration 011_add_admin_users.sql first.' },
        { status: 400 }
      );
    }

    const results = [];

    for (const { email } of adminEmails) {
      try {
        // Verifica se utente esiste già
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users?.find((u: { email?: string }) => u.email === email);

        if (existingUser) {
          // Utente esiste, aggiorna password
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password }
          );

          if (updateError) {
            results.push({
              email,
              status: 'error',
              message: `Error updating password: ${updateError.message}`,
            });
          } else {
            // Assegna ruolo admin
            await supabaseAdmin.from('user_roles').upsert({
              user_id: existingUser.id,
              role: 'admin',
              valid_until: null,
            });

            results.push({
              email,
              status: 'updated',
              message: 'Password updated and admin role assigned',
              user_id: existingUser.id,
            });
          }
        } else {
          // Crea nuovo utente
          const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Conferma email automaticamente
            user_metadata: {
              full_name: email.split('@')[0],
            },
            // Forza la conferma email anche se non è verificata
            app_metadata: {
              email_verified: true,
            },
          });

          if (createError) {
            results.push({
              email,
              status: 'error',
              message: `Error creating user: ${createError.message}`,
            });
          } else {
            // Assegna ruolo admin
            await supabaseAdmin.from('user_roles').upsert({
              user_id: userData.user.id,
              role: 'admin',
              valid_until: null,
            });

            results.push({
              email,
              status: 'created',
              message: 'User created and admin role assigned',
              user_id: userData.user.id,
            });
          }
        }
      } catch (error) {
        results.push({
          email,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Processed ${adminEmails.length} admin emails`,
    });
  } catch (error) {
    console.error('Error creating admin users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Lista email admin configurate
export async function GET() {
  try {
    const { data: adminEmails, error } = await supabaseAdmin
      .from('admin_emails')
      .select('email, created_at');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Verifica quali email hanno utenti creati
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const emailStatusPromises = adminEmails?.map(async (ae: { email: string; created_at: string }) => {
      const user = users?.find((u: { email?: string; id?: string }) => u.email === ae.email);
      let roleData = null;
      
      if (user?.id) {
        const { data } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()
          .catch(() => ({ data: null }));
        roleData = data;
      }

      return {
        email: ae.email,
        has_user: !!user,
        user_id: user?.id || null,
        role: roleData?.role || null,
        created_at: ae.created_at,
      };
    }) || [];
    
    const emailStatus = await Promise.all(emailStatusPromises);

    return NextResponse.json({
      admin_emails: emailStatus,
    });
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
