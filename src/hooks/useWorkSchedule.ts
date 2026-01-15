import { useState, useEffect, useCallback } from "react";

export interface WorkSchedule {
  startTime: string; // HH:MM format
  lunchStart: string;
  lunchDuration: number; // in minutes (60 or 120)
  endTime: string;
  isConfigured: boolean;
}

const DEFAULT_SCHEDULE: WorkSchedule = {
  startTime: "08:00",
  lunchStart: "12:00",
  lunchDuration: 60,
  endTime: "17:00",
  isConfigured: false,
};

const loadSchedule = (): WorkSchedule => {
  try {
    const saved = localStorage.getItem("workSchedule");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return DEFAULT_SCHEDULE;
};

export const useWorkSchedule = () => {
  const [schedule, setSchedule] = useState<WorkSchedule>(loadSchedule);

  useEffect(() => {
    localStorage.setItem("workSchedule", JSON.stringify(schedule));
  }, [schedule]);

  const updateSchedule = useCallback((newSchedule: Partial<WorkSchedule>) => {
    setSchedule(prev => ({ ...prev, ...newSchedule }));
  }, []);

  const isWithinWorkHours = useCallback((): boolean => {
    if (!schedule.isConfigured) return true; // If not configured, always allow

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Parse times
    const [startH, startM] = schedule.startTime.split(":").map(Number);
    const [lunchStartH, lunchStartM] = schedule.lunchStart.split(":").map(Number);
    const [endH, endM] = schedule.endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const lunchStartMinutes = lunchStartH * 60 + lunchStartM;
    const lunchEndMinutes = lunchStartMinutes + schedule.lunchDuration;
    const endMinutes = endH * 60 + endM;

    // Check if within work hours (before lunch, or after lunch)
    const beforeLunch = currentMinutes >= startMinutes && currentMinutes < lunchStartMinutes;
    const afterLunch = currentMinutes >= lunchEndMinutes && currentMinutes < endMinutes;

    return beforeLunch || afterLunch;
  }, [schedule]);

  const getWorkStatus = useCallback((): 'before_work' | 'working' | 'lunch' | 'after_work' => {
    if (!schedule.isConfigured) return 'working';

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = schedule.startTime.split(":").map(Number);
    const [lunchStartH, lunchStartM] = schedule.lunchStart.split(":").map(Number);
    const [endH, endM] = schedule.endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const lunchStartMinutes = lunchStartH * 60 + lunchStartM;
    const lunchEndMinutes = lunchStartMinutes + schedule.lunchDuration;
    const endMinutes = endH * 60 + endM;

    if (currentMinutes < startMinutes) return 'before_work';
    if (currentMinutes >= startMinutes && currentMinutes < lunchStartMinutes) return 'working';
    if (currentMinutes >= lunchStartMinutes && currentMinutes < lunchEndMinutes) return 'lunch';
    if (currentMinutes >= lunchEndMinutes && currentMinutes < endMinutes) return 'working';
    return 'after_work';
  }, [schedule]);

  const getTimeUntilNextWork = useCallback((): number => {
    if (!schedule.isConfigured) return 0;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = schedule.startTime.split(":").map(Number);
    const [lunchStartH, lunchStartM] = schedule.lunchStart.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const lunchEndMinutes = (lunchStartH * 60 + lunchStartM) + schedule.lunchDuration;

    const status = getWorkStatus();
    
    if (status === 'before_work') {
      return (startMinutes - currentMinutes) * 60; // seconds until start
    }
    if (status === 'lunch') {
      return (lunchEndMinutes - currentMinutes) * 60; // seconds until lunch ends
    }
    return 0;
  }, [schedule, getWorkStatus]);

  return {
    schedule,
    updateSchedule,
    isWithinWorkHours,
    getWorkStatus,
    getTimeUntilNextWork,
    needsConfiguration: !schedule.isConfigured,
  };
};
