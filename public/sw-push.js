// Service Worker para Push Notifications - OfficeWell
// Gerencia recebimento de push, exibição de notificações e cliques

const SW_VERSION = '1.0.0';
const SUPABASE_URL = 'https://khydpwxwmfkxzyeuuqej.supabase.co';

// ==================== INSTALAÇÃO ====================
self.addEventListener('install', function(event) {
  console.log('[SW-Push] Installing version:', SW_VERSION);
  self.skipWaiting();
});

// ==================== ATIVAÇÃO ====================
self.addEventListener('activate', function(event) {
  console.log('[SW-Push] Activating version:', SW_VERSION);
  event.waitUntil(
    clients.claim().then(() => {
      return clients.matchAll({ type: 'window' }).then(clientList => {
        clientList.forEach(client => {
          client.postMessage({ 
            type: 'SW_ACTIVATED', 
            sw: 'sw-push.js',
            version: SW_VERSION 
          });
        });
      });
    })
  );
});

// ==================== RECEBIMENTO DE PUSH ====================
self.addEventListener('push', function(event) {
  console.log('[SW-Push] Push received:', event);
  const receivedAt = new Date().toISOString();

  // Payload padrão
  let data = {
    title: 'OfficeWell',
    body: 'Você tem uma nova notificação',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: { url: '/', receivedAt }
  };

  // Tentar parsear payload do push
  try {
    if (event.data) {
      const payload = event.data.json();
      console.log('[SW-Push] Payload parsed:', payload);
      
      data = {
        title: payload.title || data.title,
        body: payload.body || payload.message || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        data: { 
          ...(payload.data || {}), 
          url: payload.data?.url || payload.url || '/',
          receivedAt,
          type: payload.type || 'general'
        },
        tag: payload.tag || 'officewell-' + Date.now(),
        requireInteraction: payload.requireInteraction || false,
      };
    }
  } catch (e) {
    console.error('[SW-Push] Error parsing push data:', e);
    if (event.data) {
      // Tentar como texto simples
      try {
        data.body = event.data.text();
      } catch (e2) {
        console.error('[SW-Push] Error reading push as text:', e2);
      }
    }
  }

  // Opções da notificação
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    vibrate: [200, 100, 200],
    renotify: true,
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' }
    ]
  };

  // Ícones específicos por tipo
  const notificationType = data.data?.type;
  if (notificationType === 'water') {
    options.icon = '/pwa-192x192.png'; // Poderia usar um ícone específico de água
    options.badge = '/pwa-192x192.png';
  } else if (notificationType === 'stretch') {
    options.icon = '/pwa-192x192.png';
  } else if (notificationType === 'eye') {
    options.icon = '/pwa-192x192.png';
  }

  event.waitUntil(
    Promise.all([
      // Exibir notificação
      self.registration.showNotification(data.title, options),
      
      // Notificar clientes abertos
      clients.matchAll({ type: 'window' }).then(clientList => {
        clientList.forEach(client => {
          client.postMessage({ 
            type: 'PUSH_RECEIVED', 
            receivedAt, 
            title: data.title,
            notificationType: data.data?.type
          });
        });
      }),
      
      // Registrar telemetria no backend
      sendTelemetry(receivedAt, data.title)
    ])
  );
});

// ==================== CLIQUE NA NOTIFICAÇÃO ====================
self.addEventListener('notificationclick', function(event) {
  console.log('[SW-Push] Notification clicked:', event.action);
  event.notification.close();

  // Se clicou em "dismiss", apenas fechar
  if (event.action === 'dismiss') {
    return;
  }

  // URL para abrir
  const urlToOpen = event.notification.data?.url || '/';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Verificar se já existe uma janela aberta
      for (let client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navegar para a URL e focar
          return client.navigate(fullUrl).then(client => client.focus());
        }
      }
      // Se não existe janela, abrir uma nova
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// ==================== FECHAR NOTIFICAÇÃO ====================
self.addEventListener('notificationclose', function(event) {
  console.log('[SW-Push] Notification closed');
});

// ==================== MENSAGENS DO FRONTEND ====================
self.addEventListener('message', function(event) {
  console.log('[SW-Push] Message received:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: SW_VERSION });
  }
  
  if (event.data?.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification('🧪 Teste de Notificação', {
      body: 'As notificações push estão funcionando corretamente!',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'test-notification',
      data: { url: '/', type: 'test' }
    });
  }
});

// ==================== HELPERS ====================

// Enviar telemetria para o backend
async function sendTelemetry(receivedAt, title) {
  try {
    // Tentar obter device_token ou session_id do IndexedDB
    const deviceToken = await getFromIndexedDB('device_token');
    const sessionId = await getFromIndexedDB('session_id');
    
    if (!deviceToken && !sessionId) {
      console.log('[SW-Push] No device_token or session_id found for telemetry');
      return;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/push-telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_token: deviceToken,
        session_id: sessionId,
        received_at: receivedAt,
        title: title
      })
    });

    if (!response.ok) {
      console.error('[SW-Push] Telemetry failed:', response.status);
    }
  } catch (error) {
    console.error('[SW-Push] Error sending telemetry:', error);
  }
}

// Acessar IndexedDB do Service Worker
function getFromIndexedDB(key) {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('officewell-push', 1);
      
      request.onerror = () => resolve(null);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }
      };
      
      request.onsuccess = (event) => {
        try {
          const db = event.target.result;
          const transaction = db.transaction(['config'], 'readonly');
          const store = transaction.objectStore('config');
          const getRequest = store.get(key);
          
          getRequest.onsuccess = () => {
            resolve(getRequest.result?.value || null);
          };
          
          getRequest.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      };
    } catch (e) {
      resolve(null);
    }
  });
}

console.log('[SW-Push] Push service worker loaded, version:', SW_VERSION);
