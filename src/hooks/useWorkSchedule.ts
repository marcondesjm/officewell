import { useState, useEffect, useCallback } from "react";

export interface WorkSchedule {
  startTime: string; // HH:MM format
  lunchStart: string;
  lunchDuration: number; // in minutes (60 or 120)
  endTime: string;
  workDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isConfigured: boolean;
}

export interface OptimalIntervals {
  eyeInterval: number;      // minutos
  stretchInterval: number;  // minutos
  waterInterval: number;    // minutos
}

const DEFAULT_SCHEDULE: WorkSchedule = {
  startTime: "08:00",
  lunchStart: "12:00",
  lunchDuration: 60,
  endTime: "17:00",
  workDays: [1, 2, 3, 4, 5], // Monday to Friday
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

  const isWorkDay = useCallback((): boolean => {
    if (!schedule.isConfigured) return true;
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return schedule.workDays.includes(currentDay);
  }, [schedule]);

  const isWithinWorkHours = useCallback((): boolean => {
    if (!schedule.isConfigured) return true; // If not configured, always allow

    // Check if today is a work day
    if (!isWorkDay()) return false;

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
  }, [schedule, isWorkDay]);

  const getWorkStatus = useCallback((): 'before_work' | 'working' | 'lunch' | 'after_work' | 'day_off' => {
    if (!schedule.isConfigured) return 'working';

    // Check if today is a work day
    if (!isWorkDay()) return 'day_off';

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
  }, [schedule, isWorkDay]);

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

  // Calcular o total de minutos de trabalho efetivo (excluindo almoço)
  const getWorkMinutes = useCallback((): number => {
    if (!schedule.isConfigured) return 8 * 60; // Default 8h

    const [startH, startM] = schedule.startTime.split(":").map(Number);
    const [endH, endM] = schedule.endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return (endMinutes - startMinutes) - schedule.lunchDuration;
  }, [schedule]);

  // Calcular intervalos otimizados baseado no expediente
  const calculateOptimalIntervals = useCallback((): OptimalIntervals => {
    const workMinutes = getWorkMinutes();
    
    // Padrões NR-17 como referência base:
    // - Descanso visual: 20 min (regra 20-20-20)
    // - Alongamento: 50 min (pausas ergonômicas)
    // - Hidratação: 30 min (manter bem hidratado)
    
    // Calcular quantas pausas cabem no expediente
    const targetEyeBreaks = Math.max(1, Math.floor(workMinutes / 20)); // Mínimo a cada 20 min
    const targetStretchBreaks = Math.max(1, Math.floor(workMinutes / 50)); // Mínimo a cada 50 min
    const targetWaterBreaks = Math.max(1, Math.floor(workMinutes / 30)); // Mínimo a cada 30 min
    
    // Distribuir uniformemente
    const eyeInterval = Math.floor(workMinutes / targetEyeBreaks);
    const stretchInterval = Math.floor(workMinutes / targetStretchBreaks);
    const waterInterval = Math.floor(workMinutes / targetWaterBreaks);
    
    // Garantir valores mínimos e máximos
    return {
      eyeInterval: Math.max(15, Math.min(30, eyeInterval)),       // Entre 15-30 min
      stretchInterval: Math.max(40, Math.min(60, stretchInterval)), // Entre 40-60 min
      waterInterval: Math.max(20, Math.min(45, waterInterval)),     // Entre 20-45 min
    };
  }, [getWorkMinutes]);

  // Calcular minutos restantes de trabalho
  const getRemainingWorkMinutes = useCallback((): number => {
    if (!schedule.isConfigured) return 0;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [lunchStartH, lunchStartM] = schedule.lunchStart.split(":").map(Number);
    const [endH, endM] = schedule.endTime.split(":").map(Number);

    const lunchStartMinutes = lunchStartH * 60 + lunchStartM;
    const lunchEndMinutes = lunchStartMinutes + schedule.lunchDuration;
    const endMinutes = endH * 60 + endM;

    const status = getWorkStatus();
    
    if (status === 'before_work' || status === 'after_work') return 0;
    
    if (status === 'working') {
      if (currentMinutes < lunchStartMinutes) {
        // Antes do almoço: tempo até almoço + tempo após almoço
        const untilLunch = lunchStartMinutes - currentMinutes;
        const afterLunch = endMinutes - lunchEndMinutes;
        return untilLunch + afterLunch;
      } else {
        // Após o almoço: tempo até o fim
        return endMinutes - currentMinutes;
      }
    }
    
    return 0;
  }, [schedule, getWorkStatus]);

  return {
    schedule,
    updateSchedule,
    isWithinWorkHours,
    isWorkDay,
    getWorkStatus,
    getTimeUntilNextWork,
    getWorkMinutes,
    calculateOptimalIntervals,
    getRemainingWorkMinutes,
    needsConfiguration: !schedule.isConfigured,
  };
};
