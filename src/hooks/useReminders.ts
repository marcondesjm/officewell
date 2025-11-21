import { useState, useEffect, useCallback } from "react";
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

const DEFAULT_CONFIG: ReminderConfig = {
  eyeInterval: 20,
  stretchInterval: 45,
  waterInterval: 30,
};

export const useReminders = () => {
  const [config, setConfig] = useState<ReminderConfig>(() => {
    const saved = localStorage.getItem("reminderConfig");
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [state, setState] = useState<ReminderState>(() => ({
    eyeTimeLeft: config.eyeInterval * 60,
    stretchTimeLeft: config.stretchInterval * 60,
    waterTimeLeft: config.waterInterval * 60,
    isRunning: true,
  }));

  useEffect(() => {
    localStorage.setItem("reminderConfig", JSON.stringify(config));
  }, [config]);

  const playBeep = useCallback(() => {
    try {
      if (typeof window !== "undefined" && "AudioContext" in window) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    } catch (error) {
      console.log("Não foi possível reproduzir o som:", error);
    }
  }, []);

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
    
    try {
      // Tocar som de alerta
      playBeep();
      
      toast.success(notification.title, {
        description: notification.description,
        duration: 5000,
      });

      // Tentar notificação do navegador apenas se suportado
      if (typeof window !== "undefined" && 
          "Notification" in window && 
          Notification.permission === "granted") {
        try {
          new Notification(notification.title, {
            body: notification.description,
            icon: "/favicon.ico",
          });
        } catch (error) {
          console.log("Notificação do navegador não disponível");
        }
      }
    } catch (error) {
      console.error("Erro ao mostrar notificação:", error);
    }
  }, [playBeep]);

  useEffect(() => {
    if (!state.isRunning) return;

    const timer = setInterval(() => {
      setState((prev) => {
        const newState = { ...prev };

        // Timer de descanso visual
        if (prev.eyeTimeLeft <= 1) {
          try {
            showNotification("eye");
          } catch (error) {
            console.error("Erro ao mostrar notificação de descanso visual:", error);
          }
          newState.eyeTimeLeft = config.eyeInterval * 60;
        } else {
          newState.eyeTimeLeft = prev.eyeTimeLeft - 1;
        }

        // Timer de alongamento
        if (prev.stretchTimeLeft <= 1) {
          try {
            showNotification("stretch");
          } catch (error) {
            console.error("Erro ao mostrar notificação de alongamento:", error);
          }
          newState.stretchTimeLeft = config.stretchInterval * 60;
        } else {
          newState.stretchTimeLeft = prev.stretchTimeLeft - 1;
        }

        // Timer de água
        if (prev.waterTimeLeft <= 1) {
          try {
            showNotification("water");
          } catch (error) {
            console.error("Erro ao mostrar notificação de água:", error);
          }
          newState.waterTimeLeft = config.waterInterval * 60;
        } else {
          newState.waterTimeLeft = prev.waterTimeLeft - 1;
        }

        return newState;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isRunning, config, showNotification]);

  const toggleRunning = useCallback(() => {
    try {
      console.log("Toggle running called");
      setState((prev) => {
        const newState = { ...prev, isRunning: !prev.isRunning };
        console.log("New state:", newState);
        return newState;
      });
    } catch (error) {
      console.error("Erro ao alternar estado:", error);
      toast.error("Erro ao pausar/iniciar");
    }
  }, []);

  const resetTimers = useCallback(() => {
    try {
      console.log("Reset timers called");
      setState({
        eyeTimeLeft: config.eyeInterval * 60,
        stretchTimeLeft: config.stretchInterval * 60,
        waterTimeLeft: config.waterInterval * 60,
        isRunning: state.isRunning,
      });
      toast.success("Timers reiniciados!");
    } catch (error) {
      console.error("Erro ao reiniciar timers:", error);
      toast.error("Erro ao reiniciar");
    }
  }, [config, state.isRunning]);

  const updateConfig = useCallback((newConfig: Partial<ReminderConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && 
          "Notification" in window && 
          Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          toast.success("Notificações ativadas com sucesso!");
        } else {
          toast.info("As notificações serão exibidas apenas no aplicativo");
        }
      } else if (Notification.permission === "denied") {
        toast.info("Notificações bloqueadas pelo navegador");
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificação:", error);
      toast.info("As notificações serão exibidas apenas no aplicativo");
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
