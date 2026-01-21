import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";

// Versão do app - atualize aqui a cada release
export const APP_VERSION = "1.2.4";

export type SyncStatus = 'synced' | 'checking' | 'updating' | 'error';

// Função para forçar atualização do Service Worker
const forceServiceWorkerUpdate = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.update();
      
      // Se há uma nova versão esperando, ativar ela
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Erro ao atualizar Service Worker:', error);
    return false;
  }
};

// Função para limpeza agressiva de cache
const forceFullCacheClear = async (): Promise<void> => {
  console.log('[PWA Cache] Starting aggressive cache clear...');
  
  // 1. Clear all caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log(`[PWA Cache] Clearing ${cacheNames.length} caches:`, cacheNames);
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
  
  // 2. Unregister all service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`[PWA Cache] Unregistering ${registrations.length} service workers`);
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
  
  // 3. Clear localStorage version tracking
  localStorage.removeItem('app-version-hash');
  sessionStorage.removeItem('app-update-in-progress');
  
  console.log('[PWA Cache] Cache clear complete');
};

export const useAppRefresh = (checkInterval = 60 * 60 * 1000) => { // Default: 1 hour
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('checking');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    setSyncStatus('checking');
    
    try {
      // Verificar se já está em processo de atualização para evitar loop
      const isUpdating = sessionStorage.getItem('app-update-in-progress');
      if (isUpdating === 'true') {
        // Limpar flag e considerar atualizado
        sessionStorage.removeItem('app-update-in-progress');
        localStorage.setItem('app-version-hash', APP_VERSION);
        setSyncStatus('synced');
        setLastSyncTime(new Date());
        return false;
      }
      
      // 1. Tentar atualizar o Service Worker primeiro
      const swUpdated = await forceServiceWorkerUpdate();
      
      const storedVersion = localStorage.getItem('app-version-hash');
      
      console.log(`[PWA Update] Current: ${APP_VERSION}, Stored: ${storedVersion}, SW Updated: ${swUpdated}`);
      
      // Verificar se versão armazenada é diferente da atual no código
      const needsUpdate = swUpdated || (storedVersion && storedVersion !== APP_VERSION);
      
      if (needsUpdate) {
        setSyncStatus('updating');
        toast.info("🔄 Nova versão disponível!", {
          description: "Aplicando atualização...",
          duration: 2000,
        });
        
        // Marcar que estamos atualizando para evitar loop
        sessionStorage.setItem('app-update-in-progress', 'true');
        localStorage.setItem('app-version-hash', APP_VERSION);
        localStorage.setItem('app-just-updated', 'true');
        
        // Limpar caches do PWA para forçar download dos novos arquivos
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        // Reload após breve delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
        return true;
      }
      
      // Sem atualizações - salvar versão atual se ainda não tiver
      if (!storedVersion) {
        localStorage.setItem('app-version-hash', APP_VERSION);
      }
      
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      return false;
    } catch (error) {
      console.error("Erro ao verificar atualizações:", error);
      setSyncStatus('error');
      return false;
    }
  }, []);

  // Função para forçar limpeza total e reload
  const forceHardRefresh = useCallback(async () => {
    setSyncStatus('updating');
    toast.info("🧹 Limpando cache...", {
      description: "Aguarde enquanto baixamos a versão mais recente.",
      duration: 3000,
    });
    
    try {
      await forceFullCacheClear();
      
      // Marcar para mostrar toast de sucesso após reload
      localStorage.setItem('app-just-updated', 'true');
      
      // Hard reload with cache bypass
      setTimeout(() => {
        window.location.href = window.location.href.split('?')[0] + '?cache_bust=' + Date.now();
      }, 1000);
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
      toast.error("Erro ao limpar cache. Tente recarregar a página manualmente.");
      setSyncStatus('error');
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

  return { checkForUpdates, forceHardRefresh, syncStatus, lastSyncTime };
};