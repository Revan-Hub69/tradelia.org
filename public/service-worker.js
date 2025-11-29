self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('tradelia-cache-v1').then((cache) => {
      // Usa addAll con gestione errori - se un file fallisce, continua con gli altri
      return Promise.allSettled([
        cache.add('/').catch(() => {}),
        cache.add('/manifest.json').catch(() => {}),
        cache.add('/icon-192.png').catch(() => {}),
        cache.add('/icon-512.png').catch(() => {}),
      ]).then(() => {
        // Anche se alcuni file falliscono, il service worker si installa comunque
        return self.skipWaiting();
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Prima elimina le cache vecchie
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== 'tradelia-cache-v1')
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      // Dopo aver pulito le cache, prova a claim clients solo se il service worker è attivo
      // clients.claim() è opzionale e può essere omesso se non necessario
      if (self.registration.active) {
        return self.clients.claim().catch((error) => {
          // Se claim fallisce (es. service worker non ancora attivo), ignora l'errore
          // Il service worker funzionerà comunque, solo che non controllerà immediatamente i client
          console.warn('Could not claim clients (this is normal on first install):', error);
        });
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Non intercettare richieste di autenticazione, API, o reset password
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.includes('/reset-password') ||
    url.pathname.includes('/forgot-password') ||
    url.pathname.includes('/login') ||
    url.pathname.includes('/signup') ||
    url.searchParams.has('token_hash') ||
    url.searchParams.has('type')
  ) {
    // Passa direttamente alla rete senza cache per queste route
    event.respondWith(fetch(event.request).catch(() => {
      // Se il fetch fallisce, restituisci una risposta vuota invece di far fallire tutto
      return new Response('Network error', { status: 408 });
    }));
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch((error) => {
        // Se il fetch fallisce e non c'è cache, restituisci una risposta di errore
        console.error('Fetch failed:', error);
        return new Response('Network error', { status: 408 });
      });
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();

  const title = data.title || 'Tradelia';
  const options = {
    body: data.body || 'Nuovo aggiornamento disponibile.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.url ? { url: data.url } : {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        for (const client of windowClients) {
          if ('focus' in client) {
            client.focus();
            client.navigate(event.notification.data.url);
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});
