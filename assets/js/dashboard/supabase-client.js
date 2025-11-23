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
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      storageKey: 'tradelia-user-session',
    },
  });

  return supabaseClient;

  // Import dinamico da CDN
  import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
    .then((module) => {
      const { createClient } = module;
      
      // Config da variabili ambiente o config file
      const SUPABASE_URL = 
        window.SUPABASE_URL || 
        'https://higkhlfjfhlecbtfnznx.supabase.co';
      
      const SUPABASE_ANON_KEY = 
        window.SUPABASE_ANON_KEY || 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';
      
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    })
    .catch((err) => {
      console.error('[Supabase] Errore inizializzazione:', err);
    });

  // Fallback: crea client sincrono se già disponibile
  if (window.supabase && window.supabase.createClient) {
    const SUPABASE_URL = window.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
    const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
}

/**
 * Initialize Supabase client (async)
 */
export async function initSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    
    const SUPABASE_URL = window.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
    const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';
    
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
  } catch (err) {
    console.error('[Supabase] Errore inizializzazione:', err);
    return null;
  }
}

