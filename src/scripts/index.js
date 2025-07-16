// CSS imports
import '../styles/main.css';
import App from './pages/app';
import CONFIG from './config.js'; // pastikan export default

let appInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi App
  appInstance = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const renderAppPage = async () => {
    await appInstance.renderPage();
  };

  // Jalankan render pertama
  renderAppPage();

  // Jalankan ulang jika hash berubah (navigasi)
  window.addEventListener('hashchange', renderAppPage);
});

// Minta izin notifikasi
Notification.requestPermission().then((result) => {
  if (result === 'granted') {
    console.log('✅ Notifikasi diizinkan!');
  }
});

// Fungsi bantu konversi Base64 ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Register Service Worker & Push Notification
if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('✅ Service Worker registered!', registration);

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const convertedKey = urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });

        console.log('📦 Push Subscribed!', subscription);
      }
    } catch (err) {
      console.error('❌ SW registration or push subscription failed:', err);
    }
  });
}
