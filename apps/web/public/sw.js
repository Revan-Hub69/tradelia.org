// Tradelia AI Service Worker for PWA functionality
const CACHE_NAME = 'tradelia-ai-v1.0.0'
const STATIC_CACHE = 'tradelia-ai-static-v1.0.0'
const DYNAMIC_CACHE = 'tradelia-ai-dynamic-v1.0.0'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/_next/static/css/',
  '/_next/static/js/',
  // Add other critical assets
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error)
      })
  )
  // Force activation
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Take control of all clients
  self.clients.claim()
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip external domains
  if (!url.origin.includes(self.location.origin)) return

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for short time
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              // Cache for 5 minutes
              const cacheResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: {
                  ...Object.fromEntries(responseClone.headers),
                  'sw-cache-time': Date.now() + (5 * 60 * 1000) // 5 minutes
                }
              })
              cache.put(request, cacheResponse)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached API response if available and not expired
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              const cacheTime = cachedResponse.headers.get('sw-cache-time')
              if (cacheTime && parseInt(cacheTime) > Date.now()) {
                return cachedResponse
              }
            }
            // Return offline fallback for API
            return new Response(
              JSON.stringify({
                error: 'Offline',
                message: 'Content not available offline. Please check your connection.'
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          })
        })
    )
    return
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.ok && response.type === 'basic') {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone)
              })
            }
            return response
          })
          .catch(() => {
            // Return offline fallback for pages
            if (request.destination === 'document') {
              return caches.match('/').then((fallbackResponse) => {
                return fallbackResponse || new Response(
                  `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>Tradelia AI - Offline</title>
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <style>
                        body {
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          background: #111827;
                          color: #f9fafb;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          min-height: 100vh;
                          margin: 0;
                          padding: 20px;
                          text-align: center;
                        }
                        .container {
                          max-width: 400px;
                        }
                        h1 {
                          color: #3b82f6;
                          margin-bottom: 1rem;
                        }
                        p {
                          color: #9ca3af;
                          line-height: 1.6;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <h1>Tradelia AI</h1>
                        <p>You're currently offline. Please check your internet connection and try again.</p>
                        <p>Academic excellence in cryptocurrency education, available when you reconnect.</p>
                      </div>
                    </body>
                  </html>
                  `,
                  {
                    headers: { 'Content-Type': 'text/html' }
                  }
                )
              })
            }

            // Return generic offline response
            return new Response(
              'Offline - Content not available',
              {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              }
            )
          })
      })
  )
})

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Retry failed requests
      syncFailedRequests()
    )
  }
})

// Periodic background sync for content updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-update') {
    event.waitUntil(
      updateContentCache()
    )
  }
})

// Push notifications (for future premium features)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})

// Helper functions
async function syncFailedRequests() {
  // Implementation for syncing failed requests
  console.log('Service Worker: Syncing failed requests')
}

async function updateContentCache() {
  // Implementation for updating content cache
  console.log('Service Worker: Updating content cache')

  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    // Update educational content, market data, etc.
    await cache.addAll([
      // Add URLs to refresh periodically
    ])
  } catch (error) {
    console.error('Service Worker: Failed to update content cache', error)
  }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
