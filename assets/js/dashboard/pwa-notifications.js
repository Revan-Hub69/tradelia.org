/* eslint-env browser */
/**
 * PWA & Push Notifications Manager
 * Gestisce installazione PWA e abilitazione notifiche push
 */

let deferredPrompt = null;
let serviceWorkerRegistration = null;

/**
 * Inizializza PWA e notifiche
 * BEST PRACTICE: Non richiede permessi automaticamente all'avvio
 * I permessi vengono richiesti solo quando l'utente clicca esplicitamente "Abilita Notifiche"
 */
export async function initPWANotifications() {
  // Registra Service Worker
  await registerServiceWorker();

  // Setup PWA install prompt
  setupPWAInstallPrompt();

  // Verifica stato PWA installata
  checkPWAInstalled();

  // BEST PRACTICE: Se permesso già concesso, sottoscrivi automaticamente
  // (l'utente ha già dato il consenso in passato)
  await autoSubscribeIfGranted();
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
 * BEST PRACTICE: Registra listener PRIMA che l'evento possa essere lanciato
 */
function setupPWAInstallPrompt() {
  // Registra listener immediatamente (prima possibile)
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

  // BEST PRACTICE: Se l'evento è già stato lanciato prima del listener,
  // controlla se window.deferredPrompt esiste (alcuni browser lo salvano)
  // Nota: questo è un fallback, non tutti i browser lo supportano
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
 * Mostra prompt nativo del browser se disponibile, altrimenti istruzioni
 */
export async function installPWA() {
  // Se già installata, ritorna true
  if (isPWAInstalled()) {
    if (window.showToast) {
      window.showToast("App già installata!", "info");
    }
    return true;
  }

  // BEST PRACTICE: Aspetta un attimo per vedere se deferredPrompt arriva
  // (l'evento potrebbe essere in arrivo)
  if (!deferredPrompt) {
    // Aspetta 500ms per vedere se l'evento arriva
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Se ancora non c'è, verifica se il browser supporta installazione
    const isInstallable =
      window.matchMedia("(display-mode: standalone)").matches === false &&
      !window.navigator.standalone;

    if (!isInstallable) {
      // Browser non supporta installazione PWA o già installata
      if (window.showToast) {
        window.showToast("App già installata o browser non supportato", "info");
      }
      return false;
    }

    // Se non c'è prompt ma browser supporta, mostra istruzioni
    showPWAInstructions();
    return false;
  }

  try {
    // Mostra prompt nativo del browser
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      console.warn("[PWA] Utente ha accettato installazione");
      localStorage.setItem("tradelia-pwa-installed", "true");
      deferredPrompt = null;
      // Aggiorna stato dopo installazione
      setTimeout(() => {
        if (isPWAInstalled()) {
          // Ricarica per mostrare PWA installata
          window.location.reload();
        }
      }, 1000);
      return true;
    } else {
      console.warn("[PWA] Utente ha rifiutato installazione");
      deferredPrompt = null;
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
 * BEST PRACTICE: Sottoscrivi automaticamente se permesso già concesso
 * (l'utente ha già dato il consenso in passato, non serve richiedere di nuovo)
 */
async function autoSubscribeIfGranted() {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted" && serviceWorkerRegistration) {
    const alreadySubscribed = await areNotificationsEnabled();
    if (!alreadySubscribed) {
      // Permesso concesso ma non sottoscritto → sottoscrivi automaticamente
      await subscribeToPush();
    }
  }
}

/**
 * Abilita notifiche push (richiede permesso e sottoscrive)
 * BEST PRACTICE: Richiede permesso solo quando l'utente clicca esplicitamente
 */
export async function enablePushNotifications() {
  if (!("Notification" in window)) {
    console.warn("[Notifications] Notifiche non supportate");
    return false;
  }

  // Verifica browser - Opera potrebbe avere limitazioni
  const isOpera = /OPR|Opera/.test(navigator.userAgent);
  if (isOpera) {
    console.warn("[Notifications] Rilevato Opera - potrebbe avere limitazioni");
  }

  console.warn("[Notifications] Inizio abilitazione notifiche...");
  console.warn("[Notifications] Stato permesso attuale:", Notification.permission);
  console.warn("[Notifications] Service Worker registrato:", !!serviceWorkerRegistration);

  // Assicura che service worker sia registrato
  if (!serviceWorkerRegistration) {
    console.warn("[Notifications] Service Worker non registrato, registrazione in corso...");
    try {
      const registration = await registerServiceWorker();
      if (!registration) {
        console.error("[Notifications] Impossibile registrare Service Worker");
        return false;
      }
      console.warn("[Notifications] Service Worker registrato con successo");
    } catch (error) {
      console.error("[Notifications] Errore registrazione Service Worker:", error);
      return false;
    }
  }

  // Se permesso già concesso, verifica se già sottoscritto
  if (Notification.permission === "granted") {
    console.warn("[Notifications] Permesso già concesso, verifica sottoscrizione...");
    const alreadySubscribed = await areNotificationsEnabled();
    if (alreadySubscribed) {
      console.warn("[Notifications] Già sottoscritto");
      return true;
    }
    // Permesso concesso ma non sottoscritto → sottoscrivi
    try {
      console.warn("[Notifications] Sottoscrizione in corso...");
      await subscribeToPush();
      console.warn("[Notifications] Sottoscrizione completata con successo");
      return true;
    } catch (error) {
      console.error("[Notifications] Errore durante sottoscrizione:", error);
      return false;
    }
  }

  // BEST PRACTICE: Se permesso negato, non forzare
  // L'utente deve cambiare le impostazioni del browser manualmente
  if (Notification.permission === "denied") {
    console.warn("[Notifications] Permesso negato - utente deve cambiare impostazioni browser");
    return false;
  }

  // BEST PRACTICE: Permesso "default" → richiedi solo se chiamato esplicitamente dall'utente
  // (questa funzione viene chiamata solo quando l'utente clicca "Abilita Notifiche")
  try {
    console.warn("[Notifications] Richiesta permesso all'utente...");
    const permission = await Notification.requestPermission();
    console.warn("[Notifications] Risposta permesso:", permission);

    if (permission === "granted") {
      console.warn("[Notifications] Permesso concesso, sottoscrizione in corso...");
      try {
        await subscribeToPush();
        console.warn("[Notifications] Sottoscrizione completata con successo");
        return true;
      } catch (error) {
        console.error("[Notifications] Errore durante sottoscrizione:", error);
        return false;
      }
    } else if (permission === "denied") {
      console.warn("[Notifications] Permesso negato dall'utente");
      return false;
    } else {
      console.warn("[Notifications] Permesso in stato default dopo richiesta");
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
 * Ottiene VAPID public key dal server
 * Fallback a key hardcoded se l'API non è disponibile
 */
async function getVAPIDPublicKey() {
  try {
    const response = await fetch("/api/notifications?action=vapid-key");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.ok && data.publicKey) {
      return data.publicKey;
    }

    throw new Error("VAPID key non disponibile nella risposta");
  } catch (error) {
    console.warn("[Notifications] Errore recupero VAPID key dal server, uso fallback:", error);
    // Fallback a key hardcoded (già configurata nel progetto)
    return "BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0";
  }
}

/**
 * Subscribe alle push notifications
 * BEST PRACTICE: Assicura che service worker sia registrato prima di sottoscrivere
 */
async function subscribeToPush() {
  // Se service worker non è registrato, registralo
  if (!serviceWorkerRegistration) {
    console.warn("[Notifications] Service Worker non registrato, registrazione in corso...");
    const registration = await registerServiceWorker();
    if (!registration) {
      const error = new Error("Impossibile registrare Service Worker");
      console.error("[Notifications]", error);
      throw error;
    }
  }

  try {
    // Verifica che pushManager sia disponibile
    if (!serviceWorkerRegistration.pushManager) {
      const error = new Error("Push Manager non disponibile nel Service Worker");
      console.error("[Notifications]", error);
      throw error;
    }

    // Ottieni VAPID public key dal server
    const vapidPublicKey = await getVAPIDPublicKey();

    if (!vapidPublicKey) {
      const error = new Error("VAPID key non disponibile");
      console.error("[Notifications]", error);
      throw error;
    }

    console.warn("[Notifications] Tentativo sottoscrizione con VAPID key...");

    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.warn("[Notifications] Sottoscritto con successo:", subscription);

    // Invia subscription al server
    console.log("[Notifications] Invio subscription al server...");
    try {
      await sendSubscriptionToServer(subscription);
      console.log("[Notifications] Subscription inviata al server con successo");
    } catch (serverError) {
      console.error("[Notifications] Errore salvataggio subscription sul server:", serverError);
      // Non blocchiamo la sottoscrizione se il salvataggio fallisce
      // L'utente può riprovare più tardi
      throw new Error(`Sottoscrizione completata ma salvataggio fallito: ${serverError.message}`);
    }
  } catch (error) {
    console.error("[Notifications] Errore sottoscrizione:", error);
    console.error("[Notifications] Dettagli errore:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Se errore è "Permission denied" o simile, rilancia con messaggio più chiaro
    if (
      error.name === "NotAllowedError" ||
      error.message?.includes("permission") ||
      error.message?.includes("denied")
    ) {
      throw new Error("Permesso notifiche negato. Verifica le impostazioni del browser.");
    }

    // Se errore è "NotSupportedError", il browser non supporta push
    if (error.name === "NotSupportedError") {
      throw new Error("Il browser non supporta le notifiche push.");
    }

    throw error; // Rilancia per permettere gestione errore nel chiamante
  }
}

/**
 * Invia subscription al server
 */
async function sendSubscriptionToServer(subscription) {
  try {
    const token = localStorage.getItem("tradelia-access-token-v1");
    if (!token) {
      console.warn("[Notifications] Token non disponibile - subscription non salvata");
      // Per guest users, proviamo comunque senza token
      // L'API gestirà l'autenticazione
    }

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/notifications?action=save-subscription", {
      method: "POST",
      headers,
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("[Notifications] Subscription salvata sul server:", data);
  } catch (error) {
    console.error("[Notifications] Errore invio subscription:", error);
    throw error; // Rilancia per permettere gestione errore nel chiamante
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
