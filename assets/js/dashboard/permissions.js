/**
 * Dashboard Permissions Module
 * Autorizzazioni centralizzate per Guest/Pro/Desk
 */

import { getCurrentRole } from "./account-banner.js";

/**
 * Mappa autorizzazioni per ruolo
 */
const PERMISSIONS = {
  guest: {
    canDownloadPdf: false,
    canRequestAnalysis: false,
    canVote: false,
    canPropose: false,
    canAccessNotifications: false,
    canViewReports: true, // Solo web, no PDF
    canViewEducation: true,
  },
  pro: {
    canDownloadPdf: true, // pay-per-use 10€
    canRequestAnalysis: true, // 1 inclusa + 3 extra a 29€
    canVote: true,
    canPropose: false,
    canAccessNotifications: true,
    canViewReports: true,
    canViewEducation: true,
  },
  desk: {
    canDownloadPdf: true, // incluso
    canRequestAnalysis: true, // 2 incluse + extra a 49€
    canVote: true,
    canPropose: true,
    canAccessNotifications: true,
    canViewReports: true,
    canViewEducation: true,
  },
};

/**
 * Verifica se l'utente può accedere a una funzionalità
 * @param {string} feature - Nome funzionalità
 * @param {object} role - Risultato di getUserRole() (opzionale, usa cached se non fornito)
 * @param {object} planData - Risultato di getPlanData() (opzionale, per check usage)
 * @returns {boolean}
 */
export function canAccessFeature(feature, role = null, planData = null) {
  if (!role) {
    role = getCurrentRole();
  }
  if (!role || !role.role) {
    return false;
  }

  const permissions = PERMISSIONS[role.role];
  if (!permissions) {
    return false;
  }

  // Check base permissions
  switch (feature) {
    case "pdf":
      return permissions.canDownloadPdf;

    case "analysis":
    case "request_analysis":
      if (!permissions.canRequestAnalysis) {
        return false;
      }
      // Check usage se planData disponibile
      if (planData && planData.usage) {
        const usage = planData.usage;
        if (role.role === "pro") {
          // Pro: può richiedere se ha analisi incluse o extra disponibili
          return usage.proIncludedRemaining > 0 || usage.proExtraRemaining > 0;
        } else if (role.role === "desk") {
          // Desk: può richiedere se ha analisi incluse o sempre (extra disponibili)
          return usage.deskIncludedRemaining > 0 || true; // Extra sempre disponibili
        }
      }
      return true;

    case "community":
    case "vote":
      return permissions.canVote;

    case "propose":
      return permissions.canPropose;

    case "notifications":
      return permissions.canAccessNotifications;

    case "education":
      return permissions.canViewEducation;

    case "reports":
      return permissions.canViewReports;

    default:
      return false;
  }
}

/**
 * Ottiene il prezzo per una funzionalità in base al ruolo e usage
 * @param {string} feature - 'pdf', 'analysis'
 * @param {object} role - Risultato di getUserRole() (opzionale, usa cached se non fornito)
 * @param {object} planData - Risultato di getPlanData() (opzionale)
 * @returns {number|null} - Prezzo in euro, null se incluso o non disponibile
 */
export function getFeaturePrice(feature, role = null, planData = null) {
  if (!role) {
    role = getCurrentRole();
  }
  if (!role || !role.role) {
    return null;
  }

  switch (feature) {
    case "pdf":
      if (role.role === "desk") {
        return null;
      } // Incluso
      if (role.role === "pro") {
        return 10;
      } // 10€
      return null; // Guest: non disponibile

    case "analysis":
      if (role.role === "pro") {
        if (planData && planData.usage) {
          const usage = planData.usage;
          // Se ha analisi inclusa disponibile: 0€
          if (usage.proIncludedRemaining > 0) {
            return null;
          }
          // Se ha slot extra disponibili: 29€
          if (usage.proExtraRemaining > 0) {
            return 29;
          }
        }
        // Default: 49€ (standalone)
        return 49;
      }
      if (role.role === "desk") {
        if (planData && planData.usage) {
          const usage = planData.usage;
          // Se ha analisi incluse disponibili: 0€
          if (usage.deskIncludedRemaining > 0) {
            return null;
          }
        }
        // Extra: 49€
        return 49;
      }
      return null; // Guest: non disponibile

    default:
      return null;
  }
}

/**
 * Verifica se l'utente è admin
 * @param {object} role - Risultato di getUserRole() (opzionale, usa cached se non fornito)
 * @returns {boolean}
 */
export function isAdmin(role = null) {
  if (!role) {
    role = getCurrentRole();
  }
  if (!role) {
    return false;
  }
  return role.isAdmin === true;
}

/**
 * Ottiene messaggio paywall per funzionalità
 * @param {string} feature - Nome funzionalità
 * @param {object} role - Risultato di getUserRole() (opzionale, usa cached se non fornito)
 * @returns {string|null} - Messaggio paywall o null se accesso consentito
 */
export function getPaywallMessage(feature, role = null) {
  if (!role) {
    role = getCurrentRole();
  }
  if (!role || !role.role) {
    return "Accedi per accedere a questa funzionalità.";
  }

  if (canAccessFeature(feature, role)) {
    return null; // Accesso consentito
  }

  switch (feature) {
    case "pdf":
      return "Attiva Pro o Desk per scaricare PDF.";

    case "analysis":
      return "Attiva Pro o Desk per richiedere analisi on-demand.";

    case "vote":
      return "Accedi per votare nelle proposte della community.";

    case "propose":
      return "Attiva Desk per proporre nuovi asset da analizzare.";

    default:
      return "Accesso negato.";
  }
}
