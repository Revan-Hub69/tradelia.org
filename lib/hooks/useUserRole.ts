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
        } = await supabase.auth.getUser();

        if (!user || !mounted) {
          setRoleData({ role: null, validUntil: null, isLoading: false });
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role, valid_until")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          // PGRST116 = no rows returned, which is fine
          // PGRST301 = relation does not exist or permission denied (RLS)
          // PGRST301 = permission denied (RLS)
          if (error.code === "PGRST116") {
            // No role found, use default - this is expected for new users
          } else if (
            error.code === "PGRST301" ||
            error.message?.includes("relation") || 
            error.message?.includes("does not exist") ||
            error.message?.includes("permission denied") ||
            error.message?.includes("new row violates row-level security") ||
            error.message?.includes("500") ||
            error.message?.includes("Internal Server Error")
          ) {
            // Table doesn't exist, RLS issue, or server error - use default role silently
            // Don't log as error to avoid console noise - this is expected in some cases
            if (process.env.NODE_ENV === 'development') {
              console.warn("user_roles query failed, using default role:", error.message || error.code);
            }
          } else {
            // Other errors - log only in development
            if (process.env.NODE_ENV === 'development') {
              console.error("Error fetching user role:", error);
            }
          }
        }

        if (mounted) {
          setRoleData({
            role: (data?.role as UserRole) || "trial",
            validUntil: data?.valid_until || null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error in useUserRole:", error);
        if (mounted) {
          setRoleData({ role: null, validUntil: null, isLoading: false });
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
