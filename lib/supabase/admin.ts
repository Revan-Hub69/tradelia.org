/**
 * Supabase Admin Client
 * Server-side only - Uses service role key for admin operations
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Get Supabase admin client
 * Creates client lazily to avoid build-time errors
 */
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY - Required for admin operations');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Admin Supabase client with service role key
 * This bypasses RLS and should only be used server-side
 * Access via getSupabaseAdmin() to ensure env vars are available
 */
export const supabaseAdmin = new Proxy({} as ReturnType<typeof getSupabaseAdmin>, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof ReturnType<typeof getSupabaseAdmin>];
  },
});

/**
 * Check if email is admin
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('admin_emails')
    .select('email')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error checking admin email:', error);
    return false;
  }

  return !!data;
}

/**
 * Get admin user by email
 */
export async function getAdminUser(email: string) {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    return null;
  }

  return data;
}
