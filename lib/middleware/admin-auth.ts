/**
 * Admin Authentication Middleware
 * Verifica che l'utente sia admin
 */

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function isAdmin(): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Verifica se l'utente è autenticato
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { isAdmin: false, error: 'Not authenticated' };
    }

    // Verifica ruolo admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData) {
      return { isAdmin: false, error: 'No role found' };
    }

    if (roleData.role !== 'admin') {
      return { isAdmin: false, error: 'Not admin' };
    }

    return { isAdmin: true, userId: user.id };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { isAdmin: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
