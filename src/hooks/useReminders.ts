import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useBackgroundSync } from "./useBackgroundSync";
import { useReminderStats } from "./useReminderStats";
import { useWorkSchedule } from "./useWorkSchedule";

export interface ReminderConfig {
  eyeInterval: number;
  stretchInterval: number;
  waterInterval: number;
}

export interface ReminderState {
  eyeTimeLeft: number;
  stretchTimeLeft: number;
  waterTimeLeft: number;
  isRunning: boolean;
  showStretchModal: boolean;
  showEyeModal: boolean;
  showWaterModal: boolean;
}

interface TimerTimestamps {
  eyeEndTime: number;
  stretchEndTime: number;
  waterEndTime: number;
  lastPausedAt: number | null;
}

// Valores padrão conforme NR-17 (Ergonomia no Trabalho)
// - Pausas visuais: 20 min (regra 20-20-20)
// - Pausas para alongamento: 50 min (conforme lei)
// - Hidratação: 60 min
const DEFAULT_CONFIG: ReminderConfig = {
  eyeInterval: 20,      // Regra 20-20-20 para descanso visual
  stretchInterval: 50,  // NR-17: pausas ergonômicas a cada 50 min
  waterInterval: 60,    // Hidratação regular a cada hora
};

const loadConfig = (): ReminderConfig => {
  try {
    const saved = localStorage.getItem("reminderConfig");
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
};

const loadTimestamps = (config: ReminderConfig): TimerTimestamps => {
  try {
    const saved = localStorage.getItem("timerTimestamps");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  
  const now = Date.now();
  return {
    eyeEndTime: now + config.eyeInterval * 60 * 1000,
    stretchEndTime: now + config.stretchInterval * 60 * 1000,
    waterEndTime: now + config.waterInterval * 60 * 1000,
    lastPausedAt: null,
  };
};

const loadIsRunning = (): boolean => {
  try {
    const saved = localStorage.getItem("timersRunning");
    return saved !== "false";
  } catch {
    return true;
  }
};

export const useReminders = () => {
  // Carregar valores iniciais de forma síncrona
  const initialConfig = useRef(loadConfig());
  const { syncTimerState, resetNotificationCooldown } = useBackgroundSync();
  const { stats, recordCompletion } = useReminderStats();
  const {
    isWithinWorkHours, 
    getWorkStatus, 
    schedule, 
    updateSchedule, 
    needsConfiguration, 
    getTimeUntilNextWork,
    calculateOptimalIntervals,
    getRemainingWorkMinutes 
  } = useWorkSchedule();
  
  const [config, setConfig] = useState<ReminderConfig>(initialConfig.current);
  const [timestamps, setTimestamps] = useState<TimerTimestamps>(() => loadTimestamps(initialConfig.current));
  const [isRunning, setIsRunning] = useState<boolean>(loadIsRunning);
  const [state, setState] = useState<ReminderState>({
    eyeTimeLeft: 0,
    stretchTimeLeft: 0,
    waterTimeLeft: 0,
    isRunning: true,
    showStretchModal: false,
    showEyeModal: false,
    showWaterModal: false,
  });

  const notifiedRef = useRef({ eye: false, stretch: false, water: false });
  const hasAppliedOptimalIntervalsRef = useRef(false);

  // Salvar config
  useEffect(() => {
    localStorage.setItem("reminderConfig", JSON.stringify(config));
  }, [config]);

  // Salvar timestamps e sincronizar com Service Worker
  useEffect(() => {
    localStorage.setItem("timerTimestamps", JSON.stringify(timestamps));
    
    // Sincronizar estado para o Service Worker poder verificar em segundo plano
    syncTimerState({
      eyeEndTime: timestamps.eyeEndTime,
      stretchEndTime: timestamps.stretchEndTime,
      waterEndTime: timestamps.waterEndTime,
      isRunning,
    });
  }, [timestamps, isRunning, syncTimerState]);

  // Salvar estado running
  useEffect(() => {
    localStorage.setItem("timersRunning", String(isRunning));
  }, [isRunning]);

  // Aplicar intervalos otimizados quando o expediente começa
  useEffect(() => {
    if (schedule.isConfigured && getWorkStatus() === 'working' && !hasAppliedOptimalIntervalsRef.current) {
      const optimalIntervals = calculateOptimalIntervals();
      
      // Atualizar config com intervalos otimizados
      setConfig(prev => ({
        eyeInterval: optimalIntervals.eyeInterval,
        stretchInterval: optimalIntervals.stretchInterval,
        waterInterval: optimalIntervals.waterInterval,
      }));
      
      // Resetar timers com novos intervalos
      const now = Date.now();
      setTimestamps({
        eyeEndTime: now + optimalIntervals.eyeInterval * 60 * 1000,
        stretchEndTime: now + optimalIntervals.stretchInterval * 60 * 1000,
        waterEndTime: now + optimalIntervals.waterInterval * 60 * 1000,
        lastPausedAt: null,
      });
      
      hasAppliedOptimalIntervalsRef.current = true;
    }
    
    // Reset flag quando sai do horário de trabalho para reaplicar no próximo dia
    if (getWorkStatus() === 'after_work') {
      hasAppliedOptimalIntervalsRef.current = false;
    }
  }, [schedule.isConfigured, getWorkStatus, calculateOptimalIntervals]);

  const showNotification = useCallback((type: "eye" | "stretch" | "water") => {
    const notifications = {
      eye: {
        title: "👁️ Descanso Visual",
        description: "Olhe para longe por 20 segundos. Seus olhos agradecem!",
      },
      stretch: {
        title: "🤸 Hora de Alongar",
        description: "Levante-se e movimente seu corpo. Você merece essa pausa!",
      },
      water: {
        title: "💧 Hidrate-se",
        description: "Beba um copo de água agora. Mantenha-se saudável!",
      },
    };

    const notification = notifications[type];

    // Tocar som de alerta múltiplas vezes para garantir que o usuário ouça
    const playAlertSound = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioContext = new AudioContextClass();
          
          // Primeiro beep - mais grave
          const osc1 = audioContext.createOscillator();
          const gain1 = audioContext.createGain();
          osc1.connect(gain1);
          gain1.connect(audioContext.destination);
          osc1.frequency.value = 880;
          osc1.type = "sine";
          gain1.gain.setValueAtTime(0.5, audioContext.currentTime);
          gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          osc1.start(audioContext.currentTime);
          osc1.stop(audioContext.currentTime + 0.3);

          // Segundo beep - mais agudo (após 300ms)
          setTimeout(() => {
            try {
              const osc2 = audioContext.createOscillator();
              const gain2 = audioContext.createGain();
              osc2.connect(gain2);
              gain2.connect(audioContext.destination);
              osc2.frequency.value = 1046;
              osc2.type = "sine";
              gain2.gain.setValueAtTime(0.5, audioContext.currentTime);
              gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
              osc2.start(audioContext.currentTime);
              osc2.stop(audioContext.currentTime + 0.3);
            } catch {}
          }, 300);

          // Terceiro beep - mais agudo ainda (após 600ms)
          setTimeout(() => {
            try {
              const osc3 = audioContext.createOscillator();
              const gain3 = audioContext.createGain();
              osc3.connect(gain3);
              gain3.connect(audioContext.destination);
              osc3.frequency.value = 1320;
              osc3.type = "sine";
              gain3.gain.setValueAtTime(0.6, audioContext.currentTime);
              gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
              osc3.start(audioContext.currentTime);
              osc3.stop(audioContext.currentTime + 0.4);
            } catch {}
          }, 600);
        }
      } catch (e) {
        console.log("Som não disponível");
      }
    };

    // Tocar som
    playAlertSound();

    // Vibrar no mobile - padrão mais longo
    try {
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300, 100, 300]);
      }
    } catch (e) {}

    toast.success(notification.title, {
      description: notification.description,
      duration: 8000,
    });

    // Notificação do navegador (funciona em segundo plano no celular)
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        const notifOptions: NotificationOptions & { renotify?: boolean; vibrate?: number[] } = {
          body: notification.description,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `officewell-${type}`,
          requireInteraction: true,
          silent: false,
        };
        
        // Propriedades extras para mobile (podem não existir em todos os navegadores)
        (notifOptions as any).renotify = true;
        (notifOptions as any).vibrate = [300, 100, 300, 100, 300, 100, 300];
        
        const notif = new Notification(notification.title, notifOptions);
        
        // Fechar automaticamente após 15 segundos
        setTimeout(() => notif.close(), 15000);
        
        // Abrir o app ao clicar na notificação
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      }
    } catch (e) {
      console.log("Notificação não disponível:", e);
    }
  }, []);

  // Timer principal - agora respeita horário de trabalho
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const withinWorkHours = isWithinWorkHours();
      const workStatus = getWorkStatus();

      // Se estiver fora do horário de trabalho, pausar os timers
      if (!withinWorkHours && schedule.isConfigured) {
        const timeUntilWork = getTimeUntilNextWork();
        return {
          eyeTimeLeft: timeUntilWork > 0 ? timeUntilWork : 0,
          stretchTimeLeft: timeUntilWork > 0 ? timeUntilWork : 0,
          waterTimeLeft: timeUntilWork > 0 ? timeUntilWork : 0,
          isRunning: false,
          workStatus,
        };
      }

      if (!isRunning) {
        const pauseTime = timestamps.lastPausedAt || now;
        return {
          eyeTimeLeft: Math.max(0, Math.floor((timestamps.eyeEndTime - pauseTime) / 1000)),
          stretchTimeLeft: Math.max(0, Math.floor((timestamps.stretchEndTime - pauseTime) / 1000)),
          waterTimeLeft: Math.max(0, Math.floor((timestamps.waterEndTime - pauseTime) / 1000)),
          isRunning: false,
          workStatus,
        };
      }

      const eyeTimeLeft = Math.max(0, Math.floor((timestamps.eyeEndTime - now) / 1000));
      const stretchTimeLeft = Math.max(0, Math.floor((timestamps.stretchEndTime - now) / 1000));
      const waterTimeLeft = Math.max(0, Math.floor((timestamps.waterEndTime - now) / 1000));

      return { eyeTimeLeft, stretchTimeLeft, waterTimeLeft, isRunning: true, workStatus };
    };

    const checkAndNotify = () => {
      // Não notificar fora do horário de trabalho
      if (!isRunning || !isWithinWorkHours()) return;
      
      const now = Date.now();

      if (timestamps.eyeEndTime <= now && !notifiedRef.current.eye) {
        notifiedRef.current.eye = true;
        showNotification("eye");
        setState(prev => ({ ...prev, showEyeModal: true }));
      } else if (timestamps.eyeEndTime > now) {
        notifiedRef.current.eye = false;
      }

      if (timestamps.stretchEndTime <= now && !notifiedRef.current.stretch) {
        notifiedRef.current.stretch = true;
        showNotification("stretch");
        setState(prev => ({ ...prev, showStretchModal: true }));
      } else if (timestamps.stretchEndTime > now) {
        notifiedRef.current.stretch = false;
      }

      if (timestamps.waterEndTime <= now && !notifiedRef.current.water) {
        notifiedRef.current.water = true;
        showNotification("water");
        setState(prev => ({ ...prev, showWaterModal: true }));
      } else if (timestamps.waterEndTime > now) {
        notifiedRef.current.water = false;
      }
    };

    setState(prev => ({ ...prev, ...calculateTimeLeft() }));
    checkAndNotify();

    const intervalId = setInterval(() => {
      setState(prev => ({ ...prev, ...calculateTimeLeft() }));
      checkAndNotify();
    }, 1000);

    const handleVisibility = () => {
      if (!document.hidden) {
        setState(prev => ({ ...prev, ...calculateTimeLeft() }));
        checkAndNotify();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [isRunning, timestamps, config, showNotification, isWithinWorkHours, getWorkStatus, schedule.isConfigured, getTimeUntilNextWork]);

  const toggleRunning = useCallback(() => {
    const now = Date.now();

    setIsRunning(prev => {
      if (!prev) {
        // Retomando
        setTimestamps(ts => {
          if (ts.lastPausedAt) {
            const pausedDuration = now - ts.lastPausedAt;
            return {
              eyeEndTime: ts.eyeEndTime + pausedDuration,
              stretchEndTime: ts.stretchEndTime + pausedDuration,
              waterEndTime: ts.waterEndTime + pausedDuration,
              lastPausedAt: null,
            };
          }
          return ts;
        });
      } else {
        // Pausando
        setTimestamps(ts => ({ ...ts, lastPausedAt: now }));
      }
      return !prev;
    });
  }, []);

  const resetTimers = useCallback(() => {
    const now = Date.now();
    setTimestamps({
      eyeEndTime: now + config.eyeInterval * 60 * 1000,
      stretchEndTime: now + config.stretchInterval * 60 * 1000,
      waterEndTime: now + config.waterInterval * 60 * 1000,
      lastPausedAt: isRunning ? null : now,
    });
    notifiedRef.current = { eye: false, stretch: false, water: false };
    toast.success("Timers reiniciados!");
  }, [config, isRunning]);

  const updateConfig = useCallback((newConfig: Partial<ReminderConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    try {
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            toast.success("🔔 Notificações ativadas com sucesso!");
            // Re-registrar service worker para garantir notificações
            if ('serviceWorker' in navigator) {
              const registration = await navigator.serviceWorker.ready;
              registration.active?.postMessage({ type: 'START_CHECKING' });
            }
          } else {
            toast.info("Notificações serão exibidas apenas no app");
          }
        } else if (Notification.permission === "granted") {
          toast.success("🔔 Notificações já estão ativas!");
          // Refresh do service worker para garantir funcionamento
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            await registration.update();
            registration.active?.postMessage({ type: 'START_CHECKING' });
          }
        } else {
          toast.error("⚠️ Notificações bloqueadas. Ative nas configurações do navegador.");
        }
      }
    } catch {
      toast.info("Notificações serão exibidas apenas no app");
    }
  }, []);

  // Auto-solicitar permissão e manter notificações ativas
  useEffect(() => {
    const initNotifications = async () => {
      if ("Notification" in window && Notification.permission === "default") {
        // Aguardar um pouco antes de pedir permissão (melhor UX)
        setTimeout(async () => {
          try {
            await Notification.requestPermission();
          } catch {}
        }, 2000);
      }
      
      // Refresh periódico do service worker para manter notificações ativas
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({ type: 'START_CHECKING' });
        
        // Refresh a cada 5 minutos para garantir que o SW continue ativo
        const refreshInterval = setInterval(async () => {
          try {
            const reg = await navigator.serviceWorker.ready;
            await reg.update();
            reg.active?.postMessage({ type: 'CHECK_TIMERS' });
          } catch {}
        }, 5 * 60 * 1000);
        
        return () => clearInterval(refreshInterval);
      }
    };
    
    initNotifications();
  }, []);

  const closeStretchModal = useCallback(() => {
    setState(prev => ({ ...prev, showStretchModal: false }));
    recordCompletion("stretch");
    // Reiniciar timer após confirmar
    const now = Date.now();
    setTimestamps(prev => ({
      ...prev,
      stretchEndTime: now + config.stretchInterval * 60 * 1000,
    }));
    notifiedRef.current.stretch = false;
    // Resetar cooldown no SW para próxima notificação
    resetNotificationCooldown("stretch");
  }, [recordCompletion, config.stretchInterval, resetNotificationCooldown]);

  const closeEyeModal = useCallback(() => {
    setState(prev => ({ ...prev, showEyeModal: false }));
    recordCompletion("eye");
    // Reiniciar timer após confirmar
    const now = Date.now();
    setTimestamps(prev => ({
      ...prev,
      eyeEndTime: now + config.eyeInterval * 60 * 1000,
    }));
    notifiedRef.current.eye = false;
    // Resetar cooldown no SW para próxima notificação
    resetNotificationCooldown("eye");
  }, [recordCompletion, config.eyeInterval, resetNotificationCooldown]);

  const closeWaterModal = useCallback(() => {
    setState(prev => ({ ...prev, showWaterModal: false }));
    recordCompletion("water");
    // Reiniciar timer após confirmar
    const now = Date.now();
    setTimestamps(prev => ({
      ...prev,
      waterEndTime: now + config.waterInterval * 60 * 1000,
    }));
    notifiedRef.current.water = false;
    // Resetar cooldown no SW para próxima notificação
    resetNotificationCooldown("water");
  }, [recordCompletion, config.waterInterval, resetNotificationCooldown]);

  return {
    config,
    state,
    stats,
    toggleRunning,
    resetTimers,
    updateConfig,
    requestNotificationPermission,
    closeStretchModal,
    closeEyeModal,
    closeWaterModal,
    // Work schedule
    workSchedule: schedule,
    updateWorkSchedule: updateSchedule,
    needsWorkScheduleConfig: needsConfiguration,
    getWorkStatus,
    getRemainingWorkMinutes,
    optimalIntervals: calculateOptimalIntervals(),
  };
};
