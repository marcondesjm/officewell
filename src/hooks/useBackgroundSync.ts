import { useEffect, useCallback, useRef } from "react";

interface TimerState {
  eyeEndTime: number;
  stretchEndTime: number;
  waterEndTime: number;
  isRunning: boolean;
}

export const useBackgroundSync = () => {
  const keepAliveInterval = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Salvar estado no cache para o Service Worker acessar
  const syncTimerState = useCallback(async (state: TimerState) => {
    try {
      // Salvar no cache
      if ('caches' in window) {
        const cache = await caches.open('officewell-timers');
        const response = new Response(JSON.stringify({
          ...state,
          updatedAt: Date.now()
        }));
        await cache.put('timer-state', response);
      }

      // Enviar para o Service Worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        registration.active?.postMessage({
          type: 'SCHEDULE_ALL',
          isRunning: state.isRunning,
        });
      }
    } catch (e) {
      console.log('Erro ao sincronizar estado:', e);
    }
  }, []);

  // Registrar periodic sync para verificação em segundo plano
  const registerPeriodicSync = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator && 'periodicSync' in (navigator as any)) {
        const registration = await navigator.serviceWorker.ready;
        
        // Verificar permissão
        const status = await (navigator as any).permissions.query({
          name: 'periodic-background-sync',
        });
        
        if (status.state === 'granted') {
          await (registration as any).periodicSync.register('check-reminders', {
            minInterval: 60 * 1000, // 1 minuto
          });
          console.log('Periodic sync registrado');
        }
      }
    } catch (e) {
      console.log('Periodic sync não suportado:', e);
    }
  }, []);

  // Agendar notificação via Service Worker
  const scheduleNotification = useCallback(async (type: 'eye' | 'stretch' | 'water', delay: number) => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          reminderType: type,
          delay,
        });
      }
    } catch (e) {
      console.log('Erro ao agendar notificação:', e);
    }
  }, []);

  // Resetar cooldown de notificação no SW
  const resetNotificationCooldown = useCallback(async (type: 'eye' | 'stretch' | 'water') => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({
          type: 'RESET_COOLDOWN',
          reminderType: type,
        });
      }
    } catch (e) {
      console.log('Erro ao resetar cooldown:', e);
    }
  }, []);

  // Manter o Service Worker ativo com pings periódicos
  const keepServiceWorkerAlive = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Criar um canal de mensagem
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data?.type === 'PONG') {
            console.log('SW respondeu ao ping');
          }
        };
        
        registration.active?.postMessage(
          { type: 'PING' },
          [messageChannel.port2]
        );
      }
    } catch (e) {
      console.log('Erro ao manter SW ativo:', e);
    }
  }, []);

  // Solicitar permissão de background sync
  const requestBackgroundSyncPermission = useCallback(async () => {
    try {
      // Solicitar permissão de notificações primeiro
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('Permissão de notificação:', permission);
      }

      // Registrar background sync
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        if ('sync' in registration) {
          await (registration as any).sync.register('check-reminders');
          console.log('Background sync registrado');
        }
        
        // Iniciar verificação contínua no SW
        registration.active?.postMessage({ type: 'START_CHECKING' });
      }
    } catch (e) {
      console.log('Background sync não suportado:', e);
    }
  }, []);

  // Ouvir mensagens do Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_SENT') {
        console.log(`Notificação ${event.data.reminderType} enviada pelo SW`);
      }
      if (event.data?.type === 'SNOOZE_REQUESTED') {
        console.log(`Snooze solicitado para ${event.data.reminderType}`);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Inicializar
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    registerPeriodicSync();
    requestBackgroundSyncPermission();
    
    // Manter SW ativo a cada 10 segundos
    keepAliveInterval.current = setInterval(() => {
      keepServiceWorkerAlive();
    }, 10000);

    // Verificar timers ao voltar ao foco
    const handleVisibilityChange = async () => {
      if (!document.hidden && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({ type: 'CHECK_TIMERS' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [registerPeriodicSync, requestBackgroundSyncPermission, keepServiceWorkerAlive]);

  return {
    syncTimerState,
    scheduleNotification,
    requestBackgroundSyncPermission,
    resetNotificationCooldown,
  };
};
