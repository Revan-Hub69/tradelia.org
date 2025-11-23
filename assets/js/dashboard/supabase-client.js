/**
 * Supabase Client for Dashboard
 * FASE 5: Integrazioni Backend
 * Singleton pattern per client Supabase
 * BEST PRACTICE: Usa CDN per compatibilità con Cloudflare e Vercel
 */

let supabaseClient = null;
let supabaseModule = null;

/**
 * Get or create Supabase client
 */
export async function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Lazy load Supabase (bundle da Vite)
  if (typeof window === 'undefined') {
    return null;
  }

  // Carica Supabase da CDN (compatibile con Cloudflare e Vercel)
  if (!supabaseModule) {
    try {
      // Prova prima import ES module (se bundle da Vite)
      supabaseModule = await import('@supabase/supabase-js');
    } catch (e) {
      // Fallback a CDN (per Cloudflare o altri ambienti senza build)
      supabaseModule = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    }
  }

  const { createClient } = supabaseModule;
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
 */
export async function initSupabase() {
  return getSupabaseClient();
}

