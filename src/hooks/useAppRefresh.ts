import { useEffect, useCallback } from "react";
import { toast } from "sonner";

export const useAppRefresh = (checkInterval = 60 * 60 * 1000) => { // Default: 1 hour
  const checkForUpdates = useCallback(async () => {
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
        toast.info("Nova versão disponível!", {
          description: "O app será atualizado automaticamente.",
          duration: 3000,
        });
        
        localStorage.setItem('app-version', currentVersion);
        
        // Reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else if (currentVersion) {
        localStorage.setItem('app-version', currentVersion);
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
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

  return { checkForUpdates };
};
