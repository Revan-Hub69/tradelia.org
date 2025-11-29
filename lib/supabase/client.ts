import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  // Se il client è già stato creato, riutilizzalo
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Supporta sia NEXT_PUBLIC_ che senza prefisso (per compatibilità)
  // Nota: lato client, NEXT_PUBLIC_ è necessario, ma usiamo il fallback per evitare errori durante il build
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)'
    );
}

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    },
  });

  return supabaseInstance;
}

// Crea il client solo se le variabili d'ambiente sono disponibili
// Durante il build, se le variabili non ci sono, non creare il client
// Verrà creato a runtime quando necessario
// Supporta sia NEXT_PUBLIC_ che senza prefisso
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey) {
  // Variabili disponibili: crea il client immediatamente
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

// Esporta un getter che crea il client quando necessario
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});
