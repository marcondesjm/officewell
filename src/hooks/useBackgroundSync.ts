import { useEffect, useCallback, useRef } from "react";

interface TimerState {
  eyeEndTime: number;
  stretchEndTime: number;
  waterEndTime: number;
  isRunning: boolean;
}

// Som de notificação base64 (beep)
const NOTIFICATION_SOUND_BASE64 = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2televV9vkJ2dlH5ebGuNpZ+QdE5HX4WipJR4WlFqgpWWh3RSS2mFk5OGdVZQaIGRkIN2WFNngJCPgXhbVWZ/kI6Bd1xXZn+QjYB4XVhngJCNgHhdWGd/j42AeF1YZ3+PjYB4XVhnf4+Nf3hdWGd/j42AeF5YZ3+PjYB4Xlhnf4+NgHheWGd/j42AeF5YaH+PjYB4Xlhof4+NgHheWGh/j4yAeF5YaH+PjIB4Xlhof4+MgHheWGh/j4yAeF5YaH+PjIB4Xlhof4+MgHheWGh/j4yAeF5YaH+PjIB4Xlhof4+MgHheWGh/j4yAeF5YaH+PjIF4XlsA';

// Função para tocar um beep simples
const playSingleBeep = async (volume: number = 0.8): Promise<void> => {
  try {
    // Método 1: Audio API
    const audio = new Audio(NOTIFICATION_SOUND_BASE64);
    audio.volume = volume;
    await audio.play();
    return;
  } catch (e) {
    // fallback silencioso
  }

  try {
    // Método 2: AudioContext (mais confiável para apps minimizados)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const audioContext = new AudioContextClass();
      
      // Criar oscilador para beep
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Tom de alerta
      oscillator.frequency.value = 880; // A5
      oscillator.type = 'sine';
      
      // Envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      // Segundo beep (parte da mesma série)
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1046; // C6
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0, audioContext.currentTime);
        gain2.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.4);
      }, 200);
    }
  } catch (e) {
    console.log('AudioContext falhou:', e);
  }
};

// Função para tocar som de notificação N vezes
const playNotificationSound = async (
  volume: number = 0.8, 
  repeatCount: number = 1, 
  repeatInterval: number = 1500
): Promise<void> => {
  console.log(`Tocando som ${repeatCount}x com intervalo de ${repeatInterval}ms`);
  
  for (let i = 0; i < repeatCount; i++) {
    await playSingleBeep(volume);
    
    // Esperar antes de tocar novamente (exceto na última repetição)
    if (i < repeatCount - 1) {
      await new Promise(resolve => setTimeout(resolve, repeatInterval));
    }
  }
};

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

  // Ouvir mensagens do Service Worker - SOM APENAS QUANDO TIMER ACABA
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = async (event: MessageEvent) => {
      // Verificar se som está habilitado nas configurações
      const checkSoundEnabled = (): boolean => {
        try {
          const saved = localStorage.getItem("reminderConfig");
          if (saved) {
            const config = JSON.parse(saved);
            return config.soundEnabled !== false; // default true
          }
        } catch {}
        return true;
      };

      // Tocar som APENAS quando o SW solicitar (timer chegou a zero) E som estiver habilitado
      if (event.data?.type === 'PLAY_NOTIFICATION_SOUND') {
        if (checkSoundEnabled()) {
          const repeatCount = event.data.repeatCount || 3; // Padrão 3 vezes
          const repeatInterval = event.data.repeatInterval || 1500; // 1.5 segundos
          
          console.log(`Timer ${event.data.reminderType} acabou - tocando som ${repeatCount}x`);
          await playNotificationSound(0.9, repeatCount, repeatInterval);
          
          // Vibrar também (padrão triplo)
          if (navigator.vibrate) {
            navigator.vibrate([400, 200, 400, 200, 400, 500, 400, 200, 400, 200, 400, 500, 400, 200, 400, 200, 400]);
          }
        } else {
          console.log(`Timer ${event.data.reminderType} acabou - som desativado`);
        }
      }
      
      // NÃO tocar som em NOTIFICATION_SENT para evitar duplicação
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
