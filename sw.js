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
  console.warn("[SW] Install");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE =====
self.addEventListener("activate", (event) => {
  console.warn("[SW] Activate");
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
// BEST PRACTICE: Validazione e sanitizzazione dati push
self.addEventListener("push", (event) => {
  console.warn("[SW] Push notification received");

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      // BEST PRACTICE: Fallback sicuro per dati non JSON
      data = { title: "Tradelia AI", body: event.data.text() || "Nuovo aggiornamento disponibile" };
    }
  }

  // BEST PRACTICE: Sanitizzazione title e body
  const title = (data.title || "Tradelia AI").substring(0, 100); // Max 100 caratteri
  const body = (data.body || "Nuovo report disponibile").substring(0, 500); // Max 500 caratteri

  // BEST PRACTICE: Sanitizzazione URL (solo URL interni)
  let notificationUrl = "/dashboard.html";
  if (data.url) {
    try {
      // Verifica che sia URL relativo o stesso dominio
      if (data.url.startsWith("/")) {
        notificationUrl = data.url;
      } else {
        const urlObj = new URL(data.url);
        if (urlObj.origin === self.location.origin) {
          notificationUrl = urlObj.pathname + urlObj.search;
        }
      }
    } catch {
      // URL non valido, usa default
      notificationUrl = "/dashboard.html";
    }
  }

  // BEST PRACTICE: Opzioni notifica con validazione
  const options = {
    body: body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: notificationUrl,
    tag: (data.tag || "tradelia-notification").substring(0, 50), // Max 50 caratteri
    requireInteraction: false,
    timestamp: Date.now(), // BEST PRACTICE: Timestamp per ordering
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

  // BEST PRACTICE: waitUntil per assicurare che notifica sia mostrata
  event.waitUntil(self.registration.showNotification(title, options));
});

// ===== NOTIFICATION CLICK =====
self.addEventListener("notificationclick", (event) => {
  console.warn("[SW] Notification click");

  event.notification.close();

  if (event.action === "open" || !event.action) {
    const url = event.notification.data || "/dashboard.html";

    event.waitUntil(self.clients.openWindow(url));
  }
});

// ===== NOTIFICATION CLOSE =====
self.addEventListener("notificationclose", () => {
  console.warn("[SW] Notification closed");
});
