/* eslint-env browser */
/**
 * Firebase Cloud Messaging (FCM) - Notifiche Push
 * Sostituisce VAPID con FCM per maggiore affidabilità e supporto Opera
 */

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig, VAPID_PUBLIC_KEY } from "./fcm-config.js";

let messaging = null;
let fcmToken = null;

/**
 * Inizializza Firebase Messaging
 */
export async function initFCM() {
  try {
    // Inizializza Firebase App
    const app = initializeApp(firebaseConfig);

    // Verifica che il service worker sia registrato
    if (!("serviceWorker" in navigator)) {
      console.warn("[FCM] Service Worker non supportato");
      return false;
    }

    // Ottieni Messaging
    messaging = getMessaging(app);

    // Richiedi permesso e ottieni token
    await requestFCMPermission();

    // Listener per messaggi in foreground
    onMessage(messaging, (payload) => {
      console.warn("[FCM] Messaggio ricevuto in foreground:", payload);
      // Mostra notifica manualmente se l'app è aperta
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: "/icons/icon-192.png",
          tag: payload.data?.tag || "tradelia-notification",
        });
      }
    });

    return true;
  } catch (error) {
    console.error("[FCM] Errore inizializzazione:", error);
    return false;
  }
}

/**
 * Richiedi permesso e ottieni FCM token
 */
async function requestFCMPermission() {
  try {
    // Richiedi permesso notifiche
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] Permesso notifiche negato");
      return null;
    }

    // Ottieni FCM token
    // Nota: getToken richiede che il service worker sia registrato
    // e che firebase-messaging-sw.js sia presente nella root
    fcmToken = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
    });

    if (!fcmToken) {
      console.warn("[FCM] Token non ottenuto");
      return null;
    }

    console.warn("[FCM] Token ottenuto:", fcmToken);

    // Invia token al server
    await sendFCMTokenToServer(fcmToken);

    return fcmToken;
  } catch (error) {
    console.error("[FCM] Errore richiesta permesso/token:", error);
    return null;
  }
}

/**
 * Invia FCM token al server
 */
async function sendFCMTokenToServer(token) {
  try {
    const authToken = localStorage.getItem("tradelia-access-token-v1");
    if (!authToken) {
      console.warn("[FCM] Token di autenticazione non trovato");
      return false;
    }

    const response = await fetch("/api/notifications?action=save-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        subscription: {
          token: token,
          fcmToken: token,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    console.warn("[FCM] Token salvato sul server");
    return true;
  } catch (error) {
    console.error("[FCM] Errore invio token al server:", error);
    return false;
  }
}

/**
 * Ottieni FCM token corrente
 */
export function getFCMToken() {
  return fcmToken;
}

/**
 * Verifica se FCM è abilitato
 */
export async function isFCMEnabled() {
  return Notification.permission === "granted" && fcmToken !== null;
}
