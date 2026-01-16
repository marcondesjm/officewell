// Service Worker customizado para notificações em segundo plano
// Versão 3.0 - Verificação contínua com setInterval

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
  },
  trial_warning: {
    title: "⏰ Seu Teste Grátis Expira em Breve!",
    body: "Restam poucos dias do seu período de teste. Não perca os recursos premium!",
    tag: "officewell-trial-warning"
  },
  trial_last_day: {
    title: "🚨 Último Dia do Teste Grátis!",
    body: "Seu período de teste expira hoje. Assine agora para continuar!",
    tag: "officewell-trial-lastday"
  },
  trial_expired: {
    title: "❌ Seu Teste Grátis Expirou",
    body: "Seu período de teste acabou. Assine para continuar usando os recursos premium.",
    tag: "officewell-trial-expired"
  }
};

// Controle de notificações já enviadas para evitar duplicação
let lastNotified = {
  eye: 0,
  stretch: 0,
  water: 0,
  trial_warning: 0,
  trial_last_day: 0,
  trial_expired: 0
};

// Intervalo de verificação ativo
let checkIntervalId = null;
const CHECK_INTERVAL = 5000; // Verificar a cada 5 segundos

// Mostrar notificação
async function showTimerNotification(type) {
  const notif = NOTIFICATION_TYPES[type];
  if (!notif) return;
  
  const now = Date.now();
  
  // Evitar notificações duplicadas (cooldown de 30 segundos)
  if (now - lastNotified[type] < 30000) {
    console.log(`SW: Notificação ${type} ignorada (cooldown)`);
    return;
  }
  
  lastNotified[type] = now;
  
  try {
    await self.registration.showNotification(notif.title, {
      body: notif.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: notif.tag,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      renotify: true,
      data: { type, timestamp: now },
      actions: [
        { action: 'open', title: 'Abrir App' },
        { action: 'snooze', title: 'Adiar 5 min' }
      ]
    });
    console.log(`SW: Notificação ${type} enviada com sucesso`);
    
    // Notificar todos os clientes sobre a notificação
    const allClients = await clients.matchAll({ includeUncontrolled: true });
    allClients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION_SENT',
        reminderType: type,
        timestamp: now
      });
    });
  } catch (e) {
    console.error(`SW: Erro ao mostrar notificação ${type}:`, e);
  }
}

// Verificar timers no cache e enviar notificações
async function checkAndNotify() {
  try {
    const cache = await caches.open('officewell-timers');
    const response = await cache.match('timer-state');
    
    if (!response) {
      console.log('SW: Nenhum estado de timer encontrado');
      return;
    }
    
    const data = await response.json();
    const now = Date.now();
    
    console.log('SW: Verificando timers...', {
      isRunning: data.isRunning,
      eyeIn: Math.round((data.eyeEndTime - now) / 1000) + 's',
      stretchIn: Math.round((data.stretchEndTime - now) / 1000) + 's',
      waterIn: Math.round((data.waterEndTime - now) / 1000) + 's'
    });
    
    if (!data.isRunning) {
      console.log('SW: Timers pausados, ignorando');
      return;
    }
    
    // Verificar cada timer
    if (data.eyeEndTime <= now) {
      await showTimerNotification('eye');
    }
    
    if (data.stretchEndTime <= now) {
      await showTimerNotification('stretch');
    }
    
    if (data.waterEndTime <= now) {
      await showTimerNotification('water');
    }
  } catch (e) {
    console.error('SW: Erro ao verificar timers:', e);
  }
}

// Iniciar verificação contínua
function startContinuousCheck() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
  }
  
  console.log('SW: Iniciando verificação contínua');
  checkIntervalId = setInterval(checkAndNotify, CHECK_INTERVAL);
  
  // Verificar imediatamente também
  checkAndNotify();
}

// Parar verificação contínua
function stopContinuousCheck() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
    console.log('SW: Verificação contínua parada');
  }
}

