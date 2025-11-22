/* eslint-env serviceworker */
/**
 * Service Worker - PWA + Push Notifications
 *
 * Implements W3C Service Worker API for:
 * - Offline functionality
 * - Cache management
 * - Push notifications
 * - Automatic updates
 *
 * @version 2.0.0
 * @references
 * - W3C (2023). Service Workers. W3C Working Draft
 * - Microsoft (2024). Progressive Web Apps Best Practices
 * - Google (2024). Service Worker Cookbook
 */

// Version number - increment this to force cache update
const VERSION = "2.0.2";
const CACHE_NAME = `tradelia-ai-v${VERSION}`;
const STATIC_CACHE = [
  "/",
  "/dashboard.html",
  "/dashboard.webmanifest",
  "/archivio/index.html",
  "/archivio/dashboard.html",
  "/admin/index.html",
  "/admin/tokens.html",
  "/admin/requests.html",
  "/admin/reports.html",
  "/admin/users.html",
  "/accesso.html",
  "/report/assets/css/tokens.css",
  "/assets/css/global-header.css",
  "/archivio/assets/css/archive.css",
  "/archivio/assets/css/dashboard.css",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/favicon.png",
];

// ===== INSTALL =====
self.addEventListener("install", (event) => {
  console.log("[SW] Install");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE =====
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        // Notify all clients about the update
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "SW_UPDATED",
              version: VERSION,
            });
          });
        });
      })
  );
});

// ===== MESSAGE HANDLER =====
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ===== FETCH =====
self.addEventListener("fetch", (event) => {
  // Solo cache per risorse statiche, non per API
  if (event.request.url.includes("/api/")) {
    return; // Non cache API
  }

  // Network-first strategy for HTML pages to ensure fresh content
  if (event.request.headers.get("accept").includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response for offline use
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// ===== PUSH NOTIFICATIONS =====
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: "Tradelia AI", body: event.data.text() };
    }
  }

  const title = data.title || "Tradelia AI";
  const options = {
    body: data.body || "Nuovo report disponibile",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: data.url || "/archivio/dashboard.html",
    tag: data.tag || "tradelia-notification",
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

  event.waitUntil(self.registration.showNotification(title, options));
});

// ===== NOTIFICATION CLICK =====
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click");

  event.notification.close();

  if (event.action === "open" || !event.action) {
    const url = event.notification.data || "/dashboard.html";

    event.waitUntil(self.clients.openWindow(url));
  }
});

// ===== NOTIFICATION CLOSE =====
self.addEventListener("notificationclose", () => {
  console.log("[SW] Notification closed");
});

// ===== PERIODIC BACKGROUND SYNC =====
// Permette al Service Worker di controllare notifiche anche quando la PWA è chiusa
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-notifications") {
    console.log("[SW] Periodic sync: checking notifications");
    event.waitUntil(checkNotificationsInBackground());
  }
});

/**
 * Controlla notifiche in background (chiamato periodicamente dal Service Worker)
 */
async function checkNotificationsInBackground() {
  try {
    // Ottieni token dall'IndexedDB o da un messaggio dal client
    // Per semplicità, usiamo un endpoint API che non richiede token
    // (o possiamo salvare il token in IndexedDB quando l'utente si autentica)

    const response = await fetch("/api/notifications?action=check-background", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("[SW] Errore controllo notifiche:", response.status);
      return;
    }

    const data = await response.json();

    if (data.notifications && data.notifications.length > 0) {
      // Mostra notifiche per ogni nuova notifica
      data.notifications.forEach((notification) => {
        const title = notification.title || "Tradelia";
        const options = {
          body: notification.message || notification.body || "Nuova notifica",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          data: "/dashboard.html#notifications",
          tag: `notification-${notification.id}`,
          requireInteraction: false,
        };

        self.registration.showNotification(title, options);
      });
    }
  } catch (error) {
    console.warn("[SW] Errore controllo notifiche background:", error);
  }
}
