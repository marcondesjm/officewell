import { useState, useEffect, useCallback } from "react";

interface ReminderCompletion {
  type: "eye" | "stretch" | "water";
  timestamp: number;
}

interface ReminderStats {
  today: { eye: number; stretch: number; water: number };
  week: { eye: number; stretch: number; water: number };
  total: { eye: number; stretch: number; water: number };
}

const STORAGE_KEY = "reminderCompletions";

const loadCompletions = (): ReminderCompletion[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCompletions = (completions: ReminderCompletion[]) => {
  // Keep only last 30 days of data
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const filtered = completions.filter(c => c.timestamp > thirtyDaysAgo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isThisWeek = (timestamp: number): boolean => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return timestamp >= startOfWeek.getTime();
};

const calculateStats = (completions: ReminderCompletion[]): ReminderStats => {
  const stats: ReminderStats = {
    today: { eye: 0, stretch: 0, water: 0 },
    week: { eye: 0, stretch: 0, water: 0 },
    total: { eye: 0, stretch: 0, water: 0 },
  };

  completions.forEach(completion => {
    stats.total[completion.type]++;
    
    if (isToday(completion.timestamp)) {
      stats.today[completion.type]++;
    }
    
    if (isThisWeek(completion.timestamp)) {
      stats.week[completion.type]++;
    }
  });

  return stats;
};

export const useReminderStats = () => {
  const [completions, setCompletions] = useState<ReminderCompletion[]>(loadCompletions);
  const [stats, setStats] = useState<ReminderStats>(() => calculateStats(loadCompletions()));

  useEffect(() => {
    saveCompletions(completions);
    setStats(calculateStats(completions));
  }, [completions]);

  const recordCompletion = useCallback((type: "eye" | "stretch" | "water") => {
    setCompletions(prev => [...prev, { type, timestamp: Date.now() }]);
  }, []);

  const getTodayTotal = useCallback(() => {
    return stats.today.eye + stats.today.stretch + stats.today.water;
  }, [stats]);

  const getWeekTotal = useCallback(() => {
    return stats.week.eye + stats.week.stretch + stats.week.water;
  }, [stats]);

  return {
    stats,
    recordCompletion,
    getTodayTotal,
    getWeekTotal,
  };
};
