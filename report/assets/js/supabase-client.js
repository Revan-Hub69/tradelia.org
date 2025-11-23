// BEST PRACTICE: Usa CDN per compatibilità con Cloudflare e Vercel
// Nota: Questo file è usato in /report, non nella dashboard principale

// Carica Supabase da CDN (compatibile con Cloudflare e Vercel)
let createClient;
try {
  // Prova prima import ES module (se bundle da Vite)
  const supabaseModule = await import('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
} catch (e) {
  // Fallback a CDN (per Cloudflare o altri ambienti senza build)
  const supabaseModule = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  createClient = supabaseModule.createClient;
}

export const SUPABASE_URL = 'https://higkhlfjfhlecbtfnznx.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';
export const REPORTS_BUCKET = 'report-charts';
export const AVATAR_BUCKET = 'profile-avatars';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'tradelia-user-session',
  },
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
