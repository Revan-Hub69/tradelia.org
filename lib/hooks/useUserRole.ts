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
          // First check if user is admin via admin_emails (bypass RLS check)
          // Then fetch role from user_roles
          const { data, error } = await supabase
            .from("user_roles")
            .select("role, valid_until")
            .eq("user_id", user.id)
            .maybeSingle();

          if (error) {
            // PGRST116 = no rows returned, which is expected for new users
            if (error.code === "PGRST116") {
              // No role found - use default
              if (mounted) {
                setRoleData({
                  role: "trial",
                  validUntil: null,
                  isLoading: false,
                });
              }
              return;
            }
            
            // For other errors (500, RLS, etc.), log in development and use default
            if (process.env.NODE_ENV === 'development') {
              console.warn("Error fetching user role:", error.code, error.message);
            }
            
            if (mounted) {
              setRoleData({
                role: "trial",
                validUntil: null,
                isLoading: false,
              });
            }
            return;
          }

          // Success - use data or default
          if (mounted) {
            setRoleData({
              role: (data?.role as UserRole) || "trial",
              validUntil: data?.valid_until || null,
              isLoading: false,
            });
          }
        } catch (dbError) {
          // Database error (500, network, etc.) - use default role
          if (process.env.NODE_ENV === 'development') {
            console.warn("Database error in useUserRole:", dbError);
          }
          
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
