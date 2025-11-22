/**
 * Simple Notifications System
 * Sistema notifiche semplice e solido - polling automatico
 * Nessuna complessità di push subscriptions o service worker
 */

import { showToast } from "./toast.js";
import { initSupabase } from "./supabase-client.js";

let pollingInterval = null;
let lastCheckTime = null;
let unreadCount = 0;

/**
 * Inizializza il sistema notifiche semplice
 */
export async function initSimpleNotifications() {
  // Controlla notifiche ogni 2 minuti quando l'utente è sulla dashboard
  startPolling();

  // Controlla anche quando la pagina diventa visibile
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      checkForNewNotifications();
    }
  });

  // Controlla subito all'avvio
  await checkForNewNotifications();
}

/**
 * Avvia polling automatico
 */
function startPolling() {
  // Ferma polling esistente se presente
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // Controlla ogni 2 minuti (120000ms)
  pollingInterval = setInterval(() => {
    checkForNewNotifications();
  }, 120000); // 2 minuti
}

/**
 * Ferma polling
 */
export function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

/**
 * Controlla nuove notifiche
 */
async function checkForNewNotifications() {
  try {
    const supabase = await initSupabase();
    if (!supabase) {
      return;
    }

    const token = localStorage.getItem("tradelia-access-token-v1");
    if (!token) {
      return; // Guest user, nessuna notifica
    }

    // Query per notifiche non lette
    let query = supabase
      .from("notifications")
      .select("id, title, message, type, created_at")
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(10);

    // Filtra per user_id o user_token
    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      if (tokenData?.user_id) {
        query = query.eq("user_id", tokenData.user_id);
      } else {
        query = query.eq("user_token", token);
      }
    } catch {
      query = query.eq("user_token", token);
    }

    // Se abbiamo un timestamp dell'ultimo controllo, filtra solo notifiche più recenti
    if (lastCheckTime) {
      query = query.gt("created_at", lastCheckTime);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("[Simple Notifications] Errore controllo notifiche:", error);
      return;
    }

    // Aggiorna timestamp
    lastCheckTime = new Date().toISOString();

    // Se ci sono nuove notifiche, mostra toast
    if (data && data.length > 0) {
      data.forEach((notification) => {
        showNotificationToast(notification);
      });

      // Aggiorna badge contatore
      updateNotificationBadge();
    }
  } catch (error) {
    console.warn("[Simple Notifications] Errore:", error);
  }
}

/**
 * Mostra toast per nuova notifica
 */
function showNotificationToast(notification) {
  const message = notification.title || notification.message || "Nuova notifica";
  const type = notification.type || "info";

  showToast(message, type, 5000); // 5 secondi
}

/**
 * Aggiorna badge contatore notifiche
 */
async function updateNotificationBadge() {
  try {
    const supabase = await initSupabase();
    if (!supabase) {
      return;
    }

    const token = localStorage.getItem("tradelia-access-token-v1");
    if (!token) {
      return;
    }

    let query = supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false);

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      if (tokenData?.user_id) {
        query = query.eq("user_id", tokenData.user_id);
      } else {
        query = query.eq("user_token", token);
      }
    } catch {
      query = query.eq("user_token", token);
    }

    const { count, error } = await query;

    if (error) {
      console.warn("[Simple Notifications] Errore conteggio:", error);
      return;
    }

    unreadCount = count || 0;

    // Aggiorna badge nell'UI
    const badge = document.querySelector("[data-notification-badge]");
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? "99+" : unreadCount.toString();
        badge.style.display = "inline-flex";
      } else {
        badge.style.display = "none";
      }
    }
  } catch (error) {
    console.warn("[Simple Notifications] Errore aggiornamento badge:", error);
  }
}

/**
 * Ottiene conteggio notifiche non lette
 */
export function getUnreadCount() {
  return unreadCount;
}
