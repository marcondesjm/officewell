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
    toast.success(notification.title, {
      description: notification.description,
      duration: 5000,
    });

    // Tentar notificação do navegador
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.description,
        icon: "/favicon.ico",
      });
    }
  }, []);

  useEffect(() => {
    if (!state.isRunning) return;

    const timer = setInterval(() => {
      setState((prev) => {
        const newState = { ...prev };

        // Timer de descanso visual
        if (prev.eyeTimeLeft <= 1) {
          showNotification("eye");
          newState.eyeTimeLeft = config.eyeInterval * 60;
        } else {
          newState.eyeTimeLeft = prev.eyeTimeLeft - 1;
        }

        // Timer de alongamento
        if (prev.stretchTimeLeft <= 1) {
          showNotification("stretch");
          newState.stretchTimeLeft = config.stretchInterval * 60;
        } else {
          newState.stretchTimeLeft = prev.stretchTimeLeft - 1;
        }

        // Timer de água
        if (prev.waterTimeLeft <= 1) {
          showNotification("water");
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
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const resetTimers = useCallback(() => {
    setState({
      eyeTimeLeft: config.eyeInterval * 60,
      stretchTimeLeft: config.stretchInterval * 60,
      waterTimeLeft: config.waterInterval * 60,
      isRunning: state.isRunning,
    });
  }, [config, state.isRunning]);

  const updateConfig = useCallback((newConfig: Partial<ReminderConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Notificações ativadas com sucesso!");
      }
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
