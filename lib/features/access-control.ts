/**
 * Feature Access Control
 * Sistema di controllo accesso per funzionalità basato su ruolo utente
 *
 * Livelli di accesso:
 * - guest: Accesso pubblico (non autenticato)
 * - verified: Account verificato (email verificata)
 * - pro: Account Pro (subscription attiva)
 * - desk: Account Desk (subscription attiva + funzionalità avanzate)
 * - admin: Solo amministratori
 */

import type { UserRole } from "@/lib/hooks/useUserRole";

export type AccessLevel = "guest" | "verified" | "pro" | "desk" | "admin";

/**
 * Mappa funzionalità -> livello accesso minimo richiesto
 */
export const FEATURE_ACCESS: Record<string, AccessLevel> = {
  // Dashboard base
  "dashboard.view": "verified",
  "dashboard.activity": "verified",
  "dashboard.notifications": "verified",
  "dashboard.settings": "verified",

  // Watchlist
  "watchlist.view": "guest",
  "watchlist.create": "verified",
  "watchlist.edit": "verified",

  // Reports
  "reports.view": "pro",
  "reports.create": "pro",
  "reports.download": "pro",
  "reports.share": "pro",

  // Reports - Personalizzazione PDF (solo Desk)
  "reports.pdf.customize": "desk",
  "reports.pdf.templates": "desk",
  "reports.pdf.branding": "desk",

  // Portfolio
  "portfolio.view": "verified",
  "portfolio.track": "verified",
  "portfolio.analytics": "pro",

  // Trading Journal
  "journal.view": "pro",
  "journal.create": "pro",
  "journal.analytics": "pro",

  // Education
  "education.view": "guest",
  "education.courses": "pro",
  "education.certificates": "pro",

  // Utilities
  "utilities.view": "pro",
  "utilities.calculators": "pro",
  "utilities.analyzers": "pro",

  // Community (solo Pro)
  "community.proposals": "pro",
  "community.voting": "pro",
  "community.discussions": "pro",

  // Requests
  "requests.view": "pro",
  "requests.create": "pro",

  // Billing
  "billing.view": "verified",
  "billing.subscribe": "verified",
  "billing.invoices": "verified",

  // Widgets
  "widgets.view": "pro",
  "widgets.create": "pro",
  "widgets.share": "pro",

  // Print
  "print.view": "pro",
  "print.customize": "desk",

  // Admin (solo admin)
  "admin.view": "admin",
  "admin.users": "admin",
  "admin.reports": "admin",
  "admin.notifications": "admin",
  "admin.payments": "admin",
  "admin.supabase": "admin",

  // Glossario
  "glossary.view": "guest",
  "glossary.search": "guest",

  // Analytics
  "analytics.view": "pro",
  "analytics.advanced": "desk",
};

/**
 * Verifica se un ruolo ha accesso a una funzionalità
 */
export function hasAccess(
  userRole: UserRole | null,
  isEmailVerified: boolean,
  feature: string
): boolean {
  const requiredLevel = FEATURE_ACCESS[feature];

  if (!requiredLevel) {
    // Se la funzionalità non è definita, nega l'accesso per sicurezza
    return false;
  }

  // Guest: accesso pubblico
  if (requiredLevel === "guest") {
    return true;
  }

  // Se non autenticato, solo guest access
  if (!userRole && !isEmailVerified) {
    return requiredLevel === "guest";
  }

  // Verificato: richiede almeno email verificata
  if (requiredLevel === "verified") {
    return isEmailVerified;
  }

  // Pro: richiede ruolo pro, desk o admin
  if (requiredLevel === "pro") {
    return userRole === "pro" || userRole === "desk" || userRole === "admin";
  }

  // Desk: richiede ruolo desk o admin
  if (requiredLevel === "desk") {
    return userRole === "desk" || userRole === "admin";
  }

  // Admin: richiede ruolo admin
  if (requiredLevel === "admin") {
    return userRole === "admin";
  }

  return false;
}

/**
 * Ottieni il livello di accesso minimo per una funzionalità
 */
export function getRequiredAccessLevel(feature: string): AccessLevel | null {
  return FEATURE_ACCESS[feature] || null;
}

/**
 * Lista tutte le funzionalità disponibili per un ruolo
 */
export function getAvailableFeatures(
  userRole: UserRole | null,
  isEmailVerified: boolean
): string[] {
  return Object.keys(FEATURE_ACCESS).filter((feature) =>
    hasAccess(userRole, isEmailVerified, feature)
  );
}
