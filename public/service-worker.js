const CACHE_NAME = 'futuristic-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Add paths to your main CSS and JS bundles as they appear in the 'dist' folder
  // For Vite, these will have hashes, so this part is tricky without knowing build output.
  // A more robust SW would use tools like Workbox to handle this.
  // '/assets/index.[hash].js',
  // '/assets/index.[hash].css',
  '/manifest.json',
  '/icons/icon-192x192.png'
  // Add other icon paths here
  // '/icons/icon-72x72.png',
  // '/icons/icon-96x96.png',
  // '/icons/icon-128x128.png',
  // '/icons/icon-144x144.png',
  // '/icons/icon-152x152.png',
  // '/icons/icon-384x384.png',
  // '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        // Add main app assets (CSS, JS) here.
        // For a Vite build, these filenames will have hashes.
        // This basic SW might fail to cache them if names are not exact.
        // Consider using Workbox or a similar library for more robust caching.
        return cache.addAll(urlsToCache.filter(url => !url.includes('[hash]')));
      })
      .catch(error => {
        console.error('[ServiceWorker] Cache open/addAll failed:', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // console.log('[ServiceWorker] Fetch event for:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // console.log('[ServiceWorker] Found in cache:', event.request.url);
          return response;
        }
        // console.log('[ServiceWorker] Network request for:', event.request.url);
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // console.log('[ServiceWorker] Caching new resource: ', event.request.url);
                // Be careful not to cache everything, especially large assets or API calls not meant for offline.
                // cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(error => {
        console.error('[ServiceWorker] Fetch failed:', error);
        // You could return a custom offline page here if appropriate.
        // return caches.match('/offline.html');
      })
  );
});
