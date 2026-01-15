import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tip {
  id: string;
  iconType: string;
  title: string;
  description: string;
}

interface TipsResponse {
  tips: Tip[];
  generatedAt: string;
}

const CACHE_KEY = 'officewell_dynamic_tips';
const CACHE_EXPIRY_HOURS = 24;

export const useDynamicTips = () => {
  const [tips, setTips] = useState<Tip[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const getCachedTips = useCallback((): TipsResponse | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      const cachedDate = new Date(parsed.generatedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - cachedDate.getTime()) / (1000 * 60 * 60);

      // Check if cache is still valid (less than 24 hours old)
      if (hoursDiff < CACHE_EXPIRY_HOURS) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const setCachedTips = useCallback((data: TipsResponse) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to cache tips:', err);
    }
  }, []);

  const fetchTips = useCallback(async (forceRefresh = false) => {
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = getCachedTips();
      if (cached) {
        setTips(cached.tips);
        setLastUpdated(cached.generatedAt);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('generate-health-tips');

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data?.tips) {
        setTips(data.tips);
        setLastUpdated(data.generatedAt);
        setCachedTips(data);
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error fetching tips:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar dicas');
      // Keep showing cached tips if available
      const cached = getCachedTips();
      if (cached) {
        setTips(cached.tips);
        setLastUpdated(cached.generatedAt);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getCachedTips, setCachedTips]);

  const refreshTips = useCallback(() => {
    fetchTips(true);
  }, [fetchTips]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  return {
    tips,
    isLoading,
    error,
    lastUpdated,
    refreshTips,
  };
};
