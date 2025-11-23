/**
 * Supabase Client for Dashboard
 * FASE 5: Integrazioni Backend
 * Singleton pattern per client Supabase
 * BEST PRACTICE: Usa import ES module invece di CDN per evitare CSP violations
 */

import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

/**
 * Get or create Supabase client
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Lazy load Supabase (bundle da Vite)
  if (typeof window === 'undefined') {
    return null;
  }

  // Usa createClient da @supabase/supabase-js (bundle da Vite)
  // Vite sostituirà import.meta.env durante il build
  // Usiamo valori hardcoded come fallback per evitare problemi con Rollup
  const SUPABASE_URL = 'https://higkhlfjfhlecbtfnznx.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      storageKey: 'tradelia-user-session',
    },
  });

  return supabaseClient;
}

/**
 * Initialize Supabase client (async)
 * BEST PRACTICE: Usa getSupabaseClient() che ora è sincrono grazie a import statico
 */
export async function initSupabase() {
  return getSupabaseClient();
}

