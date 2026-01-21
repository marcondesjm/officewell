import { useTrialStatus } from "./useTrialStatus";
import { useAuth } from "@/contexts/AuthContext";

export interface PlanFeatures {
  // Basic features (available to all)
  waterReminders: boolean;
  stretchReminders: boolean;
  eyeBreakReminders: boolean;
  basicStats: boolean;
  
  // Pro features
  detailedReports: boolean;
  customGoals: boolean;
  prioritySupport: boolean;
  noAds: boolean;
  
  // Enterprise features
  hrPanel: boolean;
  complianceReports: boolean;
  internalAnnouncements: boolean;
  employeeManagement: boolean;
  dedicatedSupport: boolean;
}

export interface PlanLimits {
  maxEmployees: number;
  maxAnnouncements: number;
  maxBirthdaySettings: number;
}

export type PlanType = "basic" | "pro" | "enterprise";

// Limites por plano
const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  basic: {
    maxEmployees: 3,
    maxAnnouncements: 1,
    maxBirthdaySettings: 1,
  },
  pro: {
    maxEmployees: 50,
    maxAnnouncements: 10,
    maxBirthdaySettings: 5,
  },
  enterprise: {
    maxEmployees: 999999,
    maxAnnouncements: 999999,
    maxBirthdaySettings: 999999,
  },
};

export const usePlanFeatures = () => {
  const { isOnTrial, planId, isExpired } = useTrialStatus();
  const { profile } = useAuth();

  // Check if demo mode is active via sessionStorage
  const isDemoModeActive = typeof window !== 'undefined' && 
    sessionStorage.getItem('officewell_demo_active') === 'true';

  // Determine current plan - priority: demo mode > profile.current_plan > trial > basic
  const getCurrentPlan = (): PlanType => {
    // 0. DEMO MODE - Full enterprise access (highest priority)
    if (isDemoModeActive) {
      return "enterprise";
    }
    
    // 1. First check authenticated user's plan from Supabase
    if (profile?.current_plan) {
      // Demo plan gets FULL access (enterprise level) during trial period
      if (profile.current_plan === "demo") {
        // Check if trial is still active
        if (profile.trial_ends_at) {
          const trialEnd = new Date(profile.trial_ends_at);
          if (trialEnd > new Date()) {
            return "enterprise"; // Full access during demo trial
          }
        }
        return "basic"; // Expired demo = basic
      }
      if (profile.current_plan === "enterprise") return "enterprise";
      if (profile.current_plan === "pro") return "pro";
      if (profile.current_plan === "free") return "basic";
    }
    
    // 2. Then check if user is on active trial
    if (isOnTrial && !isExpired && planId) {
      if (planId === "enterprise") return "enterprise";
      if (planId === "pro") return "pro";
    }
    
    // 3. Default to basic
    return "basic";
  };

  const currentPlan = getCurrentPlan();
  const limits = PLAN_LIMITS[currentPlan];

  // Define features for each plan
  const getFeatures = (): PlanFeatures => {
    const baseFeatures: PlanFeatures = {
      // Basic - available to all
      waterReminders: true,
      stretchReminders: true,
      eyeBreakReminders: true,
      basicStats: true,
      
      // Pro - locked by default
      detailedReports: false,
      customGoals: false,
      prioritySupport: false,
      noAds: false,
      
      // Enterprise - locked by default
      hrPanel: false,
      complianceReports: false,
      internalAnnouncements: false,
      employeeManagement: false,
      dedicatedSupport: false,
    };

    if (currentPlan === "pro") {
      return {
        ...baseFeatures,
        detailedReports: true,
        customGoals: true,
        prioritySupport: true,
        noAds: true,
      };
    }

    if (currentPlan === "enterprise") {
      return {
        ...baseFeatures,
        detailedReports: true,
        customGoals: true,
        prioritySupport: true,
        noAds: true,
        hrPanel: true,
        complianceReports: true,
        internalAnnouncements: true,
        employeeManagement: true,
        dedicatedSupport: true,
      };
    }

    return baseFeatures;
  };

  const features = getFeatures();

  const isFeatureLocked = (feature: keyof PlanFeatures): boolean => {
    return !features[feature];
  };

  const getRequiredPlan = (feature: keyof PlanFeatures): PlanType => {
    const proFeatures: (keyof PlanFeatures)[] = [
      "detailedReports",
      "customGoals",
      "prioritySupport",
      "noAds",
    ];
    
    const enterpriseFeatures: (keyof PlanFeatures)[] = [
      "hrPanel",
      "complianceReports",
      "internalAnnouncements",
      "employeeManagement",
      "dedicatedSupport",
    ];

    if (enterpriseFeatures.includes(feature)) return "enterprise";
    if (proFeatures.includes(feature)) return "pro";
    return "basic";
  };

  const canAddMore = (type: "employees" | "announcements", currentCount: number): boolean => {
    if (type === "employees") {
      return currentCount < limits.maxEmployees;
    }
    if (type === "announcements") {
      return currentCount < limits.maxAnnouncements;
    }
    return true;
  };

  const getRemainingSlots = (type: "employees" | "announcements", currentCount: number): number => {
    if (type === "employees") {
      return Math.max(0, limits.maxEmployees - currentCount);
    }
    if (type === "announcements") {
      return Math.max(0, limits.maxAnnouncements - currentCount);
    }
    return 999999;
  };

  return {
    currentPlan,
    features,
    limits,
    isFeatureLocked,
    getRequiredPlan,
    isOnTrial,
    isExpired,
    canAddMore,
    getRemainingSlots,
  };
};
