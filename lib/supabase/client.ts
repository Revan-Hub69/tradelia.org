import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;
let supabaseError: Error | null = null;

function getSupabaseClient(): SupabaseClient {
  // Se il client è già stato creato, riutilizzalo
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Se c'è già un errore, non riprovare
  if (supabaseError) {
    throw supabaseError;
  }

  // Supporta sia NEXT_PUBLIC_ che senza prefisso (per compatibilità)
  // Nota: lato client, NEXT_PUBLIC_ è necessario, ma usiamo il fallback per evitare errori durante il build
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)"
    );
    supabaseError = error;
    // In produzione, non lanciare errore fatale, ma logga e crea un client dummy
    if (typeof window !== "undefined") {
      console.error("Supabase configuration error:", error.message);
    }
    throw error;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    supabaseError = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to create Supabase client:", error);
    throw supabaseError;
  }

  return supabaseInstance;
}

// Mock client per quando Supabase non è configurato
const createMockClient = () =>
  ({
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: { message: "Supabase not configured" },
      }),
      getSession: async () => ({
        data: { session: null },
        error: { message: "Supabase not configured" },
      }),
      signInWithPassword: async () => ({
        data: null,
        error: { message: "Supabase not configured" },
      }),
      signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signOut: async () => ({ error: { message: "Supabase not configured" } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ data: [], error: { message: "Supabase not configured" } }),
      insert: () => ({ data: null, error: { message: "Supabase not configured" } }),
      update: () => ({ data: null, error: { message: "Supabase not configured" } }),
      delete: () => ({ data: null, error: { message: "Supabase not configured" } }),
    }),
  }) as unknown as SupabaseClient;

// Esporta un getter che crea il client quando necessario
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    try {
      return getSupabaseClient()[prop as keyof SupabaseClient];
    } catch (error) {
      // In produzione, non crashare l'app ma logga l'errore e restituisci un mock
      if (typeof window !== "undefined") {
        console.error("Supabase client error:", error);
        // Restituisci un mock client per evitare crash
        const mockClient = createMockClient();
        return mockClient[prop as keyof SupabaseClient];
      }
      // Durante SSR, lancia l'errore normalmente
      throw error;
    }
  },
});
