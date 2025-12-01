/**
 * Supabase Admin Client
 * Server-side only - Uses service role key for admin operations
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Get Supabase admin client
 * Creates client lazily to avoid build-time errors
 * Returns null if Supabase is not configured (graceful degradation)
 */
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Non lanciare errore - permette all'app di funzionare senza Supabase
    console.warn("Supabase admin not configured - missing URL or SERVICE_ROLE_KEY");
    return null;
  }

  try {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    console.error("Failed to create Supabase admin client:", error);
    return null;
  }
}

/**
 * Admin Supabase client with service role key
 * This bypasses RLS and should only be used server-side
 * Access via getSupabaseAdmin() to ensure env vars are available
 * Returns a safe proxy that handles missing configuration gracefully
 */
export const supabaseAdmin = new Proxy({} as any, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    if (!client) {
      // Return safe fallback methods that return empty results
      if (prop === "from") {
        return () => ({
          select: () => ({ data: [], error: null }),
          insert: () => ({ data: null, error: { message: "Supabase not configured" } }),
          update: () => ({ data: null, error: { message: "Supabase not configured" } }),
          delete: () => ({ data: null, error: { message: "Supabase not configured" } }),
        });
      }
      if (prop === "auth") {
        return {
          admin: {
            listUsers: () => Promise.resolve({ data: { users: [] }, error: null }),
            createUser: () =>
              Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          },
        };
      }
      if (prop === "rpc") {
        return () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } });
      }
      return () => ({ data: null, error: { message: "Supabase not configured" } });
    }
    return client[prop as keyof typeof client];
  },
});

/**
 * Check if email is admin
 * Returns false if Supabase is not configured (graceful degradation)
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_emails")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned (not an error)
      // Altri errori (tabella non esiste, Supabase non configurato) → return false
      if (
        error.code === "42P01" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("not configured")
      ) {
        console.warn("Admin emails table not available or Supabase not configured");
        return false;
      }
      console.error("Error checking admin email:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    // Se Supabase non è configurato o c'è un errore, restituisci false
    console.warn("Error in isAdminEmail (Supabase may not be configured):", error);
    return false;
  }
}

/**
 * Get admin user by email
 */
export async function getAdminUser(email: string) {
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error) {
    return null;
  }

  return data;
}
