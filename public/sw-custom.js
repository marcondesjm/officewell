// Service Worker customizado para notificações em segundo plano
// Versão 2.0 - Suporte melhorado para background

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

// Armazenamento de timers agendados
let scheduledTimers = {
  eye: null,
  stretch: null,
  water: null
};

// Limpar timer existente
function clearScheduledTimer(type) {
  if (scheduledTimers[type]) {
    clearTimeout(scheduledTimers[type]);
    scheduledTimers[type] = null;
  }
}

// Mostrar notificação
function showTimerNotification(type) {
  const notif = NOTIFICATION_TYPES[type];
  if (!notif) return;
  
  self.registration.showNotification(notif.title, {
    body: notif.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: notif.tag,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    renotify: true,
    data: { type },
    actions: [
      { action: 'open', title: 'Abrir App' },
      { action: 'snooze', title: 'Adiar 5 min' }
    ]
  });
}

// Agendar notificação
function scheduleNotification(type, delay) {
  clearScheduledTimer(type);
  
  if (delay <= 0) {
    showTimerNotification(type);
    return;
  }
  
  // Limitar a 24 horas máximo
  const maxDelay = Math.min(delay, 24 * 60 * 60 * 1000);
  
  scheduledTimers[type] = setTimeout(() => {
    showTimerNotification(type);
    scheduledTimers[type] = null;
  }, maxDelay);
}

// Receber mensagens do app
self.addEventListener('message', (event) => {
  console.log('SW: Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { reminderType, delay } = event.data;
    console.log(`SW: Agendando ${reminderType} em ${delay}ms`);
    scheduleNotification(reminderType, delay);
  }
  
  if (event.data && event.data.type === 'SCHEDULE_ALL') {
    const { eyeDelay, stretchDelay, waterDelay, isRunning } = event.data;
    
    if (!isRunning) {
      // Limpar todos os timers se pausado
      clearScheduledTimer('eye');
      clearScheduledTimer('stretch');
      clearScheduledTimer('water');
      console.log('SW: Timers pausados');
      return;
    }
    
    console.log('SW: Agendando todos os timers:', { eyeDelay, stretchDelay, waterDelay });
    
    if (eyeDelay > 0) scheduleNotification('eye', eyeDelay);
    if (stretchDelay > 0) scheduleNotification('stretch', stretchDelay);
    if (waterDelay > 0) scheduleNotification('water', waterDelay);
  }
  
  if (event.data && event.data.type === 'CHECK_TIMERS') {
    checkAndNotify();
  }
  
  if (event.data && event.data.type === 'PING') {
    // Manter SW ativo
    event.ports?.[0]?.postMessage({ type: 'PONG' });
  }
});

// Verificar timers no cache
async function checkAndNotify() {
  try {
    const cache = await caches.open('officewell-timers');
    const response = await cache.match('timer-state');
    
    if (response) {
      const data = await response.json();
      const now = Date.now();
      
      if (data.isRunning) {
        if (data.eyeEndTime <= now) {
          showTimerNotification('eye');
        } else if (data.eyeEndTime > now) {
          scheduleNotification('eye', data.eyeEndTime - now);
        }
        
        if (data.stretchEndTime <= now) {
          showTimerNotification('stretch');
        } else if (data.stretchEndTime > now) {
          scheduleNotification('stretch', data.stretchEndTime - now);
        }
        
        if (data.waterEndTime <= now) {
          showTimerNotification('water');
        } else if (data.waterEndTime > now) {
          scheduleNotification('water', data.waterEndTime - now);
        }
      }
    }
  } catch (e) {
    console.log('SW: Erro ao verificar timers', e);
  }
}

// Quando clicar na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notificação clicada:', event.action);
  event.notification.close();
  
  if (event.action === 'snooze') {
    // Adiar por 5 minutos
    const type = event.notification.data?.type;
    if (type) {
      scheduleNotification(type, 5 * 60 * 1000);
    }
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

// Push notification (para futuro uso com servidor)
self.addEventListener('push', (event) => {
  console.log('SW: Push recebido');
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'Você tem um lembrete!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'OfficeWell', options)
  );
});

// Periodic sync para verificar timers em segundo plano
self.addEventListener('periodicsync', (event) => {
  console.log('SW: Periodic sync:', event.tag);
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkAndNotify());
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync:', event.tag);
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkAndNotify());
  }
});

// Manter SW ativo
self.addEventListener('install', (event) => {
  console.log('SW Custom: Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW Custom: Ativado');
  event.waitUntil(clients.claim());
  // Verificar timers ao ativar
  checkAndNotify();
});
