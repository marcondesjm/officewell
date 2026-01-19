import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useBackgroundSync } from "./useBackgroundSync";
import { useReminderStats } from "./useReminderStats";
import { useWorkSchedule } from "./useWorkSchedule";

export type NotificationTone = 'soft-beep' | 'chime' | 'bell' | 'digital' | 'gentle' | 'alert';

export interface ReminderConfig {
  eyeInterval: number;
  stretchInterval: number;
  waterInterval: number;
  soundEnabled: boolean;
  soundVolume: number; // 0-100
  soundForEye: boolean;
  soundForStretch: boolean;
  soundForWater: boolean;
  notificationTone: NotificationTone;
  notifyOnResume: boolean; // Notificar ao retomar o app
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
  soundEnabled: true,   // Som de notificação ativado por padrão
  soundVolume: 70,      // Volume padrão 70%
  soundForEye: true,    // Tocar som para descanso visual
  soundForStretch: true, // Tocar som para alongamento
  soundForWater: true,  // Tocar som para hidratação
  notificationTone: 'soft-beep', // Tom padrão
  notifyOnResume: false, // Não notificar ao retomar por padrão (evita modais inesperados)
};

// Configurações de tons de notificação
const NOTIFICATION_TONES: Record<NotificationTone, { frequencies: number[]; durations: number[]; type: OscillatorType; pattern: 'sequential' | 'chord' }> = {
  'soft-beep': {
    frequencies: [880, 1046, 1320],
    durations: [0.3, 0.3, 0.4],
    type: 'sine',
    pattern: 'sequential'
  },
  'chime': {
    frequencies: [523, 659, 784, 1047],
    durations: [0.4, 0.3, 0.3, 0.5],
    type: 'sine',
    pattern: 'sequential'
  },
  'bell': {
    frequencies: [440, 880, 1320],
    durations: [0.5, 0.4, 0.6],
    type: 'triangle',
    pattern: 'sequential'
  },
  'digital': {
    frequencies: [800, 1000, 800, 1200],
    durations: [0.15, 0.15, 0.15, 0.3],
    type: 'square',
    pattern: 'sequential'
  },
  'gentle': {
    frequencies: [392, 523, 659],
    durations: [0.6, 0.5, 0.7],
    type: 'sine',
    pattern: 'sequential'
  },
  'alert': {
    frequencies: [1000, 1200, 1000, 1400],
    durations: [0.2, 0.2, 0.2, 0.4],
    type: 'sawtooth',
    pattern: 'sequential'
  }
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
      const parsed = JSON.parse(saved);
      const now = Date.now();
      
      // Validar que os timestamps são números válidos e não estão muito no passado
      // Se um timer expirou há mais de 5 minutos, significa que o app ficou muito tempo fechado
      // Nesse caso, resetar apenas os timers expirados
      const maxExpiredTime = 5 * 60 * 1000; // 5 minutos
      
      const isValidTimestamp = (ts: number) => {
        return typeof ts === 'number' && !isNaN(ts) && ts > 0;
      };
      
      // Se todos os timestamps são válidos, usar os salvos
      if (isValidTimestamp(parsed.eyeEndTime) && 
          isValidTimestamp(parsed.stretchEndTime) && 
          isValidTimestamp(parsed.waterEndTime)) {
        
        // Ajustar timestamps que expiraram há muito tempo (mais de 5 min)
        const eyeEndTime = (parsed.eyeEndTime < now - maxExpiredTime) 
          ? now + config.eyeInterval * 60 * 1000 
          : parsed.eyeEndTime;
        const stretchEndTime = (parsed.stretchEndTime < now - maxExpiredTime) 
          ? now + config.stretchInterval * 60 * 1000 
          : parsed.stretchEndTime;
        const waterEndTime = (parsed.waterEndTime < now - maxExpiredTime) 
          ? now + config.waterInterval * 60 * 1000 
          : parsed.waterEndTime;
        
        return {
          eyeEndTime,
          stretchEndTime,
          waterEndTime,
          lastPausedAt: parsed.lastPausedAt || null,
        };
      }
    }
  } catch (e) {
    console.error('Erro ao carregar timestamps:', e);
  }
  
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
  
  // Push notifications state - será sincronizado via effects
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const syncTimerStateToBackendRef = useRef<((state: any) => void) | null>(null);
  
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
  const isInitialLoadRef = useRef(true); // Evita abrir modais ao carregar o app
  const initialLoadTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Salvar config
  useEffect(() => {
    localStorage.setItem("reminderConfig", JSON.stringify(config));
  }, [config]);

  // Salvar timestamps e sincronizar com Service Worker + Backend
  useEffect(() => {
    localStorage.setItem("timerTimestamps", JSON.stringify(timestamps));
    
    const timerState = {
      eyeEndTime: timestamps.eyeEndTime,
      stretchEndTime: timestamps.stretchEndTime,
      waterEndTime: timestamps.waterEndTime,
      isRunning,
      notifyOnResume: config.notifyOnResume,
      // Incluir horário de trabalho para o Service Worker verificar
      workSchedule: schedule.isConfigured ? {
        startTime: schedule.startTime,
        lunchStart: schedule.lunchStart,
        lunchDuration: schedule.lunchDuration,
        endTime: schedule.endTime,
        workDays: schedule.workDays,
        isConfigured: schedule.isConfigured,
      } : undefined,
    };
    
    // Sincronizar estado para o Service Worker poder verificar em segundo plano
    syncTimerState(timerState);
    
    // Sincronizar com backend para push notifications (se habilitado)
    if (isPushSubscribed && syncTimerStateToBackendRef.current) {
      syncTimerStateToBackendRef.current(timerState);
    }
  }, [timestamps, isRunning, syncTimerState, isPushSubscribed, schedule, config.notifyOnResume]);

  // Salvar estado running
  useEffect(() => {
    localStorage.setItem("timersRunning", String(isRunning));
  }, [isRunning]);

  // Salvar estado antes de fechar/minimizar o app
  useEffect(() => {
    const saveStateBeforeUnload = () => {
      const stateToSave = {
        eyeEndTime: timestamps.eyeEndTime,
        stretchEndTime: timestamps.stretchEndTime,
        waterEndTime: timestamps.waterEndTime,
        lastPausedAt: timestamps.lastPausedAt,
        savedAt: Date.now(),
      };
      localStorage.setItem("timerTimestamps", JSON.stringify(stateToSave));
      localStorage.setItem("timersRunning", String(isRunning));
    };

    // Salvar ao perder visibilidade (app minimizado)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveStateBeforeUnload();
      }
    };

    // Salvar antes de fechar
    window.addEventListener("beforeunload", saveStateBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Também salvar ao perder foco
    window.addEventListener("blur", saveStateBeforeUnload);
    
    // Salvar periodicamente a cada 30 segundos como backup
    const saveInterval = setInterval(saveStateBeforeUnload, 30000);

    return () => {
      window.removeEventListener("beforeunload", saveStateBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", saveStateBeforeUnload);
      clearInterval(saveInterval);
    };
  }, [timestamps, isRunning]);

  // Aplicar intervalos otimizados quando o expediente começa
  useEffect(() => {
    if (schedule.isConfigured && getWorkStatus() === 'working' && !hasAppliedOptimalIntervalsRef.current) {
      const optimalIntervals = calculateOptimalIntervals();
      
      // Atualizar config com intervalos otimizados
      setConfig(prev => ({
        ...prev,
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
    // IMPORTANTE: Não notificar durante carregamento inicial (PWA resume)
    if (isInitialLoadRef.current) {
      console.log("Notificação bloqueada - carregamento inicial");
      return;
    }
    
    // IMPORTANTE: Não notificar fora do horário de trabalho
    if (!isWithinWorkHours() && schedule.isConfigured) {
      console.log("Notificação bloqueada - fora do horário de trabalho");
      return;
    }
    
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

    // Verificar se deve tocar som para este tipo de lembrete
    const shouldPlaySound = () => {
      if (!config.soundEnabled) return false;
      if (type === "eye" && !config.soundForEye) return false;
      if (type === "stretch" && !config.soundForStretch) return false;
      if (type === "water" && !config.soundForWater) return false;
      return true;
    };

    // Tocar som de alerta com volume e tom configurável
    const playAlertSound = () => {
      if (!shouldPlaySound()) return;
      
      const volume = (config.soundVolume ?? 70) / 100;
      const tone = NOTIFICATION_TONES[config.notificationTone ?? 'soft-beep'];
      
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioContext = new AudioContextClass();
          
          let delay = 0;
          tone.frequencies.forEach((freq, index) => {
            const duration = tone.durations[index] || 0.3;
            
            setTimeout(() => {
              try {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                osc.type = tone.type;
                gain.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + duration);
              } catch {}
            }, delay);
            
            delay += duration * 1000;
          });
        }
      } catch (e) {
        console.log("Som não disponível");
      }
    };

    // Tocar som apenas se habilitado para este tipo
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
  }, [config.soundEnabled, config.soundVolume, config.soundForEye, config.soundForStretch, config.soundForWater, config.notificationTone, isWithinWorkHours, schedule.isConfigured]);

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

    // Ref para controlar cooldown entre notificações (evita som duplicado)
    const lastNotificationTimeRef = { current: { eye: 0, stretch: 0, water: 0 } };
    const NOTIFICATION_COOLDOWN = 5000; // 5 segundos entre notificações do mesmo tipo

    const checkAndNotify = () => {
      // Ignorar notificações durante o carregamento inicial (evita abrir modais ao abrir o app)
      // Este check deve ser o PRIMEIRO para garantir que nada aconteça durante a inicialização
      if (isInitialLoadRef.current) {
        console.log("checkAndNotify bloqueado - carregamento inicial");
        return;
      }
      
      // Não notificar fora do horário de trabalho
      if (!isRunning || !isWithinWorkHours()) return;
      
      const now = Date.now();

      // Verificar se modal já está aberto antes de notificar novamente
      if (timestamps.eyeEndTime <= now && !notifiedRef.current.eye && !state.showEyeModal) {
        // Verificar cooldown
        if (now - lastNotificationTimeRef.current.eye >= NOTIFICATION_COOLDOWN) {
          notifiedRef.current.eye = true;
          lastNotificationTimeRef.current.eye = now;
          showNotification("eye");
          setState(prev => ({ ...prev, showEyeModal: true }));
        }
      } else if (timestamps.eyeEndTime > now) {
        notifiedRef.current.eye = false;
      }

      if (timestamps.stretchEndTime <= now && !notifiedRef.current.stretch && !state.showStretchModal) {
        if (now - lastNotificationTimeRef.current.stretch >= NOTIFICATION_COOLDOWN) {
          notifiedRef.current.stretch = true;
          lastNotificationTimeRef.current.stretch = now;
          showNotification("stretch");
          setState(prev => ({ ...prev, showStretchModal: true }));
        }
      } else if (timestamps.stretchEndTime > now) {
        notifiedRef.current.stretch = false;
      }

      if (timestamps.waterEndTime <= now && !notifiedRef.current.water && !state.showWaterModal) {
        if (now - lastNotificationTimeRef.current.water >= NOTIFICATION_COOLDOWN) {
          notifiedRef.current.water = true;
          lastNotificationTimeRef.current.water = now;
          showNotification("water");
          setState(prev => ({ ...prev, showWaterModal: true }));
        }
      } else if (timestamps.waterEndTime > now) {
        notifiedRef.current.water = false;
      }
    };

    setState(prev => ({ ...prev, ...calculateTimeLeft() }));
    
    // Aguardar 3 segundos antes de permitir notificações (evita abrir modais ao abrir o app)
    // Durante este tempo, resetar timers expirados para os intervalos normais (se notifyOnResume desativado)
    if (isInitialLoadRef.current) {
      const now = Date.now();
      let needsReset = false;
      const newTimestamps = { ...timestamps };
      
      // Se notifyOnResume está desativado, resetar timers expirados silenciosamente
      if (!config.notifyOnResume) {
        if (timestamps.eyeEndTime <= now) {
          newTimestamps.eyeEndTime = now + config.eyeInterval * 60 * 1000;
          notifiedRef.current.eye = true; // Marcar como notificado para evitar notificação imediata
          needsReset = true;
        }
        if (timestamps.stretchEndTime <= now) {
          newTimestamps.stretchEndTime = now + config.stretchInterval * 60 * 1000;
          notifiedRef.current.stretch = true;
          needsReset = true;
        }
        if (timestamps.waterEndTime <= now) {
          newTimestamps.waterEndTime = now + config.waterInterval * 60 * 1000;
          notifiedRef.current.water = true;
          needsReset = true;
        }
        
        if (needsReset) {
          setTimestamps(newTimestamps);
        }
      }
      
      // Liberar notificações após 3 segundos (ou imediatamente se notifyOnResume ativo)
      const delay = config.notifyOnResume ? 500 : 3000;
      initialLoadTimerRef.current = setTimeout(() => {
        isInitialLoadRef.current = false;
      }, delay);
    }

    const intervalId = setInterval(() => {
      setState(prev => ({ ...prev, ...calculateTimeLeft() }));
      checkAndNotify();
    }, 1000);

    // Função para resetar timers expirados silenciosamente (usado em resume/focus)
    const silentlyResetExpiredTimers = () => {
      if (config.notifyOnResume) return; // Não resetar se notifyOnResume está ativo
      
      const now = Date.now();
      const savedTimestamps = localStorage.getItem("timerTimestamps");
      let currentTimestamps = timestamps;
      
      if (savedTimestamps) {
        try {
          currentTimestamps = JSON.parse(savedTimestamps);
        } catch (e) {
          console.error('Erro ao parsear timestamps:', e);
        }
      }
      
      let needsReset = false;
      const newTimestamps = { ...currentTimestamps };
      
      if (currentTimestamps.eyeEndTime <= now) {
        newTimestamps.eyeEndTime = now + config.eyeInterval * 60 * 1000;
        notifiedRef.current.eye = true;
        needsReset = true;
      }
      if (currentTimestamps.stretchEndTime <= now) {
        newTimestamps.stretchEndTime = now + config.stretchInterval * 60 * 1000;
        notifiedRef.current.stretch = true;
        needsReset = true;
      }
      if (currentTimestamps.waterEndTime <= now) {
        newTimestamps.waterEndTime = now + config.waterInterval * 60 * 1000;
        notifiedRef.current.water = true;
        needsReset = true;
      }
      
      if (needsReset) {
        console.log('Resetando timers expirados silenciosamente');
        setTimestamps(newTimestamps);
        // Fechar modais abertos
        setState(prev => ({
          ...prev,
          showEyeModal: false,
          showStretchModal: false,
          showWaterModal: false,
        }));
      }
      
      return needsReset;
    };

    const handleResume = () => {
      // IMPORTANTE: Marcar como carregamento inicial ao retomar para evitar modais imediatos
      if (!config.notifyOnResume) {
        isInitialLoadRef.current = true;
        
        // Resetar timers expirados silenciosamente
        silentlyResetExpiredTimers();
        
        // Liberar notificações após delay
        if (initialLoadTimerRef.current) {
          clearTimeout(initialLoadTimerRef.current);
        }
        initialLoadTimerRef.current = setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 3000);
      } else {
        // Se notifyOnResume está ativo, recarregar timestamps do localStorage
        const savedTimestamps = localStorage.getItem("timerTimestamps");
        if (savedTimestamps) {
          try {
            const parsed = JSON.parse(savedTimestamps);
            const now = Date.now();
            
            if (parsed.eyeEndTime !== timestamps.eyeEndTime ||
                parsed.stretchEndTime !== timestamps.stretchEndTime ||
                parsed.waterEndTime !== timestamps.waterEndTime) {
              
              const maxExpiredTime = 5 * 60 * 1000;
              const validEye = parsed.eyeEndTime > now - maxExpiredTime;
              const validStretch = parsed.stretchEndTime > now - maxExpiredTime;
              const validWater = parsed.waterEndTime > now - maxExpiredTime;
              
              if (validEye && validStretch && validWater) {
                setTimestamps(parsed);
              }
            }
          } catch (e) {
            console.error('Erro ao recarregar timestamps:', e);
          }
        }
      }
      
      setState(prev => ({ ...prev, ...calculateTimeLeft() }));
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleResume();
      }
    };

    // Focus handler - usado quando usuário volta da bandeja de notificações
    const handleFocus = () => {
      // Só processar se o documento está visível (evita duplicação)
      if (!document.hidden) {
        handleResume();
      }
    };

    // Também escutar pageshow para PWAs que retomam do cache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted || !document.hidden) {
        handleResume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      clearInterval(intervalId);
      if (initialLoadTimerRef.current) {
        clearTimeout(initialLoadTimerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [isRunning, timestamps, config, showNotification, isWithinWorkHours, getWorkStatus, schedule.isConfigured, getTimeUntilNextWork, state.showEyeModal, state.showStretchModal, state.showWaterModal]);

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
