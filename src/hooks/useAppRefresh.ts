import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";

// Versão do app - atualize aqui a cada release
export const APP_VERSION = "1.2.3";

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

export const useAppRefresh = (checkInterval = 60 * 60 * 1000) => { // Default: 1 hour
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('checking');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    setSyncStatus('checking');
    
    try {
      // 1. Tentar atualizar o Service Worker primeiro
      const swUpdated = await forceServiceWorkerUpdate();
      
      // 2. Buscar versão do servidor com cache-busting agressivo
      const timestamp = Date.now();
      const response = await fetch(`${window.location.origin}/index.html?_nocache=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Extrair versão do HTML - buscar a constante APP_VERSION
      const html = await response.text();
      const versionMatch = html.match(/APP_VERSION\s*=\s*["']([^"']+)["']/);
      const serverVersion = versionMatch?.[1] || null;
      
      // Usar a versão encontrada no HTML, ou ETag como fallback
      const etag = response.headers.get('etag');
      const serverHash = serverVersion || etag || '';
      
      const storedVersion = localStorage.getItem('app-version-hash');
      
      console.log(`[PWA Update] Current: ${APP_VERSION}, Local: ${storedVersion}, Server: ${serverHash}, SW Updated: ${swUpdated}`);
      
      // Verificar se versão atual do código é diferente da armazenada
      const localVersionMismatch = storedVersion && storedVersion !== APP_VERSION;
      
      // Se o SW foi atualizado OU versão local não bate com a atual, aplicar imediatamente
      if (swUpdated || localVersionMismatch) {
        setSyncStatus('updating');
        toast.info("🔄 Nova versão disponível!", {
          description: "Aplicando atualização...",
          duration: 2000,
        });
        
        localStorage.setItem('app-version-hash', serverHash || APP_VERSION);
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
      
      // Verificar se versão do servidor é diferente da local
      const hasNewVersion = serverHash && storedVersion && serverHash !== storedVersion;
      
      if (hasNewVersion) {
        setSyncStatus('updating');
        toast.info("🔄 Nova versão disponível!", {
          description: "Aplicando atualização...",
          duration: 2000,
        });
        
        localStorage.setItem('app-version-hash', serverHash);
        localStorage.setItem('app-just-updated', 'true');
        
        // Limpar caches do PWA
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
