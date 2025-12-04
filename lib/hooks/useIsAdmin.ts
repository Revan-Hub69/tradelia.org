"use client";

import { useUserRole } from "./useUserRole";

export function useIsAdmin(): boolean {
  const { role } = useUserRole();
  return role === "admin";
}
