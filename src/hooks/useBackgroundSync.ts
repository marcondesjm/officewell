import { useEffect, useCallback, useRef } from "react";

interface TimerState {
  eyeEndTime: number;
  stretchEndTime: number;
  waterEndTime: number;
  isRunning: boolean;
}

export const useBackgroundSync = () => {
  const keepAliveInterval = useRef<NodeJS.Timeout | null>(null);

  // Salvar estado no cache para o Service Worker acessar
  const syncTimerState = useCallback(async (state: TimerState) => {
    try {
      // Salvar no cache
      if ('caches' in window) {
        const cache = await caches.open('officewell-timers');
        const response = new Response(JSON.stringify(state));
        await cache.put('timer-state', response);
      }

      // Enviar para o Service Worker agendar os timers
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const now = Date.now();
        
        registration.active?.postMessage({
          type: 'SCHEDULE_ALL',
          eyeDelay: state.eyeEndTime - now,
          stretchDelay: state.stretchEndTime - now,
          waterDelay: state.waterEndTime - now,
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

  // Manter o Service Worker ativo com pings periódicos
  const keepServiceWorkerAlive = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Criar um canal de mensagem
        const messageChannel = new MessageChannel();
        
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
      }
    } catch (e) {
      console.log('Background sync não suportado:', e);
    }
  }, []);

  // Inicializar
  useEffect(() => {
    registerPeriodicSync();
    requestBackgroundSyncPermission();
    
    // Manter SW ativo a cada 20 segundos
    keepAliveInterval.current = setInterval(() => {
      keepServiceWorkerAlive();
    }, 20000);

    // Verificar timers ao voltar ao foco
    const handleVisibilityChange = async () => {
      if (!document.hidden && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({ type: 'CHECK_TIMERS' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [registerPeriodicSync, requestBackgroundSyncPermission, keepServiceWorkerAlive]);

  return {
    syncTimerState,
    scheduleNotification,
    requestBackgroundSyncPermission,
  };
};
