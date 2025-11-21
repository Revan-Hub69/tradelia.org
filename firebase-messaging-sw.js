/**
 * Firebase Cloud Messaging Service Worker
 * Gestisce le notifiche push FCM quando l'app è in background
 */
/* eslint-env serviceworker */
/* global importScripts, firebase */

// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Firebase config (deve corrispondere a fcm-config.js)
// eslint-disable-next-line no-undef
firebase.initializeApp({
  apiKey: "AIzaSyAC2x_9fjPBGdr8glort5EUXLQ40vIAQjg",
  projectId: "tradelia-push",
  messagingSenderId: "904705785437",
  appId: "1:904705785437:web:c9da853c7d900a62c017b4",
});

// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

// Gestisci messaggi in background
messaging.onBackgroundMessage((payload) => {
  console.warn("[FCM SW] Messaggio ricevuto in background:", payload);

  const notificationTitle = payload.notification?.title || "Tradelia AI";
  const notificationOptions = {
    body: payload.notification?.body || "Nuovo report disponibile",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: payload.data?.url || "/dashboard.html",
    tag: payload.data?.tag || "tradelia-notification",
    requireInteraction: false,
    actions: [
      {
        action: "open",
        title: "Apri Dashboard",
      },
      {
        action: "close",
        title: "Chiudi",
      },
    ],
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestisci click su notifica
self.addEventListener("notificationclick", (event) => {
  console.warn("[FCM SW] Click su notifica");

  event.notification.close();

  if (event.action === "open" || !event.action) {
    const url = event.notification.data || "/dashboard.html";
    // eslint-disable-next-line no-undef
    event.waitUntil(self.clients.openWindow(url));
  }
});

