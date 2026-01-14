import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export interface ReminderConfig {
  eyeInterval: number; // em minutos
  stretchInterval: number;
  waterInterval: number;
}

export interface ReminderState {
  eyeTimeLeft: number;
  stretchTimeLeft: number;
  waterTimeLeft: number;
  isRunning: boolean;
}

interface TimerTimestamps {
  eyeEndTime: number;
  stretchEndTime: number;
  waterEndTime: number;
  lastPausedAt: number | null;
}

const DEFAULT_CONFIG: ReminderConfig = {
  eyeInterval: 20,
  stretchInterval: 45,
  waterInterval: 30,
};

const getInitialTimestamps = (config: ReminderConfig): TimerTimestamps => {
  const now = Date.now();
  return {
    eyeEndTime: now + config.eyeInterval * 60 * 1000,
    stretchEndTime: now + config.stretchInterval * 60 * 1000,
    waterEndTime: now + config.waterInterval * 60 * 1000,
    lastPausedAt: null,
  };
};

export const useReminders = () => {
  const [config, setConfig] = useState<ReminderConfig>(() => {
    try {
      const saved = localStorage.getItem("reminderConfig");
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [timestamps, setTimestamps] = useState<TimerTimestamps>(() => {
    try {
      const saved = localStorage.getItem("timerTimestamps");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return getInitialTimestamps(config);
  });

  const [isRunning, setIsRunning] = useState(() => {
    try {
      const saved = localStorage.getItem("timersRunning");
      return saved !== "false";
    } catch {
      return true;
    }
  });

  const [state, setState] = useState<ReminderState>({
    eyeTimeLeft: 0,
    stretchTimeLeft: 0,
    waterTimeLeft: 0,
    isRunning: true,
  });

  const notifiedRef = useRef<{ eye: boolean; stretch: boolean; water: boolean }>({
    eye: false,
    stretch: false,
    water: false,
  });

  // Salvar config
  useEffect(() => {
    localStorage.setItem("reminderConfig", JSON.stringify(config));
  }, [config]);

  // Salvar timestamps
  useEffect(() => {
    localStorage.setItem("timerTimestamps", JSON.stringify(timestamps));
  }, [timestamps]);

  // Salvar estado running
  useEffect(() => {
    localStorage.setItem("timersRunning", String(isRunning));
  }, [isRunning]);

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

    // Tocar som
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (e) {
      console.log("Som não disponível");
    }

    // Vibrar no mobile
    try {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {}

    toast.success(notification.title, {
      description: notification.description,
      duration: 5000,
    });

    // Notificação do navegador
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.description,
          icon: "/favicon.ico",
        });
      }
    } catch (e) {}
  }, []);

  // Timer principal - usa timestamps absolutos
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();

      if (!isRunning) {
        // Quando pausado, mostra o tempo que tinha quando pausou
        const pauseTime = timestamps.lastPausedAt || now;
        return {
          eyeTimeLeft: Math.max(0, Math.floor((timestamps.eyeEndTime - pauseTime) / 1000)),
          stretchTimeLeft: Math.max(0, Math.floor((timestamps.stretchEndTime - pauseTime) / 1000)),
          waterTimeLeft: Math.max(0, Math.floor((timestamps.waterEndTime - pauseTime) / 1000)),
          isRunning: false,
        };
      }

      const eyeTimeLeft = Math.max(0, Math.floor((timestamps.eyeEndTime - now) / 1000));
      const stretchTimeLeft = Math.max(0, Math.floor((timestamps.stretchEndTime - now) / 1000));
      const waterTimeLeft = Math.max(0, Math.floor((timestamps.waterEndTime - now) / 1000));

      // Verificar se algum timer expirou
      if (eyeTimeLeft === 0 && !notifiedRef.current.eye) {
        notifiedRef.current.eye = true;
        showNotification("eye");
        setTimestamps(prev => ({
          ...prev,
          eyeEndTime: now + config.eyeInterval * 60 * 1000,
        }));
      } else if (eyeTimeLeft > 0) {
        notifiedRef.current.eye = false;
      }

      if (stretchTimeLeft === 0 && !notifiedRef.current.stretch) {
        notifiedRef.current.stretch = true;
        showNotification("stretch");
        setTimestamps(prev => ({
          ...prev,
          stretchEndTime: now + config.stretchInterval * 60 * 1000,
        }));
      } else if (stretchTimeLeft > 0) {
        notifiedRef.current.stretch = false;
      }

      if (waterTimeLeft === 0 && !notifiedRef.current.water) {
        notifiedRef.current.water = true;
        showNotification("water");
        setTimestamps(prev => ({
          ...prev,
          waterEndTime: now + config.waterInterval * 60 * 1000,
        }));
      } else if (waterTimeLeft > 0) {
        notifiedRef.current.water = false;
      }

      return {
        eyeTimeLeft,
        stretchTimeLeft,
        waterTimeLeft,
        isRunning: true,
      };
    };

    // Atualizar imediatamente
    setState(calculateTimeLeft());

    // Atualizar a cada segundo
    const intervalId = setInterval(() => {
      setState(calculateTimeLeft());
    }, 1000);

    // Atualizar quando a página volta ao foco
    const handleVisibility = () => {
      if (!document.hidden) {
        setState(calculateTimeLeft());
      }
    };

    const handleFocus = () => {
      setState(calculateTimeLeft());
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isRunning, timestamps, config, showNotification]);

  const toggleRunning = useCallback(() => {
    setIsRunning(prev => {
      const newIsRunning = !prev;
      const now = Date.now();

      if (newIsRunning) {
        // Retomando - ajustar timestamps baseado no tempo pausado
        if (timestamps.lastPausedAt) {
          const pausedDuration = now - timestamps.lastPausedAt;
          setTimestamps(prev => ({
            eyeEndTime: prev.eyeEndTime + pausedDuration,
            stretchEndTime: prev.stretchEndTime + pausedDuration,
            waterEndTime: prev.waterEndTime + pausedDuration,
            lastPausedAt: null,
          }));
        }
      } else {
        // Pausando - salvar quando pausou
        setTimestamps(prev => ({
          ...prev,
          lastPausedAt: now,
        }));
      }

      return newIsRunning;
    });
  }, [timestamps.lastPausedAt]);

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
      if ("Notification" in window && Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          toast.success("Notificações ativadas!");
        } else {
          toast.info("Notificações serão exibidas apenas no app");
        }
      } else if (Notification.permission === "denied") {
        toast.info("Notificações bloqueadas pelo navegador");
      }
    } catch {
      toast.info("Notificações serão exibidas apenas no app");
    }
  }, []);

  return {
    config,
    state,
    toggleRunning,
    resetTimers,
    updateConfig,
    requestNotificationPermission,
  };
};
