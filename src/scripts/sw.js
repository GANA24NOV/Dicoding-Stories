// File: src/scripts/sw.js
self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};
  const title = data.title || 'Story App';
  const options = {
    body: data.message || 'Notifikasi baru dari Dicoding!',
    icon: './icons/icon-192x192.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
