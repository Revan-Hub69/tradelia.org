/**
 * Simple Notifications System
 * Sistema notifiche semplice e solido
 * - Se PWA installata: notifiche anche in background (via Service Worker)
 * - Se browser normale: solo toast quando la pagina è aperta
 */

import { showToast } from "./toast.js";
import { isPWAInstalled } from "./pwa-notifications.js";
import { syncTokenToIndexedDB } from "./token-storage.js";

let pollingInterval = null;
let lastCheckTime = null;
let unreadCount = 0;
let isPWA = false;
let notificationPermission = null;

/**
 * Ottiene o crea un device ID univoco per guest users
 */
function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem("tradelia-device-id");
  if (!deviceId) {
    // Genera un ID univoco
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("tradelia-device-id", deviceId);
  }
  return deviceId;
}

function getStoredToken() {
  return localStorage.getItem("tradelia-access-token-v1") || null;
}

async function fetchNotificationsFromApi({
  token,
  deviceId,
  onlyUnread = true,
  since = null,
  limit = 10,
} = {}) {
  const response = await fetch("/api/auth?action=notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: token || getStoredToken(),
      deviceId: deviceId || getOrCreateDeviceId(),
      onlyUnread,
      since,
      limit,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Errore recupero notifiche");
  }
  return data.notifications || [];
}

/**
 * Inizializza il sistema notifiche semplice
 */
export async function initSimpleNotifications() {
  // Verifica se PWA è installata
  isPWA = isPWAInstalled();

  if (isPWA) {
    // PWA installata: NON richiedere permesso automaticamente
    // BEST PRACTICE ACCADEMICA: Richiedere solo dopo interazione utente o valore dimostrato
    // Verifica solo se permesso già concesso
    notificationPermission = Notification.permission;

    // Registra periodic background sync per funzionare anche quando PWA è chiusa
    // (funziona anche senza permesso notifiche, per controlli in background)
    await registerPeriodicBackgroundSync();

    // Verifica stato permesso (non richiede automaticamente)
    checkNotificationPermission();
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

  // Sincronizza token e device ID in IndexedDB per Service Worker
  await syncTokenToIndexedDB();

  // Assicura che device ID esista (per guest users)
  if (!localStorage.getItem("tradelia-device-id")) {
    getOrCreateDeviceId();
    await syncTokenToIndexedDB();
  }
}

/**
 * Registra periodic background sync per controllare notifiche anche quando PWA è chiusa
 */
async function registerPeriodicBackgroundSync() {
  if (!("serviceWorker" in navigator) || !("PeriodicBackgroundSync" in window)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Registra sync periodico ogni 2 ore (quando PWA è chiusa)
    // Nota: il browser può decidere l'intervallo effettivo (minimo 1 ora)
    await registration.periodicSync.register("check-notifications", {
      minInterval: 2 * 60 * 60 * 1000, // 2 ore in millisecondi
    });
  } catch (error) {
    console.warn("[Simple Notifications] Errore registrazione Periodic Background Sync:", error);
  }
}

/**
 * Verifica stato permesso notifiche browser
 * BEST PRACTICE ACCADEMICA: Non richiedere automaticamente
 * Questa funzione verifica solo lo stato, non richiede permesso
 */
function checkNotificationPermission() {
  if (!("Notification" in window)) {
    return;
  }

  notificationPermission = Notification.permission;
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
    const notifications = await fetchNotificationsFromApi({
      token: getStoredToken(),
      deviceId: getOrCreateDeviceId(),
      onlyUnread: true,
      since: lastCheckTime,
      limit: 10,
    });

    lastCheckTime = new Date().toISOString();

    if (notifications && notifications.length > 0) {
      notifications.forEach((notification) => {
        showNotificationToast(notification);
        if (isPWA) {
          showBrowserNotification(notification);
        }
      });

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
    const notifications = await fetchNotificationsFromApi({
      token: getStoredToken(),
      deviceId: getOrCreateDeviceId(),
      onlyUnread: true,
      limit: 100,
    });

    unreadCount = notifications.length;

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
    const badge = document.querySelector("[data-notification-badge]");
    if (badge) {
      badge.style.display = "none";
    }
  }
}

/**
 * Ottiene conteggio notifiche non lette
 */
export function getUnreadCount() {
  return unreadCount;
}
