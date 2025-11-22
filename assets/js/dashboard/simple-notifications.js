/**
 * Simple Notifications System
 * Sistema notifiche semplice e solido
 * - Se PWA installata: notifiche anche in background (via Service Worker)
 * - Se browser normale: solo toast quando la pagina è aperta
 */

import { showToast } from "./toast.js";
import { initSupabase } from "./supabase-client.js";
import { isPWAInstalled } from "./pwa-notifications.js";

let pollingInterval = null;
let lastCheckTime = null;
let unreadCount = 0;
let isPWA = false;
let notificationPermission = null;

/**
 * Inizializza il sistema notifiche semplice
 */
export async function initSimpleNotifications() {
  // Verifica se PWA è installata
  isPWA = isPWAInstalled();

  if (isPWA) {
    // PWA installata: richiedi permesso notifiche browser per funzionare in background
    await requestNotificationPermission();
    console.log("[Simple Notifications] PWA installata - notifiche abilitate anche in background");
  } else {
    // Browser normale: solo notifiche quando la pagina è aperta
    console.log("[Simple Notifications] Browser normale - notifiche solo quando pagina aperta");
  }

  // Controlla notifiche ogni 2 minuti
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
 * Richiedi permesso notifiche browser
 */
async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("[Simple Notifications] Browser non supporta notifiche");
    return;
  }

  notificationPermission = Notification.permission;

  // Se permesso già concesso o negato, non richiedere
  if (notificationPermission === "granted" || notificationPermission === "denied") {
    return;
  }

  // Richiedi permesso solo se l'utente interagisce (best practice)
  // Non richiediamo automaticamente all'avvio
  console.log("[Simple Notifications] Permesso notifiche:", notificationPermission);
}

/**
 * Avvia polling automatico
 */
function startPolling() {
  // Ferma polling esistente se presente
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // PWA: controlla ogni 2 minuti (funziona anche in background)
  // Browser normale: controlla ogni 2 minuti (solo quando pagina aperta)
  const interval = isPWA ? 120000 : 120000; // 2 minuti in entrambi i casi
  pollingInterval = setInterval(() => {
    checkForNewNotifications();
  }, interval);
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

    // Se ci sono nuove notifiche
    if (data && data.length > 0) {
      data.forEach((notification) => {
        // Sempre mostra toast (quando pagina aperta)
        showNotificationToast(notification);

        // Notifiche browser native solo se PWA installata
        if (isPWA) {
          showBrowserNotification(notification);
        }
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
 * Mostra notifica browser nativa (funziona anche quando la pagina è in background)
 */
function showBrowserNotification(notification) {
  // Solo se permesso concesso
  if (notificationPermission !== "granted") {
    return;
  }

  const title = notification.title || "Tradelia";
  const body = notification.message || notification.body || "Nuova notifica";
  const icon = "/icons/icon-192.png";

  try {
    const browserNotification = new Notification(title, {
      body,
      icon,
      badge: "/icons/icon-192.png",
      tag: `notification-${notification.id}`, // Evita duplicati
      requireInteraction: false, // Si chiude automaticamente
    });

    // Chiudi dopo 5 secondi
    setTimeout(() => {
      browserNotification.close();
    }, 5000);

    // Click sulla notifica apre la dashboard
    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      // Se siamo già sulla dashboard, apri il pannello notifiche
      if (window.location.pathname.includes("dashboard")) {
        window.location.hash = "#notifications";
      } else {
        window.location.href = "/dashboard.html#notifications";
      }
    };
  } catch (error) {
    console.warn("[Simple Notifications] Errore creazione notifica browser:", error);
  }
}

/**
 * Richiedi permesso notifiche (da chiamare quando l'utente clicca un pulsante)
 */
export async function requestNotificationPermissionExplicit() {
  if (!("Notification" in window)) {
    if (window.showToast) {
      window.showToast("Il browser non supporta le notifiche", "error");
    }
    return false;
  }

  if (Notification.permission === "granted") {
    if (window.showToast) {
      window.showToast("Notifiche già abilitate", "info");
    }
    notificationPermission = "granted";
    return true;
  }

  if (Notification.permission === "denied") {
    if (window.showToast) {
      window.showToast("Notifiche bloccate. Abilita nelle impostazioni del browser.", "error");
    }
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;

    if (permission === "granted") {
      if (window.showToast) {
        window.showToast("Notifiche abilitate", "success");
      }
      return true;
    } else {
      if (window.showToast) {
        window.showToast("Permesso notifiche negato", "info");
      }
      return false;
    }
  } catch (error) {
    console.error("[Simple Notifications] Errore richiesta permesso:", error);
    return false;
  }
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
