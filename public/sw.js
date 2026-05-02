// Service Worker for Safian Healthcare PWA
// Increment version to force cache refresh when code changes
const CACHE_VERSION = '2';
const CACHE_NAME = `safian-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `safian-runtime-v${CACHE_VERSION}`;

// Assets to cache on install (only local assets)
const PRECACHE_ASSETS = [
  '/shop',
  '/about',
  '/contact',
  '/offline',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache assets one by one to avoid failing if one fails
        return Promise.allSettled(
          PRECACHE_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.log(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  // Handle skip waiting message
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Always respond to prevent "message channel closed" errors
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({ success: true });
  }
});

// Fetch event - network first with proper cache invalidation
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests (like Supabase images)
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API routes, admin routes, and auth routes from caching
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/admin') || 
      url.pathname.startsWith('/_next/data/')) {
    return;
  }

  // For navigation requests (page loads) - NETWORK FIRST
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.ok && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone).catch(() => {});
            });
          }
          return response;
        })
        .catch(() => {
          // Only use cache if network fails (offline)
          return caches.match(request)
            .then((cachedResponse) => cachedResponse || caches.match('/offline'));
        })
    );
    return;
  }

  // For static assets (_next/static/*) - cache first for performance
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch(() => {});
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For all other requests, just let them through normally
  // Don't intercept - let browser handle them
});

// Background sync for offline orders (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  // Placeholder for syncing offline orders when connection is restored
  console.log('Syncing offline orders...');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Safian Healthcare';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon.jpeg',
    badge: '/icon.jpeg',
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
