/* eslint-env serviceworker */
/* global clients */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("tradelia-cache-v1").then((cache) => {
      // Usa addAll con gestione errori - se un file fallisce, continua con gli altri
      return Promise.allSettled([
        cache.add("/").catch(() => {}),
        cache.add("/manifest.json").catch(() => {}),
        cache.add("/favicon.svg").catch(() => {}),
        cache.add("/favicon.png").catch(() => {}),
      ]).then(() => {
        // Anche se alcuni file falliscono, il service worker si installa comunque
        return self.skipWaiting();
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    // Prima elimina le cache vecchie
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== "tradelia-cache-v1")
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        // Dopo aver pulito le cache, prova a claim clients solo se il service worker è attivo
        // clients.claim() è opzionale e può essere omesso se non necessario
        if (self.registration.active) {
          return self.clients.claim().catch((error) => {
            // Se claim fallisce (es. service worker non ancora attivo), ignora l'errore
            // Il service worker funzionerà comunque, solo che non controllerà immediatamente i client
            console.warn("Could not claim clients (this is normal on first install):", error);
          });
        }
      })
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Non intercettare richieste di autenticazione, API, o reset password
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.includes("/reset-password") ||
    url.pathname.includes("/forgot-password") ||
    url.pathname.includes("/login") ||
    url.pathname.includes("/signup") ||
    url.searchParams.has("token_hash") ||
    url.searchParams.has("type")
  ) {
    // Passa direttamente alla rete senza cache per queste route
    event.respondWith(
      fetch(event.request).catch(() => {
        // Se il fetch fallisce, restituisci una risposta vuota invece di far fallire tutto
        return new Response("Network error", { status: 408 });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      // Only fetch same-origin requests to avoid CSP violations
      const url = new URL(event.request.url);
      const isSameOrigin = url.origin === self.location.origin;
      
      if (!isSameOrigin) {
        // For external resources, return a placeholder or skip caching
        return new Response("External resource not cached", { status: 408 });
      }
      
      return fetch(event.request).catch((error) => {
        // Se il fetch fallisce e non c'è cache, restituisci una risposta di errore
        console.error("Fetch failed:", error);
        return new Response("Network error", { status: 408 });
      });
    })
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }
  const data = event.data.json();

  const title = data.title || "Tradelia";
  const options = {
    body: data.body || "Nuovo aggiornamento disponibile.",
    icon: data.icon || "/favicon.png",
    badge: data.badge || "/favicon-32x32.png",
    image: data.image || undefined,
    tag: data.tag || undefined,
    data: {
      url: data.url || "/dashboard",
      id: data.id || undefined,
      type: data.type || undefined,
      ...(data.data || {}),
    },
    actions: data.actions || [],
    vibrate: data.vibrate || undefined,
    timestamp: data.timestamp || Date.now(),
    requireInteraction: data.requireInteraction || false,
    renotify: data.renotify || false,
    silent: data.silent || false,
    dir: data.dir || "ltr",
    lang: data.lang || "it",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Gestisci azioni rapide
  if (event.action === "dismiss") {
    // Utente ha cliccato "Ignora" - non fare nulla
    return;
  }

  // Azione di default o "open" - apri/focusa finestra
  const url = event.notification.data?.url || "/dashboard";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Cerca finestra esistente
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      
      // Se non c'è finestra, cerca qualsiasi finestra aperta
      for (const client of windowClients) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) {
            client.navigate(url);
          }
          return;
        }
      }
      
      // Se non ci sono finestre, aprine una nuova
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
