/**
 * Hook to manage global authentication state
 * Integrates with Supabase auth state changes
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { resetAuthState } from "@/lib/api/fetch-client";
import type { User } from "@supabase/supabase-js";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

/**
 * Hook to get current authentication state
 * Listens to Supabase auth state changes
 */
export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    let mounted = true;

    // Track previous auth state to detect changes
    let previousAuthState = false;

    // Check initial auth state
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (mounted) {
          const wasAuthenticated = previousAuthState;
          const isAuthenticated = !!user && !error;
          previousAuthState = isAuthenticated;

          setState({
            isAuthenticated,
            isLoading: false,
            user: user || null,
          });

          // Reset auth state in fetch client only if user just authenticated
          // (not on initial load if already authenticated)
          if (isAuthenticated && !wasAuthenticated) {
            resetAuthState();
          }
        }
      } catch {
        if (mounted) {
          previousAuthState = false;
          setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      }
    };

    checkAuth();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return;
      }

      const isAuthenticated = !!session?.user;

      setState({
        isAuthenticated,
        isLoading: false,
        user: session?.user || null,
      });

      // Reset auth state when user logs in
      if (event === "SIGNED_IN" && isAuthenticated) {
        resetAuthState();
      }

      // Clear auth state when user logs out
      if (event === "SIGNED_OUT") {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    });

    // Listen to custom unauthorized event
    const handleUnauthorized = () => {
      if (mounted) {
        setState((prev) => ({
          ...prev,
          isAuthenticated: false,
        }));
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  return state;
}

/**
 * Simple hook that returns only authentication status
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthState();
  return isAuthenticated;
}
