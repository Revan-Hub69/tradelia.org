"use client";

import { useMemo } from "react";
import { useUserRole } from "./useUserRole";
import {
  hasAccess,
  getAvailableFeatures,
  getRequiredAccessLevel,
  type AccessLevel,
} from "@/lib/features/access-control";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

/**
 * Hook per verificare accesso a funzionalità
 */
export function useFeatureAccess(feature: string): {
  hasAccess: boolean;
  requiredLevel: AccessLevel | null;
  isLoading: boolean;
} {
  const { role, isLoading: roleLoading } = useUserRole();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkEmailVerification() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsEmailVerified(user?.email_confirmed_at !== null);
      } catch {
        setIsEmailVerified(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (!roleLoading) {
      checkEmailVerification();
    }
  }, [roleLoading]);

  const access = useMemo(() => {
    if (isLoading || roleLoading) {
      return {
        hasAccess: false,
        requiredLevel: null,
        isLoading: true,
      };
    }

    const requiredLevel = getRequiredAccessLevel(feature);
    const canAccess = hasAccess(role, isEmailVerified, feature);

    return {
      hasAccess: canAccess,
      requiredLevel,
      isLoading: false,
    };
  }, [feature, role, isEmailVerified, isLoading, roleLoading]);

  return access;
}

/**
 * Hook per ottenere tutte le funzionalità disponibili
 */
export function useAvailableFeatures(): {
  features: string[];
  isLoading: boolean;
} {
  const { role, isLoading: roleLoading } = useUserRole();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkEmailVerification() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsEmailVerified(user?.email_confirmed_at !== null);
      } catch {
        setIsEmailVerified(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (!roleLoading) {
      checkEmailVerification();
    }
  }, [roleLoading]);

  const features = useMemo(() => {
    if (isLoading || roleLoading) {
      return [];
    }
    return getAvailableFeatures(role, isEmailVerified);
  }, [role, isEmailVerified, isLoading, roleLoading]);

  return {
    features,
    isLoading: isLoading || roleLoading,
  };
}

// Re-export per comodità
export { getRequiredAccessLevel } from "@/lib/features/access-control";
export type { AccessLevel } from "@/lib/features/access-control";
