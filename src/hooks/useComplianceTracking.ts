import { useState, useEffect, useCallback } from "react";

interface ComplianceRecord {
  type: "eye" | "stretch" | "water";
  scheduledAt: number;
  completedAt: number | null;
  duration: number; // time spent on break in seconds
  wasCompliant: boolean; // completed within required time
}

interface DailyCompliance {
  date: string;
  records: ComplianceRecord[];
  complianceRate: number;
}

const STORAGE_KEY = "complianceRecords";
const MIN_BREAK_DURATION = {
  eye: 20, // 20 seconds minimum
  stretch: 30, // 30 seconds minimum
  water: 10, // 10 seconds minimum
};

const loadRecords = (): ComplianceRecord[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveRecords = (records: ComplianceRecord[]) => {
  // Keep only last 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const filtered = records.filter((r) => r.scheduledAt > thirtyDaysAgo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

const getDateString = (timestamp: number): string => {
  return new Date(timestamp).toISOString().split("T")[0];
};

export const useComplianceTracking = () => {
  const [records, setRecords] = useState<ComplianceRecord[]>(loadRecords);
  const [activeBreak, setActiveBreak] = useState<
    {
      type: "eye" | "stretch" | "water";
      startTime: number;
      scheduledAt: number;
    } | null
  >(null);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const startBreak = useCallback((type: "eye" | "stretch" | "water", scheduledAt: number) => {
    setActiveBreak({
      type,
      startTime: Date.now(),
      scheduledAt,
    });
  }, []);

  const completeBreak = useCallback(() => {
    if (!activeBreak) return { canClose: true, remainingTime: 0 };

    const elapsed = Math.floor((Date.now() - activeBreak.startTime) / 1000);
    const minDuration = MIN_BREAK_DURATION[activeBreak.type];
    const remainingTime = Math.max(0, minDuration - elapsed);

    if (remainingTime > 0) {
      return { canClose: false, remainingTime };
    }

    const record: ComplianceRecord = {
      type: activeBreak.type,
      scheduledAt: activeBreak.scheduledAt,
      completedAt: Date.now(),
      duration: elapsed,
      wasCompliant: true,
    };

    setRecords((prev) => [...prev, record]);
    setActiveBreak(null);

    return { canClose: true, remainingTime: 0 };
  }, [activeBreak]);

  const skipBreak = useCallback((type: "eye" | "stretch" | "water", scheduledAt: number) => {
    const record: ComplianceRecord = {
      type,
      scheduledAt,
      completedAt: null,
      duration: 0,
      wasCompliant: false,
    };
    setRecords((prev) => [...prev, record]);
    setActiveBreak(null);
  }, []);

  const getTodayCompliance = useCallback((): DailyCompliance => {
    const today = getDateString(Date.now());
    const todayRecords = records.filter(
      (r) => getDateString(r.scheduledAt) === today
    );
    const completed = todayRecords.filter((r) => r.wasCompliant).length;
    const total = todayRecords.length;

    return {
      date: today,
      records: todayRecords,
      complianceRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [records]);

  const getWeekCompliance = useCallback((): DailyCompliance[] => {
    const days: DailyCompliance[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = getDateString(date.getTime());

      const dayRecords = records.filter(
        (r) => getDateString(r.scheduledAt) === dateStr
      );
      const completed = dayRecords.filter((r) => r.wasCompliant).length;
      const total = dayRecords.length;

      days.push({
        date: dateStr,
        records: dayRecords,
        complianceRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    return days;
  }, [records]);

  const getDeviceId = useCallback((): string => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  }, []);

  const generateReport = useCallback(() => {
    const deviceId = getDeviceId();
    const weekData = getWeekCompliance();
    const todayData = getTodayCompliance();

    return {
      deviceId,
      generatedAt: new Date().toISOString(),
      today: todayData,
      weekSummary: weekData,
      overallComplianceRate: Math.round(
        weekData.reduce((acc, d) => acc + d.complianceRate, 0) / weekData.length
      ),
    };
  }, [getDeviceId, getWeekCompliance, getTodayCompliance]);

  return {
    activeBreak,
    startBreak,
    completeBreak,
    skipBreak,
    getTodayCompliance,
    getWeekCompliance,
    generateReport,
    getDeviceId,
    minBreakDuration: MIN_BREAK_DURATION,
  };
};
