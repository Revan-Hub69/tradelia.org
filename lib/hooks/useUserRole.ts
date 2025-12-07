"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type UserRole = "trial" | "pro" | "desk" | "admin" | null;

interface UserRoleData {
  role: UserRole;
  validUntil: string | null;
  isLoading: boolean;
}

export function useUserRole(): UserRoleData {
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: null,
    validUntil: null,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchUserRole() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user || !mounted) {
          if (mounted) {
            setRoleData({ role: null, validUntil: null, isLoading: false });
          }
          return;
        }

        try {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role, valid_until")
            .eq("user_id", user.id)
            .maybeSingle();

          if (error) {
            // PGRST116 = no rows returned, which is fine
            // Any other error (RLS, 500, etc.) - use default role silently
            // Don't throw or log - just use default role
          }

          if (mounted) {
            setRoleData({
              role: (data?.role as UserRole) || "trial",
              validUntil: data?.valid_until || null,
              isLoading: false,
            });
          }
        } catch (dbError) {
          // Database error (500, RLS, etc.) - use default role
          if (mounted) {
            setRoleData({
              role: "trial",
              validUntil: null,
              isLoading: false,
            });
          }
        }
      } catch (error) {
        // Auth error or other - use default
        if (mounted) {
          setRoleData({ role: "trial", validUntil: null, isLoading: false });
        }
      }
    }

    fetchUserRole();

    // Ascolta cambiamenti di autenticazione
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    // Polling manuale per verificare cambiamenti ruolo (utile per pagamenti manuali)
    // Poll ogni 60 secondi se l'utente è ancora sulla pagina
    const pollInterval = setInterval(() => {
      if (mounted && document.visibilityState === "visible") {
        fetchUserRole();
      }
    }, 60000); // 60 secondi

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  return roleData;
}

export function useIsPro(): boolean {
  const { role } = useUserRole();
  return role === "pro" || role === "desk" || role === "admin";
}

export function useIsDesk(): boolean {
  const { role } = useUserRole();
  return role === "desk" || role === "admin";
}
