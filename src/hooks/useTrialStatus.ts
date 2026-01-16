import { useState, useEffect, useCallback } from "react";

interface TrialInfo {
  planId: string;
  planName: string;
  startDate: string;
  trialDays: number;
}

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

const STORAGE_KEY = "officewell_trial";

const loadTrialInfo = (): TrialInfo | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveTrialInfo = (info: TrialInfo) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
};

const clearTrialInfo = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const calculateStatus = (info: TrialInfo | null): TrialStatus => {
  if (!info) {
    return {
      isOnTrial: false,
      planId: null,
      planName: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      percentageUsed: 0,
      startDate: null,
      endDate: null,
      isExpired: false,
    };
  }

  const startDate = new Date(info.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + info.trialDays);

  const now = new Date();
  const totalMs = info.trialDays * 24 * 60 * 60 * 1000;
  const elapsedMs = now.getTime() - startDate.getTime();
  const remainingMs = endDate.getTime() - now.getTime();

  const isExpired = remainingMs <= 0;
  const daysRemaining = isExpired ? 0 : Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  const hoursRemaining = isExpired ? 0 : Math.ceil(remainingMs / (60 * 60 * 1000));
  const percentageUsed = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

  return {
    isOnTrial: !isExpired,
    planId: info.planId,
    planName: info.planName,
    daysRemaining,
    hoursRemaining,
    percentageUsed,
    startDate,
    endDate,
    isExpired,
  };
};

export const useTrialStatus = () => {
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(loadTrialInfo);
  const [status, setStatus] = useState<TrialStatus>(() => calculateStatus(loadTrialInfo()));

  // Update status every minute
  useEffect(() => {
    const updateStatus = () => {
      setStatus(calculateStatus(trialInfo));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trialInfo]);

  const startTrial = useCallback((planId: string, planName: string, trialDays: number = 7) => {
    const info: TrialInfo = {
      planId,
      planName,
      startDate: new Date().toISOString(),
      trialDays,
    };
    saveTrialInfo(info);
    setTrialInfo(info);
  }, []);

  const cancelTrial = useCallback(() => {
    clearTrialInfo();
    setTrialInfo(null);
  }, []);

  const extendTrial = useCallback((additionalDays: number) => {
    if (trialInfo) {
      const updatedInfo = {
        ...trialInfo,
        trialDays: trialInfo.trialDays + additionalDays,
      };
      saveTrialInfo(updatedInfo);
      setTrialInfo(updatedInfo);
    }
  }, [trialInfo]);

  return {
    ...status,
    startTrial,
    cancelTrial,
    extendTrial,
  };
};
