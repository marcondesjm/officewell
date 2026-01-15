// Service Worker customizado para notificações em segundo plano

const NOTIFICATION_TYPES = {
  eye: {
    title: "👁️ Descanso Visual",
    body: "Olhe para longe por 20 segundos. Seus olhos agradecem!",
    tag: "officewell-eye"
  },
  stretch: {
    title: "🤸 Hora de Alongar", 
    body: "Levante-se e movimente seu corpo. Você merece essa pausa!",
    tag: "officewell-stretch"
  },
  water: {
    title: "💧 Hidrate-se",
    body: "Beba um copo de água agora. Mantenha-se saudável!",
    tag: "officewell-water"
  }
};

// Verificar timers periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { reminderType, delay } = event.data;
    
    setTimeout(() => {
      self.registration.showNotification(
        NOTIFICATION_TYPES[reminderType].title,
        {
          body: NOTIFICATION_TYPES[reminderType].body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: NOTIFICATION_TYPES[reminderType].tag,
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200],
          renotify: true,
          actions: [
            { action: 'open', title: 'Abrir App' },
            { action: 'dismiss', title: 'Fechar' }
          ]
        }
      );
    }, delay);
  }
  
  if (event.data && event.data.type === 'CHECK_TIMERS') {
    checkAndNotify();
  }
});

// Verificar timers no localStorage
async function checkAndNotify() {
  try {
    // Ler dados do IndexedDB ou cache
    const cache = await caches.open('officewell-timers');
    const response = await cache.match('timer-state');
    
    if (response) {
      const data = await response.json();
      const now = Date.now();
      
      if (data.isRunning) {
        if (data.eyeEndTime <= now) {
          showTimerNotification('eye');
        }
        if (data.stretchEndTime <= now) {
          showTimerNotification('stretch');
        }
        if (data.waterEndTime <= now) {
          showTimerNotification('water');
        }
      }
    }
  } catch (e) {
    console.log('SW: Erro ao verificar timers', e);
  }
}

function showTimerNotification(type) {
  const notif = NOTIFICATION_TYPES[type];
  self.registration.showNotification(notif.title, {
    body: notif.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: notif.tag,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    renotify: true
  });
}

// Quando clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Abrir ou focar na janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Periodic sync para verificar timers em segundo plano
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkAndNotify());
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkAndNotify());
  }
});
