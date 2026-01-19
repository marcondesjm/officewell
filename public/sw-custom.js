// Service Worker customizado para notificações em segundo plano
// Versão 6.0 - Notificações agressivas para mobile em background

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
    body: "Restam poucos dias do seu período de teste.",
    tag: "officewell-trial-warning"
  },
  trial_last_day: {
    title: "🚨 Último Dia do Teste Grátis!",
    body: "Seu período de teste expira hoje.",
    tag: "officewell-trial-lastday"
  },
  trial_expired: {
    title: "❌ Seu Teste Grátis Expirou",
    body: "Assine para continuar usando os recursos premium.",
    tag: "officewell-trial-expired"
  }
};

// Estado persistente
let lastNotified = { eye: 0, stretch: 0, water: 0 };
let isChecking = false;
let checkTimeoutId = null;

// Intervalo mais curto para mobile - 3 segundos
const CHECK_INTERVAL = 3000;
// Cooldown mínimo entre notificações do mesmo tipo - 25 segundos
const NOTIFICATION_COOLDOWN = 25000;

// Cache name para estado dos timers
const TIMER_CACHE = 'officewell-timers-v2';

// Salvar estado no IndexedDB para persistência máxima
async function saveToIDB(key, value) {
  try {
    const db = await openIDB();
    const tx = db.transaction('timers', 'readwrite');
    await tx.objectStore('timers').put({ key, value, timestamp: Date.now() });
    await tx.done;
  } catch (e) {
    console.log('SW: IDB save error:', e.message);
  }
}

async function getFromIDB(key) {
  try {
    const db = await openIDB();
    const tx = db.transaction('timers', 'readonly');
    const result = await tx.objectStore('timers').get(key);
    return result?.value;
  } catch (e) {
    console.log('SW: IDB get error:', e.message);
    return null;
  }
}

function openIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('officewell-sw', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('timers')) {
        db.createObjectStore('timers', { keyPath: 'key' });
      }
    };
  });
}

// Mostrar notificação com máxima agressividade
async function showTimerNotification(type) {
  const notif = NOTIFICATION_TYPES[type];
  if (!notif) return false;
  
  const now = Date.now();
  
  // Verificar cooldown
  if (now - (lastNotified[type] || 0) < NOTIFICATION_COOLDOWN) {
    console.log(`SW: ${type} em cooldown`);
    return false;
  }
  
  lastNotified[type] = now;
  
  try {
    // Notificação do sistema com todas as opções para mobile
    await self.registration.showNotification(notif.title, {
      body: notif.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: notif.tag,
      requireInteraction: true,
      vibrate: [500, 200, 500, 200, 500, 300, 500, 200, 500],
      renotify: true,
      silent: false,
      data: { type, timestamp: now },
      actions: [
        { action: 'open', title: 'Abrir' },
        { action: 'snooze', title: 'Adiar 5min' }
      ]
    });
    
    console.log(`SW: ✅ Notificação ${type} enviada`);
    
    // Notificar clientes para tocar som (se estiverem ativos)
    try {
      const allClients = await clients.matchAll({ includeUncontrolled: true, type: 'window' });
      allClients.forEach(client => {
        client.postMessage({
          type: 'PLAY_NOTIFICATION_SOUND',
          reminderType: type,
          timestamp: now,
          repeatCount: 3,
          repeatInterval: 1500
        });
        client.postMessage({
          type: 'NOTIFICATION_SENT',
          reminderType: type,
          timestamp: now
        });
      });
    } catch (e) {}
    
    return true;
  } catch (e) {
    console.error(`SW: Erro notificação ${type}:`, e);
    return false;
  }
}

// Verificar timers e enviar notificações
async function checkAndNotify() {
  try {
    // Tentar obter estado do Cache API primeiro
    let data = null;
    
    try {
      const cache = await caches.open(TIMER_CACHE);
      const response = await cache.match('timer-state');
      if (response) {
        data = await response.json();
      }
    } catch (e) {}
    
    // Fallback para IndexedDB
    if (!data) {
      data = await getFromIDB('timer-state');
    }
    
    if (!data) {
      console.log('SW: Sem estado de timer');
      return;
    }
    
    const now = Date.now();
    
    // Verificar se os dados não estão muito antigos (máx 1 hora)
    if (data.savedAt && (now - data.savedAt) > 60 * 60 * 1000) {
      console.log('SW: Estado muito antigo, ignorando');
      return;
    }
    
    if (!data.isRunning) {
      console.log('SW: Timers pausados');
      return;
    }
    
    console.log('SW: Verificando...', {
      eye: Math.round((data.eyeEndTime - now) / 1000) + 's',
      stretch: Math.round((data.stretchEndTime - now) / 1000) + 's',
      water: Math.round((data.waterEndTime - now) / 1000) + 's'
    });
    
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
    console.error('SW: Erro checkAndNotify:', e);
  }
}

