"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type UserRole = "trial" | "pro" | "institutional" | "desk" | "admin" | null;

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

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned, which is fine
          console.error("Error fetching user role:", error);
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

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return roleData;
}

export function useIsPro(): boolean {
  const { role } = useUserRole();
  return role === "pro" || role === "institutional" || role === "admin";
}
