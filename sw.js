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
const VERSION = "2.16.0";
const CACHE_NAME = `tradelia-ai-v${VERSION}`;
// BEST PRACTICE: Solo file che esistono realmente - rimossi file inesistenti che causavano errori
const STATIC_CACHE = [
  "/",
  "/dashboard.html",
  "/dashboard.webmanifest",
  "/accesso.html",
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
      .then((cache) => {
        // BEST PRACTICE: Gestisci errori individuali invece di fallire tutto
        return Promise.allSettled(
          STATIC_CACHE.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to cache ${url}:`, err);
              return null; // Continua anche se una risorsa fallisce
            })
          )
        );
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error("[SW] Install error:", err);
        // Non bloccare l'installazione se la cache fallisce
        return self.skipWaiting();
      })
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
    // Ottieni token da IndexedDB (se autenticato) o device ID (se guest)
    const token = await getTokenFromIndexedDB();
    const deviceId = await getDeviceIdFromIndexedDB();

    if (!token && !deviceId) {
      console.log("[SW] Nessun token o device ID disponibile, skip controllo notifiche");
      return;
    }

    const response = await fetch("/api/auth?action=notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        deviceId,
        onlyUnread: true,
        limit: 10,
      }),
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

/**
 * Ottiene token da IndexedDB (Service Worker non ha accesso a localStorage)
 */
async function getTokenFromIndexedDB() {
  return new Promise((resolve) => {
    const request = indexedDB.open("tradelia-auth", 1);

    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("tokens")) {
        resolve(null);
        return;
      }

      const transaction = db.transaction(["tokens"], "readonly");
      const store = transaction.objectStore("tokens");
      const getRequest = store.get("access-token");

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result?.value || null);
      };

      getRequest.onerror = () => {
        resolve(null);
      };
    };

    request.onerror = () => {
      resolve(null);
    };
  });
}

/**
 * Ottiene device ID da IndexedDB (per guest users)
 */
async function getDeviceIdFromIndexedDB() {
  return new Promise((resolve) => {
    const request = indexedDB.open("tradelia-auth", 1);

    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("tokens")) {
        resolve(null);
        return;
      }

      const transaction = db.transaction(["tokens"], "readonly");
      const store = transaction.objectStore("tokens");
      const getRequest = store.get("device-id");

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result?.value || null);
      };

      getRequest.onerror = () => {
        resolve(null);
      };
    };

    request.onerror = () => {
      resolve(null);
    };
  });
}
