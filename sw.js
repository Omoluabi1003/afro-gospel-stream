const CACHE_NAME = 'afro-gospel-stream-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/futuristic_theme.css', // Added new theme file
  '/script.js',
  '/data.js', // Added data file
  // External assets
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Roboto:wght@300;400;500&display=swap', // Updated font
  // Local Cover Art
  '/Neo-Soul.jpg',
  '/FaithandB.jpg',
  // Local MP3s for 'Holy Vibes Only' album
  '/Am grateful Lord (Instrumental).mp3',
  '/Am grateful Lord.mp3',
  '/Holy Vibes Only (Instrumental).mp3',
  '/Holy Vibes Only.mp3',
  '/Na So God Dey Do.mp3',
  '/Na You.mp3',
  '/Oil No Dry.mp3',
  '/Oluwa You Too Good.mp3',
  '/Recognize Me (Instrumental).mp3',
  '/Recognize Me.mp3',
  '/Rotten Fruit.mp3',
  '/Still I Rise to Praise.mp3',
  '/Testimony No Dey Finish.mp3',
  // Local MP3s for 'Needs' album
  '/Disappoint People Early.mp3',
  '/Faded Hues.mp3',
  '/False Alarm.mp3',
  '/Glorified Caterpillar.mp3',
  '/Hear the Earth Speak.mp3',
  '/Let Me Be Seen.mp3',
  '/Little Things.mp3',
  '/Needs.mp3',
  '/Not This Road.mp3',
  '/Permitted Blessing.mp3',
  '/Right In Front.mp3',
  '/Scaffolding.mp3',
  '/Stay Sincere.mp3',
  '/Thank You For The Wound.mp3',
  '/The Weight You Carry.mp3',
  // Icons and Manifest
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
  // Note: The remote URLs for tracks from 'Kindness' and 'Street Sense' albums are not pre-cached here.
  // The service worker's fetch handler will cache them dynamically if they are requested during playback.
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