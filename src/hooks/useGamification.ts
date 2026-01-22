import { useState, useEffect, useCallback } from "react";

export interface ActivityRecord {
  type: "stretch" | "eye" | "water" | "posture" | "daily_session" | "sun";
  points: number;
  timestamp: number;
  date: string;
}

export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  activitiesCompleted: number;
  dailySessionsCompleted: number;
  stretchBreaksCompleted: number;
  eyeBreaksCompleted: number;
  waterBreaksCompleted: number;
  postureChecksCompleted: number;
  sunBreaksCompleted: number;
  lastActivityDate: string | null;
  lastOpenDate: string | null;
  inactivityPenaltyApplied: boolean;
  daysInactive: number;
  pointsLostToInactivity: number;
}

export interface Rank {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
  color: string;
  description: string;
}

export interface InactivityInfo {
  wasInactive: boolean;
  daysInactive: number;
  pointsLost: number;
  previousRank: Rank | null;
  currentRank: Rank;
  rankDropped: boolean;
}

const RANKS: Rank[] = [
  { id: "iniciante", name: "Iniciante", minPoints: 0, maxPoints: 100, icon: "🌱", color: "text-gray-500", description: "Começando a jornada ergonômica" },
  { id: "aprendiz", name: "Aprendiz", minPoints: 101, maxPoints: 300, icon: "📚", color: "text-blue-500", description: "Aprendendo boas práticas" },
  { id: "praticante", name: "Praticante", minPoints: 301, maxPoints: 600, icon: "💪", color: "text-green-500", description: "Praticando regularmente" },
  { id: "dedicado", name: "Dedicado", minPoints: 601, maxPoints: 1000, icon: "⭐", color: "text-yellow-500", description: "Compromisso com a saúde" },
  { id: "ergonomista", name: "Ergonomista", minPoints: 1001, maxPoints: 2000, icon: "🏅", color: "text-orange-500", description: "Especialista em ergonomia" },
  { id: "mestre", name: "Mestre da Postura", minPoints: 2001, maxPoints: 5000, icon: "🎖️", color: "text-purple-500", description: "Dominando a arte da postura" },
  { id: "lenda", name: "Lenda da Ergonomia", minPoints: 5001, maxPoints: Infinity, icon: "👑", color: "text-amber-500", description: "Inspiração para todos" },
];

const POINTS_CONFIG = {
  daily_session: 50,
  stretch: 20,
  eye: 15,
  water: 10,
  sun: 25, // Sun break - vitamina D
  posture: 5,
  streak_bonus: 10, // Per day of streak
  inactivity_penalty_per_day: 15, // Points lost per day inactive
  max_inactivity_penalty: 100, // Maximum points that can be lost
  daily_open_bonus: 5, // Bonus for opening app daily
};

const STORAGE_KEY = "officewell_gamification";
const INACTIVITY_WARNING_KEY = "officewell_inactivity_warning";

const getDateString = (timestamp?: number): string => {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toISOString().split("T")[0];
};

const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const getRankByPoints = (points: number): Rank => {
  return RANKS.find(rank => 
    points >= rank.minPoints && points <= rank.maxPoints
  ) || RANKS[0];
};

const loadStats = (): UserStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading gamification stats:", e);
  }
  return {
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    activitiesCompleted: 0,
    dailySessionsCompleted: 0,
    stretchBreaksCompleted: 0,
    eyeBreaksCompleted: 0,
    waterBreaksCompleted: 0,
    postureChecksCompleted: 0,
    sunBreaksCompleted: 0,
    lastActivityDate: null,
    lastOpenDate: null,
    inactivityPenaltyApplied: false,
    daysInactive: 0,
    pointsLostToInactivity: 0,
  };
};

const saveStats = (stats: UserStats): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Error saving gamification stats:", e);
  }
};

