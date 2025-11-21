/* eslint-env browser */
/**
 * PWA & Push Notifications Manager
 * Gestisce installazione PWA e abilitazione notifiche push
 */

let deferredPrompt = null;
let serviceWorkerRegistration = null;

/**
 * Inizializza PWA e notifiche
 */
export async function initPWANotifications() {
  // Registra Service Worker
  await registerServiceWorker();

  // Setup PWA install prompt
  setupPWAInstallPrompt();

  // Verifica stato PWA installata
  checkPWAInstalled();
}

/**
 * Registra Service Worker
 */
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("[PWA] Service Worker non supportato");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    serviceWorkerRegistration = registration;
    console.warn("[PWA] Service Worker registrato:", registration);
    return registration;
  } catch (error) {
    console.error("[PWA] Errore registrazione Service Worker:", error);
    return null;
  }
}

/**
 * Setup PWA install prompt
 */
function setupPWAInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.warn("[PWA] Install prompt disponibile");
  });

  window.addEventListener("appinstalled", () => {
    console.warn("[PWA] App installata");
    deferredPrompt = null;
    localStorage.setItem("tradelia-pwa-installed", "true");
  });
}

/**
 * Verifica se PWA è installata
 */
function checkPWAInstalled() {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const hasFlag = localStorage.getItem("tradelia-pwa-installed") === "true";

  if (isStandalone || hasFlag) {
    return true;
  }
  return false;
}

/**
 * Installa PWA
 */
export async function installPWA() {
  if (!deferredPrompt) {
    // Se non c'è prompt, mostra istruzioni
    showPWAInstructions();
    return false;
  }

  try {
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      console.warn("[PWA] Utente ha accettato installazione");
      localStorage.setItem("tradelia-pwa-installed", "true");
      deferredPrompt = null;
      return true;
    } else {
      console.warn("[PWA] Utente ha rifiutato installazione");
      return false;
    }
  } catch (error) {
    console.error("[PWA] Errore durante installazione:", error);
    showPWAInstructions();
    return false;
  }
}

/**
 * Mostra istruzioni installazione PWA
 */
function showPWAInstructions() {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  let message = "";

  if (isIOS) {
    message =
      "Per installare l'app su iOS:\n\n" +
      "1. Tocca il pulsante Condividi (quadrato con freccia) in basso\n" +
      "2. Scorri e seleziona 'Aggiungi alla schermata Home'\n" +
      "3. Tocca 'Aggiungi' in alto a destra";
  } else if (isAndroid) {
    message =
      "Per installare l'app su Android:\n\n" +
      "1. Apri il menu del browser (tre puntini)\n" +
      "2. Seleziona 'Aggiungi alla schermata Home' o 'Installa app'\n" +
      "3. Conferma l'installazione";
  } else {
    message =
      "Per installare l'app:\n\n" +
      "1. Cerca l'icona di installazione nella barra degli indirizzi\n" +
      "2. Clicca sull'icona e seleziona 'Installa'\n" +
      "3. Conferma l'installazione";
  }

  alert(message);
}

/**
 * Verifica se PWA è installabile
 */
export function isPWAInstallable() {
  return !!deferredPrompt;
}

/**
 * Verifica se PWA è installata
 */
export function isPWAInstalled() {
  return checkPWAInstalled();
}

/**
 * Richiedi permesso notifiche push
 */
export async function requestPushPermission() {
  if (!("Notification" in window)) {
    console.warn("[Notifications] Notifiche non supportate");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    console.warn("[Notifications] Permesso negato dall'utente");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("[Notifications] Permesso concesso");
      // Subscribe alle push notifications
      await subscribeToPush();
      return true;
    } else {
      console.log("[Notifications] Permesso negato");
      return false;
    }
  } catch (error) {
    console.error("[Notifications] Errore richiesta permesso:", error);
    return false;
  }
}

/**
 * Disabilita notifiche push
 */
export async function disablePushNotifications() {
  if (!serviceWorkerRegistration) {
    console.warn("[Notifications] Service Worker non registrato");
    return;
  }

  try {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log("[Notifications] Disiscritto dalle push notifications");
    }
  } catch (error) {
    console.error("[Notifications] Errore disabilitazione:", error);
  }
}

/**
 * Ottiene VAPID public key
 * Usa la key hardcoded (già configurata nel progetto)
 * In futuro può essere esposta via meta tag o config statico
 */
async function getVAPIDPublicKey() {
  // Usa la key hardcoded già presente nel progetto (archivio/assets/js/fcm-config.js)
  // Questa è la stessa key usata in archivio e già configurata
  return "BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0";
}

/**
 * Subscribe alle push notifications
 */
async function subscribeToPush() {
  if (!serviceWorkerRegistration) {
    console.warn("[Notifications] Service Worker non registrato");
    return;
  }

  try {
    // Ottieni VAPID public key dal server
    const vapidPublicKey = await getVAPIDPublicKey();

    if (!vapidPublicKey) {
      console.warn("[Notifications] VAPID key non disponibile");
      return;
    }

    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.warn("[Notifications] Sottoscritto:", subscription);

    // Invia subscription al server
    await sendSubscriptionToServer(subscription);
  } catch (error) {
    console.error("[Notifications] Errore sottoscrizione:", error);
  }
}

/**
 * Invia subscription al server
 */
async function sendSubscriptionToServer(subscription) {
  try {
    const token = localStorage.getItem("tradelia-dashboard-token");
    if (!token) {
      console.warn("[Notifications] Token non disponibile");
      return;
    }

    const response = await fetch("/api/save-push-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.warn("[Notifications] Subscription salvata sul server");
  } catch (error) {
    console.error("[Notifications] Errore invio subscription:", error);
  }
}

/**
 * Converti VAPID key da base64 a Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Verifica permesso notifiche
 */
export function getNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Verifica se notifiche sono abilitate
 */
export async function areNotificationsEnabled() {
  if (getNotificationPermission() !== "granted") {
    return false;
  }

  if (!serviceWorkerRegistration) {
    return false;
  }

  try {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error("[Notifications] Errore verifica subscription:", error);
    return false;
  }
}
