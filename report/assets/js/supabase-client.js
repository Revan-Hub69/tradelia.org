// BEST PRACTICE: Usa CDN per compatibilità con Cloudflare e Vercel
// Nota: Questo file è usato in /report, non nella dashboard principale

export const SUPABASE_URL = 'https://higkhlfjfhlecbtfnznx.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';
export const REPORTS_BUCKET = 'report-charts';
export const AVATAR_BUCKET = 'profile-avatars';

let supabaseClient = null;
let supabaseModule = null;

/**
 * Get or create Supabase client
 */
async function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
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
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      storageKey: 'tradelia-user-session',
    },
  });

  return supabaseClient;
}

// Export lazy-loaded client
export const supabase = new Proxy({}, {
  get(target, prop) {
    return async (...args) => {
      const client = await getSupabaseClient();
      return client[prop](...args);
    };
  }
});

export async function getSignedChartUrl(path, { expiresIn = 3600 } = {}) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error || !data) {
    console.warn('[Supabase] createSignedUrl error', error);
    return null;
  }
  return data.signedUrl;
}
