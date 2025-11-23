/* eslint-env browser */
/**
 * Dashboard Authentication & Role Management
 * Determina ruolo utente: Guest, Authenticated (Pro), Desk
 * Usa API get-user-plan.js per stato plan e usage
 */

import { safeLog } from "./security-utils.js";

const API_BASE = "/api";

let userRoleCache = null;
let userPlanDataCache = null;

/**
 * Determina il ruolo utente corrente usando get-user-plan.js
 * @returns {Promise<{role: 'guest'|'authenticated'|'pro'|'desk', user: object|null, plan: object|null, usage: object|null, isAdmin: boolean}>}
 */
export async function getUserRole() {
  if (userRoleCache && userPlanDataCache) {
    return { ...userRoleCache, ...userPlanDataCache };
  }

  const token = localStorage.getItem("tradelia-access-token-v1");
  if (!token) {
    userRoleCache = { role: "guest", user: null, isAdmin: false };
    userPlanDataCache = { plan: null, usage: null };
    return { ...userRoleCache, ...userPlanDataCache };
  }

  try {
    const response = await fetch(`${API_BASE}/user?action=plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (data.ok && data.plan) {
      // BEST PRACTICE: Gerarchia ruoli: guest → pro → desk → admin
      // Non esiste "authenticated" come ruolo, solo guest/pro/desk
      // Se utente ha token ma piano è guest = guest autenticato (può vedere più contenuti)
      let role = data.plan.type || "guest"; // Usa direttamente il tipo piano

      // Verifica che il ruolo sia valido
      if (!["guest", "pro", "desk"].includes(role)) {
        safeLog("warn", "[Auth] Ruolo non valido dal piano:", role, "- default a guest");
        role = "guest";
      }

      userRoleCache = {
        role: role,
        user: { email: data.plan.email || "Utente", id: data.plan.userId },
        isAdmin: data.isAdmin || false,
      };
      userPlanDataCache = {
        plan: data.plan,
        usage: data.usage,
      };
    } else {
      // Token non valido o scaduto, trattiamo come guest
      safeLog("warn", "[Auth] Token non valido o scaduto, utente trattato come guest.");
      // BEST PRACTICE: Use secure token storage
      const { removeToken } = await import("./token-storage.js");
      await removeToken();
      userRoleCache = { role: "guest", user: null, isAdmin: false };
      userPlanDataCache = { plan: null, usage: null };
    }
  } catch (error) {
    safeLog("error", "[Auth] Errore durante la verifica del ruolo utente:", error);
    userRoleCache = { role: "guest", user: null, isAdmin: false };
    userPlanDataCache = { plan: null, usage: null };
  }

  return { ...userRoleCache, ...userPlanDataCache };
}

/**
 * Effettua il logout dell'utente.
 */
export async function logout() {
  try {
    // BEST PRACTICE: Use secure token storage
    const { removeToken } = await import("./token-storage.js");
    await removeToken();

    // Rimuovi token anche da IndexedDB per Service Worker
    const { removeTokenFromIndexedDB } = await import("./token-storage.js");
    await removeTokenFromIndexedDB();

    userRoleCache = { role: "guest", user: null, isAdmin: false };
    userPlanDataCache = { plan: null, usage: null };
    window.location.href = "/accesso.html?reason=logout";
  } catch (error) {
    safeLog("error", "[Auth] Errore durante il logout:", error);
    alert("Errore durante il logout. Riprova.");
  }
}

/**
 * Ottiene i dati del piano utente (per il banner).
 * @returns {Promise<object|null>}
 */
export async function getPlanData() {
  if (userPlanDataCache) {
    return userPlanDataCache;
  }
  // Se non in cache, ricarica il ruolo che popolerà anche i dati del piano
  await getUserRole();
  return userPlanDataCache;
}

/**
 * Reindirizza a login se non autenticato
 */
export function requireAuth() {
  const token = localStorage.getItem("tradelia-access-token-v1");
  if (!token) {
    window.location.href = "/accesso.html?reason=login_required";
    return false;
  }
  return true;
}
