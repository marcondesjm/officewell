import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";

// Versão do app - atualize aqui a cada release
export const APP_VERSION = "1.2.0";

export type SyncStatus = 'synced' | 'checking' | 'updating' | 'error';

export const useAppRefresh = (checkInterval = 60 * 60 * 1000) => { // Default: 1 hour
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('checking');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    setSyncStatus('checking');
    
    try {
      // Fetch the current version from the server
      const response = await fetch(`${window.location.origin}/?_=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store'
      });
      
      const lastModified = response.headers.get('last-modified');
      const etag = response.headers.get('etag');
      
      const storedVersion = localStorage.getItem('app-version');
      const currentVersion = etag || lastModified || '';
      
      if (storedVersion && storedVersion !== currentVersion && currentVersion) {
        setSyncStatus('updating');
        toast.info("Nova versão disponível!", {
          description: "O app será atualizado automaticamente.",
          duration: 3000,
        });
        
        localStorage.setItem('app-version', currentVersion);
        
        // IMPORTANTE: Marcar que é uma atualização automática para preservar timers
        localStorage.setItem('app-update-in-progress', 'true');
        
        // Reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        
        return true; // Has updates
      } else if (currentVersion) {
        localStorage.setItem('app-version', currentVersion);
      }
      
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      return false; // No updates
    } catch (error) {
      console.error("Error checking for updates:", error);
      setSyncStatus('error');
      return false;
    }
  }, []);

  useEffect(() => {
    // Check on mount
    checkForUpdates();

    // Set up periodic checks
    const interval = setInterval(checkForUpdates, checkInterval);

    // Check when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdates, checkInterval]);

  return { checkForUpdates, syncStatus, lastSyncTime };
};
