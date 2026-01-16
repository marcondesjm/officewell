import { Crown, Clock, AlertTriangle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useState } from "react";

interface TrialBannerProps {
  onUpgrade: () => void;
}

export const TrialBanner = ({ onUpgrade }: TrialBannerProps) => {
  const { isOnTrial, planName, daysRemaining, hoursRemaining, percentageUsed, isExpired } = useTrialStatus();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || (!isOnTrial && !isExpired)) return null;

  // Trial expired
  if (isExpired) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 p-4 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-red-600 dark:text-red-400">
                Seu período de teste expirou
              </p>
              <p className="text-sm text-muted-foreground">
                Assine o plano {planName} para continuar com todos os recursos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onUpgrade} size="sm" className="gap-1.5">
              <Crown className="h-4 w-4" />
              Assinar Agora
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Less than 2 days remaining - urgent
  const isUrgent = daysRemaining <= 2;

  // Less than 24 hours - show hours
  const showHours = daysRemaining === 1 && hoursRemaining < 24;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 animate-fade-in ${
        isUrgent
          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30"
          : "bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/30"
      }`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isUrgent ? "bg-amber-500/20" : "bg-primary/20"
            }`}
          >
            {isUrgent ? (
              <Clock className={`h-6 w-6 text-amber-500 ${isUrgent ? "animate-pulse" : ""}`} />
            ) : (
              <Sparkles className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-semibold ${isUrgent ? "text-amber-600 dark:text-amber-400" : ""}`}>
                Teste Grátis - {planName}
              </p>
              {isUrgent && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium animate-pulse">
                  Expira em breve!
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {showHours ? (
                <>
                  <span className="font-bold text-foreground">{hoursRemaining}h</span> restantes
                </>
              ) : (
                <>
                  <span className="font-bold text-foreground">{daysRemaining}</span>{" "}
                  {daysRemaining === 1 ? "dia restante" : "dias restantes"}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          {/* Progress bar */}
          <div className="w-full md:w-32">
            <Progress
              value={percentageUsed}
              className={`h-2 ${isUrgent ? "[&>div]:bg-amber-500" : ""}`}
            />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {Math.round(percentageUsed)}% utilizado
            </p>
          </div>

          <Button
            onClick={onUpgrade}
            size="sm"
            variant={isUrgent ? "default" : "outline"}
            className={`gap-1.5 ${isUrgent ? "bg-amber-500 hover:bg-amber-600" : ""}`}
          >
            <Crown className="h-4 w-4" />
            {isUrgent ? "Assinar Agora" : "Ver Planos"}
          </Button>
        </div>
      </div>
    </div>
  );
};
