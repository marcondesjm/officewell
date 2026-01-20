import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ==================== TIPOS ====================
interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  session_id: string;
  device_token: string;
  device_name: string;
  is_active: boolean;
}

interface DiagnosticsData {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  serviceWorkerActive: boolean;
  serviceWorkerUrl: string | null;
  pushManagerSupported: boolean;
  notificationApiSupported: boolean;
  hasLocalSubscription: boolean;
  hasDbSubscription: boolean;
  deviceToken: string | null;
  sessionId: string | null;
  lastPushReceived: string | null;
  lastBackendTelemetry: string | null;
}

// ==================== HELPERS ====================

// Gerar/Obter session_id único
function getSessionId(): string {
  let sessionId = localStorage.getItem('officewell_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('officewell_session_id', sessionId);
  }
  return sessionId;
}

// Gerar device token único
function getOrCreateDeviceToken(): string {
  let deviceToken = localStorage.getItem('officewell_device_token');
  if (!deviceToken) {
    deviceToken = `device_${crypto.randomUUID()}`;
    localStorage.setItem('officewell_device_token', deviceToken);
    // Também salvar no IndexedDB para o SW acessar
    saveToIndexedDB('device_token', deviceToken);
    saveToIndexedDB('session_id', getSessionId());
  }
  return deviceToken;
}

// Converter ArrayBuffer para base64url
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Converter base64url para Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Salvar no IndexedDB (para o Service Worker acessar)
async function saveToIndexedDB(key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('officewell-push', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = () => {
      try {
        const db = request.result;
        const transaction = db.transaction(['config'], 'readwrite');
        const store = transaction.objectStore('config');
        store.put({ key, value });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      } catch (e) {
        reject(e);
      }
    };
  });
}

// Obter nome do dispositivo
function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown Device';
}

