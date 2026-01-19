import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Chave pública VAPID (deve corresponder à do backend)
const VAPID_PUBLIC_KEY = 'BLBz9i_kKrxR_3X7M3qHf8gQ5h1n8Ew9BoN4rMqWjJK9yZvT2uP0sC6dE7fG8hI9jK0lM1nO2pQ3rS4tU5vW6xY';

// Converter string base64 para Uint8Array para uso com PushManager
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Obter ou criar session_id único para este dispositivo
function getSessionId(): string {
  let sessionId = localStorage.getItem('officewell_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('officewell_session_id', sessionId);
  }
  return sessionId;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar suporte e estado atual
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window &&
                       'Notification' in window;
      setIsSupported(supported);

      if (supported && navigator.serviceWorker.controller) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const existingSubscription = await registration.pushManager.getSubscription();
          
          if (existingSubscription) {
            setSubscription(existingSubscription);
            setIsSubscribed(true);
          }
        } catch (error) {
          console.error('Erro ao verificar subscription:', error);
        }
      }
    };

    checkSupport();
  }, []);

  // Sincronizar timer state com backend
  const syncTimerStateToBackend = useCallback(async (timerState: {
    eyeEndTime: number;
    stretchEndTime: number;
    waterEndTime: number;
    isRunning: boolean;
  }) => {
    if (!isSubscribed) return;

    const sessionId = getSessionId();

    try {
      // Upsert timer state
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
        console.error('Erro ao sincronizar timer state:', error);
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  }, [isSubscribed]);

  // Subscrever para push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push notifications não são suportadas neste navegador');
      return false;
    }

    setIsLoading(true);

    try {
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Permissão para notificações negada');
        setIsLoading(false);
        return false;
      }

      // Obter service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Criar subscription
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // Extrair chaves da subscription
      const p256dh = newSubscription.getKey('p256dh');
      const auth = newSubscription.getKey('auth');

      if (!p256dh || !auth) {
        throw new Error('Não foi possível obter chaves da subscription');
      }

      const p256dhBase64 = btoa(String.fromCharCode(...new Uint8Array(p256dh)));
      const authBase64 = btoa(String.fromCharCode(...new Uint8Array(auth)));

      const sessionId = getSessionId();

      // Salvar no Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          session_id: sessionId,
          endpoint: newSubscription.endpoint,
          p256dh: p256dhBase64,
          auth: authBase64,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'endpoint',
        });

      if (error) {
        throw new Error(`Erro ao salvar subscription: ${error.message}`);
      }

      setSubscription(newSubscription);
      setIsSubscribed(true);
      toast.success('Notificações push ativadas!', {
        description: 'Você receberá lembretes mesmo com o app fechado.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao subscrever:', error);
      toast.error('Erro ao ativar notificações push');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Cancelar subscription
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return true;

    setIsLoading(true);

    try {
      await subscription.unsubscribe();

      const sessionId = getSessionId();

      // Remover do Supabase
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('session_id', sessionId);

      // Remover timer state também
      await supabase
        .from('timer_states')
        .delete()
        .eq('session_id', sessionId);

      setSubscription(null);
      setIsSubscribed(false);
      toast.success('Notificações push desativadas');

      return true;
    } catch (error) {
      console.error('Erro ao cancelar subscription:', error);
      toast.error('Erro ao desativar notificações');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  // Testar envio de push notification
  const testPushNotification = useCallback(async () => {
    if (!isSubscribed) {
      toast.error('Ative as notificações push primeiro');
      return;
    }

    try {
      const sessionId = getSessionId();
      
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          session_id: sessionId,
          type: 'test',
          title: '🧪 Teste de Notificação',
          body: 'As notificações push estão funcionando!',
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Notificação de teste enviada!');
      } else {
        toast.error('Falha ao enviar notificação de teste');
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      toast.error('Erro ao testar notificação');
    }
  }, [isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    testPushNotification,
    syncTimerStateToBackend,
    sessionId: getSessionId(),
  };
}