export const useGamification = () => {
  const [stats, setStats] = useState<UserStats>(loadStats);
  const [inactivityInfo, setInactivityInfo] = useState<InactivityInfo | null>(null);

  // Check for inactivity on mount
  useEffect(() => {
    const today = getDateString();
    const currentStats = loadStats();
    
    if (currentStats.lastOpenDate && currentStats.lastOpenDate !== today) {
      const daysInactive = getDaysDifference(currentStats.lastOpenDate, today);
      
      if (daysInactive > 1) {
        // Apply inactivity penalty
        const penaltyPerDay = POINTS_CONFIG.inactivity_penalty_per_day;
        const totalPenalty = Math.min(
          (daysInactive - 1) * penaltyPerDay,
          POINTS_CONFIG.max_inactivity_penalty
        );
        
        const previousRank = getRankByPoints(currentStats.totalPoints);
        const newPoints = Math.max(0, currentStats.totalPoints - totalPenalty);
        const newRank = getRankByPoints(newPoints);
        
        // Check if we should show the warning
        const warningKey = `${INACTIVITY_WARNING_KEY}-${today}`;
        const alreadyWarned = localStorage.getItem(warningKey);
        
        if (!alreadyWarned && totalPenalty > 0) {
          setInactivityInfo({
            wasInactive: true,
            daysInactive: daysInactive - 1,
            pointsLost: totalPenalty,
            previousRank: previousRank.id !== newRank.id ? previousRank : null,
            currentRank: newRank,
            rankDropped: previousRank.id !== newRank.id,
          });
          
          localStorage.setItem(warningKey, 'true');
          
          setStats(prev => ({
            ...prev,
            totalPoints: newPoints,
            currentStreak: 0, // Reset streak
            daysInactive: daysInactive - 1,
            pointsLostToInactivity: prev.pointsLostToInactivity + totalPenalty,
            inactivityPenaltyApplied: true,
            lastOpenDate: today,
          }));
        }
      } else {
        // User was active yesterday, give daily bonus
        setStats(prev => ({
          ...prev,
          totalPoints: prev.totalPoints + POINTS_CONFIG.daily_open_bonus,
          lastOpenDate: today,
          inactivityPenaltyApplied: false,
        }));
      }
    } else if (!currentStats.lastOpenDate) {
      // First time opening
      setStats(prev => ({
        ...prev,
        lastOpenDate: today,
      }));
    }
  }, []);

  // Persist stats when they change
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Dismiss inactivity warning
  const dismissInactivityWarning = useCallback(() => {
    setInactivityInfo(null);
  }, []);

  // Calculate current rank
  const getCurrentRank = useCallback((): Rank => {
    return RANKS.find(rank => 
      stats.totalPoints >= rank.minPoints && stats.totalPoints <= rank.maxPoints
    ) || RANKS[0];
  }, [stats.totalPoints]);

  // Get next rank
  const getNextRank = useCallback((): Rank | null => {
    const currentRank = getCurrentRank();
    const currentIndex = RANKS.findIndex(r => r.id === currentRank.id);
    return currentIndex < RANKS.length - 1 ? RANKS[currentIndex + 1] : null;
  }, [getCurrentRank]);

  // Calculate progress to next rank
  const getProgressToNextRank = useCallback((): number => {
    const currentRank = getCurrentRank();
    const nextRank = getNextRank();
    if (!nextRank) return 100;
    
    const pointsInCurrentRank = stats.totalPoints - currentRank.minPoints;
    const pointsNeeded = nextRank.minPoints - currentRank.minPoints;
    return Math.min(100, (pointsInCurrentRank / pointsNeeded) * 100);
  }, [stats.totalPoints, getCurrentRank, getNextRank]);

  // Update streak
  const updateStreak = useCallback((currentDate: string) => {
    setStats(prev => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getDateString(yesterday.getTime());

      let newStreak = prev.currentStreak;
      
      if (prev.lastActivityDate === currentDate) {
        // Same day, no streak change
        return prev;
      } else if (prev.lastActivityDate === yesterdayStr) {
        // Consecutive day
        newStreak = prev.currentStreak + 1;
      } else if (!prev.lastActivityDate) {
        // First activity ever
        newStreak = 1;
      } else {
        // Streak broken
        newStreak = 1;
      }

      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActivityDate: currentDate,
      };
    });
  }, []);

  // Add points for an activity
  const addPoints = useCallback((type: ActivityRecord["type"]): number => {
    const basePoints = POINTS_CONFIG[type];
    const currentDate = getDateString();
    
    // Update streak first
    updateStreak(currentDate);

    let bonusPoints = 0;
    
    // Calculate streak bonus
    setStats(prev => {
      if (prev.currentStreak > 1) {
        bonusPoints = Math.min(prev.currentStreak * POINTS_CONFIG.streak_bonus, 100);
      }
      
      const totalEarned = basePoints + bonusPoints;
      
      const updates: Partial<UserStats> = {
        totalPoints: prev.totalPoints + totalEarned,
        activitiesCompleted: prev.activitiesCompleted + 1,
      };

      switch (type) {
        case "daily_session":
          updates.dailySessionsCompleted = prev.dailySessionsCompleted + 1;
          break;
        case "stretch":
          updates.stretchBreaksCompleted = prev.stretchBreaksCompleted + 1;
          break;
        case "eye":
          updates.eyeBreaksCompleted = prev.eyeBreaksCompleted + 1;
          break;
        case "water":
          updates.waterBreaksCompleted = prev.waterBreaksCompleted + 1;
          break;
        case "sun":
          updates.sunBreaksCompleted = (prev.sunBreaksCompleted || 0) + 1;
          break;
        case "posture":
          updates.postureChecksCompleted = prev.postureChecksCompleted + 1;
          break;
      }

      return { ...prev, ...updates };
    });

    return basePoints + bonusPoints;
  }, [updateStreak]);

  // Get points for today
  const getTodayPoints = useCallback((): number => {
    const today = getDateString();
    if (stats.lastActivityDate !== today) return 0;
    // We don't track daily points separately, so return 0 for simplicity
    return 0;
  }, [stats.lastActivityDate]);

  // Reset all stats (for testing)
  const resetStats = useCallback(() => {
    const initial: UserStats = {
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      activitiesCompleted: 0,
      dailySessionsCompleted: 0,
      stretchBreaksCompleted: 0,
      eyeBreaksCompleted: 0,
      waterBreaksCompleted: 0,
      postureChecksCompleted: 0,
      sunBreaksCompleted: 0,
      lastActivityDate: null,
      lastOpenDate: null,
      inactivityPenaltyApplied: false,
      daysInactive: 0,
      pointsLostToInactivity: 0,
    };
    setStats(initial);
    saveStats(initial);
    setInactivityInfo(null);
  }, []);

  return {
    stats,
    ranks: RANKS,
    pointsConfig: POINTS_CONFIG,
    getCurrentRank,
    getNextRank,
    getProgressToNextRank,
    addPoints,
    getTodayPoints,
    resetStats,
    inactivityInfo,
    dismissInactivityWarning,
  };
};