import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest } from 'next/server';

/**
 * Create Supabase client for API routes
 * Reads cookies directly from the request instead of using next/headers
 * This ensures cookies are properly passed from client-side fetch calls
 */
export function createApiClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)'
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // In API routes, we can't set cookies in the response directly
          // The middleware handles cookie synchronization
        },
        remove(name: string, options: CookieOptions) {
          // In API routes, we can't remove cookies in the response directly
          // The middleware handles cookie synchronization
        },
      },
    }
  );
}
