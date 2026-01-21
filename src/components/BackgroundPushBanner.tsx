import { useState, useEffect } from "react";
import { Bell, BellOff, Smartphone, Wifi, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { usePushNotificationsNew } from "@/hooks/usePushNotificationsNew";

export function BackgroundPushBanner() {
  const { 
    isSupported, 
    isSubscribed, 
    hasActiveDbSubscription, 
    permission,
    isLoading,
    subscribe 
  } = usePushNotificationsNew();
  
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if user dismissed it previously
    const dismissed = localStorage.getItem('background-push-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }
  }, []);

  // Show success message briefly when subscribed
  useEffect(() => {
    if (isSubscribed && hasActiveDbSubscription) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        handleDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubscribed, hasActiveDbSubscription]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('background-push-banner-dismissed', Date.now().toString());
  };

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setShowSuccess(true);
    }
  };

  // Don't show if not supported, already subscribed, or dismissed
  if (!isSupported || permission === 'denied' || isDismissed) {
    return null;
  }

  // Already has active subscription - don't show
  if (isSubscribed && hasActiveDbSubscription && !showSuccess) {
    return null;
  }

  // Show success state
  if (showSuccess) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-600 dark:text-green-400">
                  ✅ Notificações Ativadas!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você receberá lembretes mesmo com o app fechado.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="relative overflow-hidden border-2 border-orange-500/30 bg-orange-500/5">
          {/* Animated background gradient */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10" />
          
          <div className="relative p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon */}
              <div className="p-3 sm:p-4 rounded-2xl bg-orange-500/10">
                <Smartphone className="h-7 w-7 sm:h-8 sm:w-8 text-orange-500" />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1.5">
                <h3 className="font-bold text-base sm:text-lg text-foreground">
                  📱 Notificações em Segundo Plano
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para receber lembretes <strong>mesmo com o celular bloqueado ou app fechado</strong>, 
                  ative as notificações push. Essencial para não perder seus lembretes!
                </p>
              </div>

              {/* Action Button */}
              <div className="w-full sm:w-auto flex-shrink-0">
                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 min-h-12 px-6 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <Wifi className="mr-2 h-5 w-5 animate-pulse" />
                      Ativando...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-5 w-5" />
                      Ativar Push
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Features list */}
            <div className="mt-4 pt-4 border-t border-orange-500/10">
              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80">
                  📲 Funciona com app fechado
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80">
                  🔔 Notificações no celular
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80">
                  ⏰ Lembretes automáticos
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
