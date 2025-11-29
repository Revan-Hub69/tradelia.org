self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('tradelia-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
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
    return fetch(event.request);
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
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
