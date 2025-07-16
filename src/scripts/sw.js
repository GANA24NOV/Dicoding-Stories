const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/Dicoding-Stories/',
  '/Dicoding-Stories/index.html',
  '/Dicoding-Stories/app.bundle.js',
  '/Dicoding-Stories/app.css',
  '/Dicoding-Stories/manifest.json',
  '/Dicoding-Stories/icons/icon-192x192.png',
  '/Dicoding-Stories/icons/icon-512x512.png',
];

// ✅ Install service worker & cache file statis
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ✅ Activate service worker & hapus cache lama
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: activated');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ✅ Fetch handler: ambil dari cache jika offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch((err) => {
          console.error('Fetch failed; returning fallback.', err);
          return caches.match('/Dicoding-Stories/index.html');
        })
      );
    })
  );
});

// ✅ Push Notification handler
self.addEventListener('push', function (event) {
  console.log('📩 Push event received');

  let data = {};
  try {
    data = event.data?.json() || {};
  } catch (e) {
    data = { title: 'Story App', message: event.data.text() };
  }

  const title = data.title || 'Story App';
  const options = {
    body: data.message || 'Notifikasi baru dari Dicoding!',
    icon: '/Dicoding-Stories/icons/icon-192x192.png',
    badge: '/Dicoding-Stories/icons/icon-192x192.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
