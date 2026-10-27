// Service Worker para OmniMóvil - Notificaciones Push y Llamadas en Segundo Plano
const CACHE_NAME = 'omnimovil-v2';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Escuchar eventos de Notificaciones Push
self.addEventListener('push', (event) => {
    let data = { title: 'OmniMóvil', body: 'Tienes una nueva interacción en tu línea IP.' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/725/724664.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/725/724664.png',
        vibrate: [200, 100, 200, 100, 200],
        data: { url: data.url || '/' },
        actions: [
            { action: 'open', title: 'Abrir App' },
            { action: 'close', title: 'Cerrar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Manejar clic en las notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) return client.focus();
                }
                if (clients.openWindow) return clients.openWindow('/');
            })
        );
    }
});