// ==================== HOOK ====================
export function usePushNotificationsNew() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [hasActiveDbSubscription, setHasActiveDbSubscription] = useState(false);
  const [lastPushReceived, setLastPushReceived] = useState<string | null>(null);
  const [lastBackendTelemetry, setLastBackendTelemetry] = useState<string | null>(null);
  
  const vapidPublicKeyRef = useRef<string | null>(null);
  const subscriptionRef = useRef<PushSubscription | null>(null);
  const serviceWorkerRef = useRef<ServiceWorkerRegistration | null>(null);

  // ==================== INICIALIZAÇÃO ====================
  useEffect(() => {
    const init = async () => {
      // Verificar suporte
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window &&
                       'Notification' in window;
      setIsSupported(supported);

      if (!supported) {
        setPermission('unsupported');
        return;
      }

      setPermission(Notification.permission);
      setDeviceToken(getOrCreateDeviceToken());

      // Buscar chave VAPID do backend
      try {
        const { data, error } = await supabase.functions.invoke('get-vapid-public-key');
        if (!error && data?.configured && data?.publicKey) {
          vapidPublicKeyRef.current = data.publicKey;
          setIsConfigured(true);
          console.log('[PushNotifications] VAPID key configured');
        } else {
          console.warn('[PushNotifications] VAPID not configured:', data?.error || error);
        }
      } catch (e) {
        console.error('[PushNotifications] Error fetching VAPID key:', e);
      }

      // Verificar subscription existente
      await checkExistingSubscription();
      await checkDbSubscription();
    };

    init();

    // Listener para mensagens do Service Worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_RECEIVED') {
        setLastPushReceived(event.data.receivedAt);
        console.log('[PushNotifications] Push received:', event.data);
      }
      if (event.data?.type === 'SW_ACTIVATED') {
        console.log('[PushNotifications] SW activated:', event.data);
        checkExistingSubscription();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  // ==================== VERIFICAÇÕES ====================
  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (!registration) {
        setIsSubscribed(false);
        return;
      }

      serviceWorkerRef.current = registration;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        subscriptionRef.current = subscription;
        setIsSubscribed(true);
        console.log('[PushNotifications] Found existing subscription');
      } else {
        setIsSubscribed(false);
      }
    } catch (e) {
      console.error('[PushNotifications] Error checking subscription:', e);
      setIsSubscribed(false);
    }
  };

  const checkDbSubscription = async () => {
    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && data) {
        setHasActiveDbSubscription(true);
        setLastBackendTelemetry(data.last_push_received_at);
      } else {
        setHasActiveDbSubscription(false);
      }
    } catch (e) {
      console.error('[PushNotifications] Error checking DB subscription:', e);
    }
  };

  // ==================== REGISTRAR SERVICE WORKER ====================
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
    // Primeiro, limpar SWs antigos que possam conflitar
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      if (reg.active?.scriptURL.includes('sw-push.js')) {
        serviceWorkerRef.current = reg;
        return reg;
      }
    }

    // Registrar novo SW
    const registration = await navigator.serviceWorker.register('/sw-push.js', {
      scope: '/'
    });

    // Aguardar ativação
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('SW activation timeout')), 10000);
      
      if (registration.active) {
        clearTimeout(timeout);
        resolve();
        return;
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });
    });

    serviceWorkerRef.current = registration;
    return registration;
  };

  // ==================== SUBSCRIBE ====================
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push notifications não são suportadas neste navegador');
      return false;
    }

    if (!isConfigured || !vapidPublicKeyRef.current) {
      toast.error('Sistema de notificações não configurado. Execute generate-vapid-keys.');
      return false;
    }

    setIsLoading(true);

    try {
      // Solicitar permissão
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error('Permissão para notificações negada');
        return false;
      }

      // Registrar Service Worker
      const registration = await registerServiceWorker();
      console.log('[PushNotifications] SW registered');

      // Criar subscription
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKeyRef.current);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });

      subscriptionRef.current = subscription;

      // Extrair chaves
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');

      if (!p256dh || !auth) {
        throw new Error('Não foi possível obter chaves da subscription');
      }

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64Url(p256dh),
        auth: arrayBufferToBase64Url(auth),
        session_id: getSessionId(),
        device_token: getOrCreateDeviceToken(),
        device_name: getDeviceName(),
        is_active: true
      };

      // Salvar no banco
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'session_id'
        });

      if (error) {
        throw new Error(`Erro ao salvar subscription: ${error.message}`);
      }

      setIsSubscribed(true);
      setHasActiveDbSubscription(true);
      
      toast.success('🔔 Notificações push ativadas!', {
        description: 'Você receberá lembretes mesmo com o app fechado.'
      });

      return true;
    } catch (error) {
      console.error('[PushNotifications] Subscribe error:', error);
      toast.error('Erro ao ativar notificações push');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isConfigured]);

  // ==================== UNSUBSCRIBE ====================
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Cancelar subscription local
      if (subscriptionRef.current) {
        await subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      // Marcar como inativo no banco
      const sessionId = getSessionId();
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('session_id', sessionId);

      setIsSubscribed(false);
      setHasActiveDbSubscription(false);
      
      toast.success('Notificações push desativadas');
      return true;
    } catch (error) {
      console.error('[PushNotifications] Unsubscribe error:', error);
      toast.error('Erro ao desativar notificações');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== RESET E RESUBSCRIBE ====================
  const resetAndResubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Cancelar todas as subscriptions existentes
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }

      // Limpar do banco
      const sessionId = getSessionId();
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('session_id', sessionId);

      // Limpar estados
      subscriptionRef.current = null;
      setIsSubscribed(false);
      setHasActiveDbSubscription(false);

      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 500));

      // Resubscrever
      return await subscribe();
    } catch (error) {
      console.error('[PushNotifications] Reset error:', error);
      toast.error('Erro ao resetar notificações');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscribe]);

  // ==================== TESTES ====================
  const testLocalNotification = useCallback(async () => {
    if (Notification.permission !== 'granted') {
      toast.error('Permissão de notificação não concedida');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('🧪 Teste Local', {
        body: 'Esta é uma notificação de teste local!',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-local-' + Date.now(),
        data: { url: '/' }
      });
      toast.success('Notificação local enviada!');
    } catch (error) {
      console.error('[PushNotifications] Local test error:', error);
      toast.error('Erro ao enviar notificação local');
    }
  }, []);

  const sendTestPushToDevice = useCallback(async () => {
    if (!hasActiveDbSubscription) {
      toast.error('Você precisa estar inscrito para testar');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-push-to-device', {
        body: {
          session_id: getSessionId(),
          title: '🔔 Teste Push Real',
          body: 'Notificação enviada do servidor!',
          url: '/'
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Notificação push enviada!');
      } else {
        toast.error(`Falha: ${data?.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('[PushNotifications] Push test error:', error);
      toast.error('Erro ao enviar push de teste');
    }
  }, [hasActiveDbSubscription]);

  // ==================== SINCRONIZAÇÃO ====================
  const forceSyncSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      await checkExistingSubscription();
      await checkDbSubscription();

      // Se temos subscription local mas não no banco, salvar
      if (subscriptionRef.current && !hasActiveDbSubscription) {
        const p256dh = subscriptionRef.current.getKey('p256dh');
        const auth = subscriptionRef.current.getKey('auth');

        if (p256dh && auth) {
          const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
              endpoint: subscriptionRef.current.endpoint,
              p256dh: arrayBufferToBase64Url(p256dh),
              auth: arrayBufferToBase64Url(auth),
              session_id: getSessionId(),
              device_token: getOrCreateDeviceToken(),
              device_name: getDeviceName(),
              is_active: true
            }, {
              onConflict: 'session_id'
            });

          if (!error) {
            setHasActiveDbSubscription(true);
            toast.success('Subscription sincronizada com o banco!');
          }
        }
      }

      toast.success('Sincronização concluída');
    } catch (error) {
      console.error('[PushNotifications] Sync error:', error);
      toast.error('Erro na sincronização');
    } finally {
      setIsLoading(false);
    }
  }, [hasActiveDbSubscription]);

  // ==================== DIAGNÓSTICOS ====================
  const getDiagnostics = useCallback(async (): Promise<DiagnosticsData> => {
    const sw = serviceWorkerRef.current;
    
    return {
      isSupported,
      permission,
      serviceWorkerActive: !!sw?.active,
      serviceWorkerUrl: sw?.active?.scriptURL || null,
      pushManagerSupported: 'PushManager' in window,
      notificationApiSupported: 'Notification' in window,
      hasLocalSubscription: !!subscriptionRef.current,
      hasDbSubscription: hasActiveDbSubscription,
      deviceToken,
      sessionId: getSessionId(),
      lastPushReceived,
      lastBackendTelemetry
    };
  }, [isSupported, permission, hasActiveDbSubscription, deviceToken, lastPushReceived, lastBackendTelemetry]);

  // ==================== SYNC COM TIMER STATE (compatibilidade) ====================
  const syncTimerStateToBackend = useCallback(async (timerState: {
    eyeEndTime: number;
    stretchEndTime: number;
    waterEndTime: number;
    isRunning: boolean;
  }) => {
    if (!isSubscribed) return;

    try {
      const sessionId = getSessionId();
      const { error } = await supabase
        .from('timer_states')
        .upsert({
          session_id: sessionId,
          eye_end_time: timerState.eyeEndTime,
          stretch_end_time: timerState.stretchEndTime,
          water_end_time: timerState.waterEndTime,
          is_running: timerState.isRunning,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'session_id',
        });

      if (error) {
        console.error('[PushNotifications] Error syncing timer state:', error);
      }
    } catch (error) {
      console.error('[PushNotifications] Sync timer error:', error);
    }
  }, [isSubscribed]);

  return {
    // Estados
    isSupported,
    isSubscribed,
    isConfigured,
    permission,
    isLoading,
    deviceToken,
    hasActiveDbSubscription,
    lastPushReceived,
    lastBackendTelemetry,
    sessionId: getSessionId(),
    
    // Ações
    subscribe,
    unsubscribe,
    resetAndResubscribe,
    testLocalNotification,
    sendTestPushToDevice,
    forceSyncSubscription,
    getDiagnostics,
    syncTimerStateToBackend
  };
}
