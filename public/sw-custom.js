// Service Worker customizado para notificações em segundo plano
// Versão 7.0 - Corrige acúmulo de notificações ao reabrir app

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
  combined: {
    title: "🔔 Lembretes Pendentes",
    body: "Você perdeu alguns lembretes enquanto estava fora.",
    tag: "officewell-combined"
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
let lastResumeCheck = 0; // Evita múltiplas verificações ao reabrir
let pendingOnResume = []; // Acumula notificações pendentes ao reabrir

// Intervalo para verificação contínua - 5 segundos
const CHECK_INTERVAL = 5000;
// Cooldown mínimo entre notificações do mesmo tipo - 60 segundos (evita spam)
const NOTIFICATION_COOLDOWN = 60000;
// Cooldown ao reabrir app - 3 segundos de debounce
const RESUME_DEBOUNCE = 3000;
// Máximo de tempo para considerar notificação pendente válida - 2 horas
const MAX_PENDING_AGE = 2 * 60 * 60 * 1000;

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

// Mostrar notificação individual (usado em tempo real)
async function showTimerNotification(type, isResumeCheck = false) {
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
    // Notificação do sistema
    await self.registration.showNotification(notif.title, {
      body: notif.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: notif.tag, // Mesmo tag substitui notificação anterior do mesmo tipo
      requireInteraction: false, // Menos intrusivo
      vibrate: [300, 100, 300],
      renotify: false, // Não re-notificar se já existe uma com mesmo tag
      silent: false,
      data: { type, timestamp: now },
      actions: [
        { action: 'open', title: 'Abrir' },
        { action: 'snooze', title: 'Adiar 5min' }
      ]
    });
    
    console.log(`SW: ✅ Notificação ${type} enviada`);
    
    // Só tocar som se não for verificação de retomada (evita bombardeio)
    if (!isResumeCheck) {
      try {
        const allClients = await clients.matchAll({ includeUncontrolled: true, type: 'window' });
        allClients.forEach(client => {
          client.postMessage({
            type: 'PLAY_NOTIFICATION_SOUND',
            reminderType: type,
            timestamp: now,
            repeatCount: 2,
            repeatInterval: 1000
          });
        });
      } catch (e) {}
    }
    
    return true;
  } catch (e) {
    console.error(`SW: Erro notificação ${type}:`, e);
    return false;
  }
}

// Mostrar notificação combinada (quando há múltiplos lembretes pendentes)
async function showCombinedNotification(pendingTypes) {
  if (pendingTypes.length === 0) return;
  
  const now = Date.now();
  
  // Se só tem 1 pendente, mostrar notificação normal
  if (pendingTypes.length === 1) {
    await showTimerNotification(pendingTypes[0], true);
    return;
  }
  
  // Mapear tipos para emojis
  const emojiMap = { eye: '👁️', stretch: '🤸', water: '💧' };
  const emojis = pendingTypes.map(t => emojiMap[t] || '🔔').join(' ');
  
  try {
    // Fechar notificações antigas primeiro
    const notifications = await self.registration.getNotifications();
    notifications.forEach(n => n.close());
    
    await self.registration.showNotification(`${emojis} Lembretes Pendentes`, {
      body: `Você perdeu ${pendingTypes.length} lembretes. Abra o app para continuar.`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'officewell-combined',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      renotify: true,
      data: { type: 'combined', pendingTypes, timestamp: now }
    });
    
    console.log(`SW: ✅ Notificação combinada enviada (${pendingTypes.length} pendentes)`);
    
    // Atualizar cooldown de todos os tipos
    pendingTypes.forEach(type => {
      lastNotified[type] = now;
    });
  } catch (e) {
    console.error('SW: Erro notificação combinada:', e);
  }
}

// Verificar timers e enviar notificações (verificação contínua em background)
async function checkAndNotify(isResumeCheck = false) {
  try {
    let data = null;
    
    try {
      const cache = await caches.open(TIMER_CACHE);
      const response = await cache.match('timer-state');
      if (response) {
        data = await response.json();
      }
    } catch (e) {}
    
    if (!data) {
      data = await getFromIDB('timer-state');
    }
    
    if (!data) {
      return;
    }
    
    const now = Date.now();
    
    // Verificar se os dados não estão muito antigos
    if (data.savedAt && (now - data.savedAt) > MAX_PENDING_AGE) {
      console.log('SW: Estado muito antigo, ignorando');
      return;
    }
    
    if (!data.isRunning) {
      return;
    }
    
    // Coletar timers expirados
    const expired = [];
    
    if (data.eyeEndTime <= now && (now - data.eyeEndTime) < MAX_PENDING_AGE) {
      expired.push('eye');
    }
    if (data.stretchEndTime <= now && (now - data.stretchEndTime) < MAX_PENDING_AGE) {
      expired.push('stretch');
    }
    if (data.waterEndTime <= now && (now - data.waterEndTime) < MAX_PENDING_AGE) {
      expired.push('water');
    }
    
    if (expired.length === 0) return;
    
    // Se for verificação ao reabrir app, usar notificação combinada
    if (isResumeCheck) {
      // Filtrar apenas os que não estão em cooldown
      const notInCooldown = expired.filter(type => 
        (now - (lastNotified[type] || 0)) >= NOTIFICATION_COOLDOWN
      );
      
      if (notInCooldown.length > 0) {
        await showCombinedNotification(notInCooldown);
      }
    } else {
      // Verificação normal: enviar individualmente (mas só 1 por vez para não spammar)
      for (const type of expired) {
        if ((now - (lastNotified[type] || 0)) >= NOTIFICATION_COOLDOWN) {
          await showTimerNotification(type, false);
          break; // Só uma notificação por ciclo
        }
      }
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
      // Debounce para evitar múltiplas verificações ao reabrir
      const now = Date.now();
      if (now - lastResumeCheck < RESUME_DEBOUNCE) {
        console.log('SW: Verificação em debounce, ignorando');
        return;
      }
      lastResumeCheck = now;
      
      // Verificação ao reabrir usa modo combinado
      await checkAndNotify(true);
      break;
      
    case 'APP_RESUMED':
      // App voltou ao foco - usar verificação com debounce
      const resumeNow = Date.now();
      if (resumeNow - lastResumeCheck < RESUME_DEBOUNCE) {
        return;
      }
      lastResumeCheck = resumeNow;
      await checkAndNotify(true);
      break;
      
    case 'SYNC_TIMER_STATE':
      try {
        const timerData = { ...data.state, savedAt: Date.now() };
        
        const cache = await caches.open(TIMER_CACHE);
        await cache.put('timer-state', new Response(JSON.stringify(timerData)));
        
        await saveToIDB('timer-state', timerData);
        
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
      }
      break;
      
    case 'RESET_ALL_COOLDOWNS':
      // Resetar todos os cooldowns (quando usuário interage com lembretes)
      lastNotified = { eye: 0, stretch: 0, water: 0 };
      break;
      
    case 'PING':
      event.ports?.[0]?.postMessage({ type: 'PONG', timestamp: Date.now() });
      if (!isChecking) {
        startContinuousCheck();
      }
      break;
      
    case 'TRIAL_NOTIFICATION':
      await showTrialNotification(data.notificationType, data.planName, data.daysRemaining);
      break;
      
    case 'CLEAR_NOTIFICATIONS':
      // Limpar todas as notificações do app
      try {
        const notifications = await self.registration.getNotifications();
        notifications.forEach(n => n.close());
      } catch (e) {}
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