// Loop de verificação usando setTimeout recursivo (mais confiável que setInterval em SW)
function scheduleNextCheck() {
  if (!isChecking) return;
  
  checkTimeoutId = setTimeout(async () => {
    await checkAndNotify();
    scheduleNextCheck();
  }, CHECK_INTERVAL);
}

function startContinuousCheck() {
  if (isChecking) return;
  
  console.log('SW: 🚀 Iniciando verificação contínua');
  isChecking = true;
  
  // Verificar imediatamente
  checkAndNotify();
  
  // Agendar próxima verificação
  scheduleNextCheck();
}

function stopContinuousCheck() {
  console.log('SW: ⏹️ Parando verificação');
  isChecking = false;
  if (checkTimeoutId) {
    clearTimeout(checkTimeoutId);
    checkTimeoutId = null;
  }
}

// Receber mensagens do app
self.addEventListener('message', async (event) => {
  const { type, ...data } = event.data || {};
  console.log('SW: Mensagem:', type);
  
  switch (type) {
    case 'START_CHECKING':
      startContinuousCheck();
      break;
      
    case 'STOP_CHECKING':
      stopContinuousCheck();
      break;
      
    case 'SCHEDULE_ALL':
      if (data.isRunning) {
        startContinuousCheck();
      } else {
        stopContinuousCheck();
      }
      break;
      
    case 'CHECK_TIMERS':
      await checkAndNotify();
      break;
      
    case 'SYNC_TIMER_STATE':
      // Salvar estado em múltiplos lugares para redundância
      try {
        const timerData = { ...data.state, savedAt: Date.now() };
        
        // Cache API
        const cache = await caches.open(TIMER_CACHE);
        await cache.put('timer-state', new Response(JSON.stringify(timerData)));
        
        // IndexedDB
        await saveToIDB('timer-state', timerData);
        
        console.log('SW: Estado sincronizado');
        
        // Se timers estão rodando, garantir que verificação está ativa
        if (data.state?.isRunning) {
          startContinuousCheck();
        }
      } catch (e) {
        console.error('SW: Erro ao sincronizar estado:', e);
      }
      break;
      
    case 'RESET_COOLDOWN':
      if (data.reminderType && lastNotified[data.reminderType] !== undefined) {
        lastNotified[data.reminderType] = 0;
        console.log(`SW: Cooldown ${data.reminderType} resetado`);
      }
      break;
      
    case 'PING':
      event.ports?.[0]?.postMessage({ type: 'PONG', timestamp: Date.now() });
      // Manter verificação ativa
      if (!isChecking) {
        startContinuousCheck();
      }
      break;
      
    case 'TRIAL_NOTIFICATION':
      await showTrialNotification(data.notificationType, data.planName, data.daysRemaining);
      break;
  }
});

// Mostrar notificação de trial
async function showTrialNotification(type, planName, daysRemaining) {
  const notif = NOTIFICATION_TYPES[type];
  if (!notif) return;
  
  let body = notif.body;
  if (daysRemaining > 0) {
    body = `Restam ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} do seu teste grátis do plano ${planName}.`;
  }
  
  try {
    await self.registration.showNotification(notif.title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: notif.tag,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      renotify: true
    });
  } catch (e) {
    console.error('SW: Erro notificação trial:', e);
  }
}

// Quando clicar na notificação
self.addEventListener('notificationclick', async (event) => {
  event.notification.close();
  
  const type = event.notification.data?.type;
  
  if (event.action === 'snooze' && type) {
    // Adiar por 5 minutos
    setTimeout(() => {
      if (lastNotified[type] !== undefined) {
        lastNotified[type] = 0;
      }
    }, 5 * 60 * 1000);
    
    // Notificar app
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
  
  // Abrir/focar app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// Push notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'OfficeWell', {
      body: data.body || 'Você tem um lembrete!',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true
    })
  );
});

// Periodic sync (quando disponível)
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

// Instalação - skipWaiting para ativar imediatamente
self.addEventListener('install', (event) => {
  console.log('SW v6.0: Instalando...');
  self.skipWaiting();
});

// Ativação - claim clients e iniciar verificação
self.addEventListener('activate', (event) => {
  console.log('SW v6.0: Ativando...');
  event.waitUntil(
    clients.claim().then(() => {
      // Tentar iniciar verificação se houver estado salvo
      checkAndNotify().then(() => {
        startContinuousCheck();
      });
    })
  );
});

// Fetch event - necessário para manter SW ativo
self.addEventListener('fetch', (event) => {
  // Não interceptar, apenas manter vivo
});
