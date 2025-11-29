import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  // Se il client è già stato creato, riutilizzalo
  if (supabaseInstance) {
    return supabaseInstance;
  }

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
