import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // Só mostra toast se estava offline antes
      if (wasOfflineRef.current) {
        toast.success("✅ Conexão restaurada!", {
          description: "Você está online novamente.",
          duration: 3000,
        });
        wasOfflineRef.current = false;
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      wasOfflineRef.current = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
