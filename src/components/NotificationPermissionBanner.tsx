import { useState, useEffect } from "react";
import { Bell, BellRing, X, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationPermissionBannerProps {
  onRequestPermission: () => void;
}

export function NotificationPermissionBanner({ onRequestPermission }: NotificationPermissionBannerProps) {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [isDismissed, setIsDismissed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermissionStatus('unsupported');
      return;
    }

    setPermissionStatus(Notification.permission);

    // Check periodically for permission changes
    const interval = setInterval(() => {
      setPermissionStatus(Notification.permission);
    }, 1000);

    // Check if user dismissed it previously (only for default state)
    const dismissed = localStorage.getItem('notification-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 24 hours
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('notification-banner-dismissed', Date.now().toString());
  };

  const handleRequestPermission = async () => {
    setIsAnimating(true);
    await onRequestPermission();
    setTimeout(() => setIsAnimating(false), 1000);
  };

  // Don't show if permission already granted, unsupported, or dismissed
  if (permissionStatus === 'granted' || permissionStatus === 'unsupported' || isDismissed) {
    return null;
  }

  const isDenied = permissionStatus === 'denied';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className={`relative overflow-hidden border-2 ${
          isDenied 
            ? 'border-destructive/30 bg-destructive/5' 
            : 'border-primary/30 bg-primary/5'
        }`}>
          {/* Animated background gradient */}
          <div className={`absolute inset-0 opacity-30 ${
            isDenied
              ? 'bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10'
              : 'bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10'
          } animate-pulse`} />
          
          {/* Dismiss button */}
          {!isDenied && (
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-background/50 transition-colors z-10"
              aria-label="Fechar banner"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          )}

          <div className="relative p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon */}
              <div className={`p-3 sm:p-4 rounded-2xl ${
                isDenied
                  ? 'bg-destructive/10'
                  : 'bg-primary/10'
              } ${isAnimating ? 'animate-bounce' : ''}`}>
                {isDenied ? (
                  <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />
                ) : (
                  <Bell className={`h-7 w-7 sm:h-8 sm:w-8 ${
                    isAnimating ? 'text-primary animate-pulse' : 'text-primary'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1.5 pr-8 sm:pr-0">
                <h3 className={`font-bold text-base sm:text-lg ${
                  isDenied ? 'text-destructive' : 'text-foreground'
                }`}>
                  {isDenied 
                    ? '⚠️ Notificações Bloqueadas' 
                    : '🔔 Ative as Notificações do Sistema'
                  }
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isDenied ? (
                    <>
                      As notificações foram bloqueadas no navegador. Para receber alertas de pausas, 
                      clique no <strong>🔒 cadeado</strong> na barra de endereço e permita notificações.
                    </>
                  ) : (
                    <>
                      Receba alertas de <strong>pausas para descanso</strong>, <strong>alongamento</strong> e <strong>hidratação</strong> diretamente 
                      no seu Windows/Mac, mesmo com o navegador minimizado!
                    </>
                  )}
                </p>
              </div>

              {/* Action Button */}
              <div className="w-full sm:w-auto flex-shrink-0">
                {isDenied ? (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-destructive/50 text-destructive hover:bg-destructive/10 rounded-xl min-h-12 px-5 font-semibold touch-manipulation"
                    onClick={() => {
                      // Open browser settings instructions
                      window.open('https://support.google.com/chrome/answer/3220216?hl=pt-BR', '_blank');
                    }}
                  >
                    <ExternalLink size={18} className="mr-2" />
                    Como ativar
                  </Button>
                ) : (
                  <Button
                    onClick={handleRequestPermission}
                    className="w-full sm:w-auto gradient-primary min-h-12 px-6 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-95"
                  >
                    <BellRing size={20} className={`mr-2 ${isAnimating ? 'animate-bounce' : ''}`} />
                    Ativar Alertas
                  </Button>
                )}
              </div>
            </div>

            {/* Features list for default state */}
            {!isDenied && (
              <div className="mt-4 pt-4 border-t border-primary/10">
                <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80">
                    ✅ Alertas no Windows/Mac
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80">
                    ✅ Funciona minimizado
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80">
                    ✅ Som personalizável
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
