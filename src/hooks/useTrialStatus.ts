import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface TrialStatus {
  isOnTrial: boolean;
  planId: string | null;
  planName: string | null;
  daysRemaining: number;
  hoursRemaining: number;
  percentageUsed: number;
  startDate: Date | null;
  endDate: Date | null;
  isExpired: boolean;
}

const planNames: Record<string, string> = {
  demo: "Demo",
  free: "Gratuito",
  pro: "Pro",
  enterprise: "Enterprise",
};

// Enviar notificação push de trial
const sendTrialNotification = async (notificationType: string, planName: string, daysRemaining: number) => {
  try {
    if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: 'TRIAL_NOTIFICATION',
        notificationType,
        planName,
        daysRemaining
      });
    }
  } catch (e) {
    console.log('Erro ao enviar notificação de trial:', e);
  }
};

// Verificar se deve enviar notificação de trial
const checkAndSendTrialNotification = (status: TrialStatus) => {
  if (!status.isOnTrial && !status.isExpired) return;
  
  const lastNotificationKey = 'officewell_trial_last_notification';
  const lastNotification = localStorage.getItem(lastNotificationKey);
  const now = Date.now();
  
  // Verificar se já enviou notificação nas últimas 6 horas
  if (lastNotification) {
    const lastTime = parseInt(lastNotification, 10);
    if (now - lastTime < 6 * 60 * 60 * 1000) {
      return; // Não enviar novamente
    }
  }
  
  if (status.isExpired) {
    sendTrialNotification('trial_expired', status.planName || '', 0);
    localStorage.setItem(lastNotificationKey, now.toString());
  } else if (status.daysRemaining === 1) {
    sendTrialNotification('trial_last_day', status.planName || '', 1);
    localStorage.setItem(lastNotificationKey, now.toString());
  } else if (status.daysRemaining <= 2) {
    sendTrialNotification('trial_warning', status.planName || '', status.daysRemaining);
    localStorage.setItem(lastNotificationKey, now.toString());
  }
};

export const useTrialStatus = () => {
  const { profile } = useAuth();
  const [status, setStatus] = useState<TrialStatus>({
    isOnTrial: false,
    planId: null,
    planName: null,
    daysRemaining: 0,
    hoursRemaining: 0,
    percentageUsed: 0,
    startDate: null,
    endDate: null,
    isExpired: false,
  });

  // Calculate status based on profile
  useEffect(() => {
    const calculateStatus = (): TrialStatus => {
      // If no profile or not on demo plan, not on trial
      if (!profile || profile.current_plan !== 'demo' || !profile.trial_ends_at) {
        return {
          isOnTrial: false,
          planId: profile?.current_plan || null,
          planName: profile?.current_plan ? planNames[profile.current_plan] : null,
          daysRemaining: 0,
          hoursRemaining: 0,
          percentageUsed: 100,
          startDate: profile?.created_at ? new Date(profile.created_at) : null,
          endDate: null,
          isExpired: false,
        };
      }

      const startDate = new Date(profile.created_at);
      const endDate = new Date(profile.trial_ends_at);
      const now = new Date();

      const totalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      const elapsedMs = now.getTime() - startDate.getTime();
      const remainingMs = endDate.getTime() - now.getTime();

      const isExpired = remainingMs <= 0;
      const daysRemaining = isExpired ? 0 : Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      const hoursRemaining = isExpired ? 0 : Math.ceil(remainingMs / (60 * 60 * 1000));
      const percentageUsed = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

      return {
        isOnTrial: !isExpired,
        planId: 'demo',
        planName: planNames['demo'],
        daysRemaining,
        hoursRemaining,
        percentageUsed,
        startDate,
        endDate,
        isExpired,
      };
    };

    const newStatus = calculateStatus();
    setStatus(newStatus);
    
    // Check for notifications
    checkAndSendTrialNotification(newStatus);
  }, [profile]);

  // Update status every minute
  useEffect(() => {
    if (!profile || profile.current_plan !== 'demo') return;

    const interval = setInterval(() => {
      if (!profile.trial_ends_at) return;
      
      const startDate = new Date(profile.created_at);
      const endDate = new Date(profile.trial_ends_at);
      const now = new Date();

      const totalMs = 7 * 24 * 60 * 60 * 1000;
      const elapsedMs = now.getTime() - startDate.getTime();
      const remainingMs = endDate.getTime() - now.getTime();

      const isExpired = remainingMs <= 0;
      const daysRemaining = isExpired ? 0 : Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      const hoursRemaining = isExpired ? 0 : Math.ceil(remainingMs / (60 * 60 * 1000));
      const percentageUsed = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

      const newStatus: TrialStatus = {
        isOnTrial: !isExpired,
        planId: 'demo',
        planName: planNames['demo'],
        daysRemaining,
        hoursRemaining,
        percentageUsed,
        startDate,
        endDate,
        isExpired,
      };
      
      setStatus(newStatus);
      checkAndSendTrialNotification(newStatus);
    }, 60000);

    return () => clearInterval(interval);
  }, [profile]);

  // These are now no-ops since trial is managed by backend
  const startTrial = useCallback((_planId: string, _planName: string, _trialDays: number = 7) => {
    console.log('Trial is now managed by backend');
  }, []);

  const cancelTrial = useCallback(() => {
    console.log('Trial is now managed by backend');
  }, []);

  const extendTrial = useCallback((_additionalDays: number) => {
    console.log('Trial is now managed by backend');
  }, []);

  return {
    ...status,
    startTrial,
    cancelTrial,
    extendTrial,
  };
};
