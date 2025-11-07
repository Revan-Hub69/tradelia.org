// /sw.js
// Service Worker - PWA + Push Notifications

const CACHE_NAME = 'tradelia-ai-v1';
const STATIC_CACHE = [
  '/',
  '/archivio/index.html',
  '/archivio/dashboard.html',
  '/report/assets/css/tokens.css',
  '/archivio/assets/css/archive.css',
  '/archivio/assets/css/dashboard.css'
];

// ===== INSTALL =====
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
    .then(() => self.clients.claim())
  );
});

// ===== FETCH =====
self.addEventListener('fetch', (event) => {
  // Solo cache per risorse statiche, non per API
  if (event.request.url.includes('/api/')) {
    return; // Non cache API
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Tradelia AI', body: event.data.text() };
    }
  }
  
  const title = data.title || 'Tradelia AI';
  const options = {
    body: data.body || 'Nuovo report disponibile',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: data.url || '/archivio/dashboard.html',
    tag: data.tag || 'tradelia-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Apri Dashboard'
      },
      {
        action: 'close',
        title: 'Chiudi'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const url = event.notification.data || '/archivio/dashboard.html';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// ===== NOTIFICATION CLOSE =====
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

