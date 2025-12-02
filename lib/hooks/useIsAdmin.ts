"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/supabase/admin";

/**
 * Hook per verificare se l'utente corrente è admin
 * Controlla sia il ruolo che l'email nella tabella admin_emails
 */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !mounted) {
          setIsAdmin(false);
          return;
        }

        // Controlla ruolo admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        const isRoleAdmin = roleData?.role === "admin";

        // Controlla anche email nella tabella admin_emails (doppio controllo)
        const isEmailAdmin = user.email ? await isAdminEmail(user.email) : false;

        if (mounted) {
          setIsAdmin(isRoleAdmin || isEmailAdmin);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (mounted) {
          setIsAdmin(false);
        }
      }
    }

    checkAdmin();

    // Ascolta cambiamenti di autenticazione
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return isAdmin;
}