// Receber mensagens do app
self.addEventListener('message', async (event) => {
  console.log('SW: Mensagem recebida:', event.data?.type);
  
  if (event.data && event.data.type === 'START_CHECKING') {
    startContinuousCheck();
  }
  
  if (event.data && event.data.type === 'STOP_CHECKING') {
    stopContinuousCheck();
  }
  
  if (event.data && event.data.type === 'SCHEDULE_ALL') {
    const { isRunning } = event.data;
    
    if (isRunning) {
      startContinuousCheck();
    } else {
      stopContinuousCheck();
    }
  }
  
  if (event.data && event.data.type === 'CHECK_TIMERS') {
    await checkAndNotify();
  }
  
  if (event.data && event.data.type === 'RESET_COOLDOWN') {
    const { reminderType } = event.data;
    if (reminderType && lastNotified[reminderType]) {
      lastNotified[reminderType] = 0;
    }
  }
  
  if (event.data && event.data.type === 'PING') {
    // Manter SW ativo e responder
    event.ports?.[0]?.postMessage({ type: 'PONG', timestamp: Date.now() });
  }
  
  // Notificação de trial expirando
  if (event.data && event.data.type === 'TRIAL_NOTIFICATION') {
    const { notificationType, planName, daysRemaining } = event.data;
    await showTrialNotification(notificationType, planName, daysRemaining);
  }
});

// Mostrar notificação de trial
async function showTrialNotification(type, planName, daysRemaining) {
  const notif = NOTIFICATION_TYPES[type];
  if (!notif) return;
  
  const now = Date.now();
  
  // Cooldown de 6 horas para notificações de trial (para não irritar o usuário)
  if (now - lastNotified[type] < 6 * 60 * 60 * 1000) {
    console.log(`SW: Notificação trial ${type} ignorada (cooldown 6h)`);
    return;
  }
  
  lastNotified[type] = now;
  
  let body = notif.body;
  if (daysRemaining && daysRemaining > 0) {
    body = `Restam ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} do seu teste grátis do plano ${planName}. Não perca os recursos premium!`;
  }
  
  try {
    await self.registration.showNotification(notif.title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: notif.tag,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      renotify: true,
      data: { type: 'trial', notificationType: type, timestamp: now },
      actions: [
        { action: 'upgrade', title: 'Ver Planos' },
        { action: 'dismiss', title: 'Depois' }
      ]
    });
    console.log(`SW: Notificação trial ${type} enviada com sucesso`);
    
    // Notificar todos os clientes
    const allClients = await clients.matchAll({ includeUncontrolled: true });
    allClients.forEach(client => {
      client.postMessage({
        type: 'TRIAL_NOTIFICATION_SENT',
        notificationType: type,
        timestamp: now
      });
    });
  } catch (e) {
    console.error(`SW: Erro ao mostrar notificação trial ${type}:`, e);
  }
}

// Quando clicar na notificação
self.addEventListener('notificationclick', async (event) => {
  console.log('SW: Notificação clicada:', event.action);
  event.notification.close();
  
  const type = event.notification.data?.type;
  
  if (event.action === 'snooze' && type) {
    // Adiar por 5 minutos - resetar o cooldown após 5 min
    setTimeout(() => {
      lastNotified[type] = 0;
    }, 5 * 60 * 1000);
    
    // Notificar o app sobre o snooze
    const allClients = await clients.matchAll({ includeUncontrolled: true });
    allClients.forEach(client => {
      client.postMessage({
        type: 'SNOOZE_REQUESTED',
        reminderType: type,
        duration: 5 * 60 * 1000
      });
    });
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

// Instalação
self.addEventListener('install', (event) => {
  console.log('SW Custom v3.0: Instalado');
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', (event) => {
  console.log('SW Custom v3.0: Ativado');
  event.waitUntil(
    clients.claim().then(() => {
      // Iniciar verificação ao ativar
      startContinuousCheck();
    })
  );
});

// Manter vivo - fetch event
self.addEventListener('fetch', (event) => {
  // Não interceptar requests, apenas manter o SW ativo
});
