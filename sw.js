const CACHE_NAME = 'afro-gospel-stream-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://raw.githubusercontent.com/Omoluabi1003/afro-gospel-stream/main/Neo-Soul.jpg',
  'https://raw.githubusercontent.com/Omoluabi1003/afro-gospel-stream/main/FaithandB.jpg',
  // Cache a few instrumental tracks for offline listening (to keep cache size manageable)
  'https://raw.githubusercontent.com/Omoluabi1003/afro-gospel-stream/main/Am%20grateful%20Lord%20(Instrumental).mp3',
  'https://raw.githubusercontent.com/Omoluabi1003/afro-gospel-stream/main/Holy%20Vibes%20Only%20(Instrumental).mp3',
  'https://raw.githubusercontent.com/Omoluabi1003/afro-gospel-stream/main/Recognize%20Me%20(Instrumental).mp3',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install event: Cache the specified assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(error => {
        console.error('Cache addAll failed:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Serve cached assets or fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if available
      if (response) {
        return response;
      }
      // Fetch from network and cache dynamically for non-pre-cached resources
      return fetch(event.request).then(networkResponse => {
        // Don't cache failed requests or non-GET requests
        if (!networkResponse || networkResponse.status !== 200 || event.request.method !== 'GET') {
          return networkResponse;
        }
        // Cache the new response
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Fallback for offline (e.g., return offline page or cached index.html)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});