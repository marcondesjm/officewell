import { Sparkles, Crown, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useState } from "react";

interface DemoBannerProps {
  onUpgrade: () => void;
}

export const DemoBanner = ({ onUpgrade }: DemoBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const { daysRemaining, hoursRemaining, percentageUsed, isExpired } = useTrialStatus();

  if (dismissed) return null;

  // Calculate display values
  const showHours = daysRemaining <= 1;
  const isUrgent = daysRemaining <= 2;
  const progressValue = Math.max(0, 100 - percentageUsed);

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 p-4 animate-fade-in shadow-lg ${
      isExpired 
        ? "bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 border-red-500/40"
        : isUrgent
        ? "bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border-amber-500/40"
        : "bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 border-violet-500/40"
    }`}>
      {/* Background sparkles */}
      <div className="absolute top-1 right-8 text-violet-400/30 animate-pulse">
        <Sparkles className="h-8 w-8" />
      </div>
      <div className="absolute bottom-1 left-12 text-fuchsia-400/20 animate-pulse delay-300">
        <Sparkles className="h-6 w-6" />
      </div>

      <div className="relative flex flex-col gap-4">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
              isExpired 
                ? "bg-gradient-to-br from-red-500 to-orange-500"
                : isUrgent
                ? "bg-gradient-to-br from-amber-500 to-orange-500 animate-pulse"
                : "bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-pulse"
            }`}>
              {isUrgent || isExpired ? (
                <Clock className="h-6 w-6 text-white" />
              ) : (
                <Sparkles className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`font-bold text-lg bg-clip-text text-transparent ${
                  isExpired
                    ? "bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400"
                    : isUrgent
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400"
                    : "bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400"
                }`}>
                  {isExpired ? "⏰ Demo Expirado" : "🎮 Conta Demo Ativa"}
                </p>
                {isUrgent && !isExpired && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium animate-pulse">
                    Expira em breve!
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isExpired 
                  ? "Seu período de demonstração terminou. Assine para continuar!"
                  : "Você está explorando todas as funcionalidades gratuitamente!"
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={onUpgrade} 
              size="sm" 
              className={`gap-1.5 text-white shadow-lg ${
                isExpired || isUrgent
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  : "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
              }`}
            >
              <Crown className="h-4 w-4" />
              {isExpired ? "Assinar Agora" : "Ver Planos"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline progress */}
        {!isExpired && (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-foreground/10">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className={`h-4 w-4 ${isUrgent ? "text-amber-500" : "text-violet-500"}`} />
              <span className={isUrgent ? "text-amber-600 dark:text-amber-400" : ""}>
                {showHours ? (
                  <>{hoursRemaining}h restantes</>
                ) : (
                  <>{daysRemaining} {daysRemaining === 1 ? "dia restante" : "dias restantes"}</>
                )}
              </span>
            </div>
            
            <div className="flex-1 w-full sm:max-w-xs">
              <div className="relative">
                <Progress 
                  value={progressValue} 
                  className={`h-3 ${isUrgent ? "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500" : "[&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-fuchsia-500"}`}
                />
                {/* Month markers for 3-month trial */}
                <div className="absolute top-0 left-0 right-0 h-full flex justify-between px-0.5 pointer-events-none">
                  {[1, 2].map((month) => (
                    <div 
                      key={month} 
                      className="w-px h-full bg-foreground/20"
                      style={{ left: `${(month / 3) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Mês 1</span>
                <span>Mês 3</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
