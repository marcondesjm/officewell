import { useEffect, useCallback } from "react";

interface TimerState {
  eyeEndTime: number;
  stretchEndTime: number;
  waterEndTime: number;
  isRunning: boolean;
}

export const useBackgroundSync = () => {
  // Salvar estado no cache para o Service Worker acessar
  const syncTimerState = useCallback(async (state: TimerState) => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('officewell-timers');
        const response = new Response(JSON.stringify(state));
        await cache.put('timer-state', response);
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

  // Solicitar permissão de background sync
  const requestBackgroundSyncPermission = useCallback(async () => {
    try {
      // Solicitar permissão de notificações primeiro
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
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
  }, [registerPeriodicSync, requestBackgroundSyncPermission]);

  return {
    syncTimerState,
    scheduleNotification,
    requestBackgroundSyncPermission,
  };
};
