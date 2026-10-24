const CACHE_NAME = 'omnimovil-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdnjs.cloudflare.com/ajax/libs/jssip/3.10.0/jssip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de respuesta: Red primero, luego Caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Manejo de Notificaciones Push para Llamadas y Mensajes
self.addEventListener('push', (event) => {
  let data = { title: 'OmniMovil', body: 'Tienes una nueva actualización' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/3059/3059494.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3059/3059494.png',
    vibrate: [200, 100, 200],
    data: { url: './' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Al hacer clic en la notificación, abre la App
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
