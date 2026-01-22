import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface Goal {
  id: string;
  type: 'posture' | 'breaks' | 'water' | 'ergonomics_session' | 'eye_exercises' | 'focus' | 'sun';
  name: string;
  description: string;
  icon: string;
  target: number; // hours for posture/focus, count for breaks/exercises
  unit: 'hours' | 'minutes' | 'times';
  frequency: 'daily';
  enabled: boolean;
  progress: number; // current progress
  lastUpdated: string; // ISO date string
}

export interface GoalProgress {
  goalId: string;
  date: string;
  value: number;
}

const defaultGoals: Goal[] = [
  {
    id: 'posture',
    type: 'posture',
    name: 'Postura Correta',
    description: 'Mantenha uma boa postura durante o trabalho',
    icon: 'scan-face',
    target: 6,
    unit: 'hours',
    frequency: 'daily',
    enabled: true,
    progress: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'breaks',
    type: 'breaks',
    name: 'Pausas Ergonômicas',
    description: 'Faça pausas regulares para alongamento',
    icon: 'dumbbell',
    target: 8,
    unit: 'times',
    frequency: 'daily',
    enabled: true,
    progress: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'water',
    type: 'water',
    name: 'Hidratação',
    description: 'Beba água regularmente durante o dia',
    icon: 'droplet',
    target: 8,
    unit: 'times',
    frequency: 'daily',
    enabled: true,
    progress: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'ergonomics_session',
    type: 'ergonomics_session',
    name: 'Sessão de Ergonomia',
    description: 'Complete sua sessão diária de ergonomia',
    icon: 'activity',
    target: 1,
    unit: 'times',
    frequency: 'daily',
    enabled: true,
    progress: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'eye_exercises',
    type: 'eye_exercises',
    name: 'Exercícios para os Olhos',
    description: 'Descanse seus olhos regularmente',
    icon: 'eye',
    target: 6,
    unit: 'times',
    frequency: 'daily',
    enabled: true,
    progress: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sun',
    type: 'sun',
    name: 'Banho de Sol',
    description: 'Tome sol para produção de vitamina D',
    icon: 'sun',
    target: 2,
    unit: 'times',
    frequency: 'daily',
    enabled: true,
    progress: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'focus',
    type: 'focus',
    name: 'Tempo de Foco',
    description: 'Mantenha períodos de foco produtivo',
    icon: 'brain',
    target: 4,
    unit: 'hours',
    frequency: 'daily',
    enabled: true,
    progress: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  },
];

const GOALS_STORAGE_KEY = 'user-goals';
const GOALS_PROGRESS_KEY = 'goals-progress-history';

const getStoredGoals = (): Goal[] => {
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    if (stored) {
      const goals = JSON.parse(stored) as Goal[];
      // Reset progress if it's a new day
      const today = new Date().toISOString().split('T')[0];
      return goals.map(goal => {
        if (goal.lastUpdated !== today) {
          return { ...goal, progress: 0, lastUpdated: today };
        }
        return goal;
      });
    }
  } catch (e) {
    console.error('Error reading goals from localStorage:', e);
  }
  return defaultGoals;
};

const saveGoals = (goals: Goal[]) => {
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error('Error saving goals to localStorage:', e);
  }
};

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>(getStoredGoals);
  const [lastNotificationCheck, setLastNotificationCheck] = useState<Record<string, string>>({});

  // Save goals whenever they change
  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  // Check for smart notifications
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Only check during work hours (8am - 6pm)
      if (currentHour < 8 || currentHour > 18) return;

      goals.forEach(goal => {
        if (!goal.enabled) return;

        const progressPercent = (goal.progress / goal.target) * 100;
        const notificationKey = `${goal.id}-${now.toISOString().split('T')[0]}`;

        // Already notified today for this goal milestone
        if (lastNotificationCheck[`${notificationKey}-${Math.floor(progressPercent / 25) * 25}`]) return;

        // Close to goal (75-99%)
        if (progressPercent >= 75 && progressPercent < 100) {
          const milestone = `${notificationKey}-75`;
          if (!lastNotificationCheck[milestone]) {
            toast.info(`🧍 Você está perto da sua meta de ${goal.name.toLowerCase()}!`, {
              description: `Faltam apenas ${(goal.target - goal.progress).toFixed(1)} ${goal.unit === 'hours' ? 'horas' : goal.unit === 'times' ? 'vezes' : 'minutos'} para completar!`,
              duration: 5000,
            });
            setLastNotificationCheck(prev => ({ ...prev, [milestone]: 'true' }));
          }
        }

        // Goal completed (100%)
        if (progressPercent >= 100) {
          const milestone = `${notificationKey}-100`;
          if (!lastNotificationCheck[milestone]) {
            toast.success(`🎉 Meta de ${goal.name.toLowerCase()} concluída!`, {
              description: 'Parabéns! Continue assim!',
              duration: 5000,
            });
            setLastNotificationCheck(prev => ({ ...prev, [milestone]: 'true' }));
          }
        }
      });
    };

    // Check immediately and then every 5 minutes
    checkNotifications();
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [goals, lastNotificationCheck]);

  const updateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  }, []);

  const incrementProgress = useCallback((goalId: string, amount: number = 1) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const newProgress = Math.min(goal.progress + amount, goal.target * 1.5); // Allow some overflow
      return { 
        ...goal, 
        progress: newProgress,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
    }));
  }, []);

  const resetDailyProgress = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setGoals(prev => prev.map(goal => ({
      ...goal,
      progress: 0,
      lastUpdated: today,
    })));
  }, []);

  const getProgressPercent = useCallback((goalId: string): number => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return 0;
    return Math.min((goal.progress / goal.target) * 100, 100);
  }, [goals]);

  const getTotalProgress = useCallback((): number => {
    const enabledGoals = goals.filter(g => g.enabled);
    if (enabledGoals.length === 0) return 0;
    
    const totalPercent = enabledGoals.reduce((sum, goal) => {
      return sum + Math.min((goal.progress / goal.target) * 100, 100);
    }, 0);
    
    return totalPercent / enabledGoals.length;
  }, [goals]);

  const triggerBreakNotification = useCallback(() => {
    const enabledGoals = goals.filter(g => g.enabled);
    const lowProgressGoals = enabledGoals.filter(g => (g.progress / g.target) < 0.5);
    
    if (lowProgressGoals.length > 0) {
      const randomGoal = lowProgressGoals[Math.floor(Math.random() * lowProgressGoals.length)];
      toast.info(`⏸️ Hora da pausa para manter sua produtividade!`, {
        description: `Que tal trabalhar na sua meta de ${randomGoal.name.toLowerCase()}?`,
        duration: 5000,
      });
    }
  }, [goals]);

  return {
    goals,
    updateGoal,
    incrementProgress,
    resetDailyProgress,
    getProgressPercent,
    getTotalProgress,
    triggerBreakNotification,
  };
};
