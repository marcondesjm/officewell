import { Eye, Dumbbell, Droplets, Sun } from "lucide-react";
import { ActiveTimerCard } from "@/components/ActiveTimerCard";
import { ControlPanel } from "@/components/ControlPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TimersSectionProps {
  config: {
    eyeInterval: number;
    stretchInterval: number;
    waterInterval: number;
  };
  state: {
    eyeTimeLeft: number;
    stretchTimeLeft: number;
    waterTimeLeft: number;
    isRunning: boolean;
  };
  toggleRunning: () => void;
  resetTimers: () => void;
  onSettings: () => void;
  requestNotificationPermission: () => void;
  onSunBreak?: () => void;
}

export const TimersSection = ({
  config,
  state,
  toggleRunning,
  resetTimers,
  onSettings,
  requestNotificationPermission,
  onSunBreak,
}: TimersSectionProps) => {
  return (
    <section className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Pausas Ativas</h2>
        <p className="text-muted-foreground mt-1">
          Acompanhe seus lembretes de bem-estar
        </p>
      </div>

      {/* Control Panel */}
      <ControlPanel
        isRunning={state.isRunning}
        onToggle={toggleRunning}
        onReset={resetTimers}
        onSettings={onSettings}
        onNotifications={requestNotificationPermission}
      />

      {/* Timer Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <ActiveTimerCard
          icon={Eye}
          title="Descanso Visual"
          timeLeft={state.eyeTimeLeft}
          totalTime={config.eyeInterval * 60}
          variant="primary"
        />
        <ActiveTimerCard
          icon={Dumbbell}
          title="Alongamento"
          timeLeft={state.stretchTimeLeft}
          totalTime={config.stretchInterval * 60}
          variant="secondary"
        />
        <ActiveTimerCard
          icon={Droplets}
          title="Hidratação"
          timeLeft={state.waterTimeLeft}
          totalTime={config.waterInterval * 60}
          variant="accent"
        />
      </div>

      {/* Sun Break Card */}
      <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
              <Sun className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">☀️ Banho de Sol</h3>
              <p className="text-sm text-muted-foreground">
                Tome sol por 1-5 min para vitamina D (recomendado 1-2x ao dia)
              </p>
            </div>
          </div>
          <Button
            onClick={onSunBreak}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
          >
            Iniciar
          </Button>
        </div>
      </Card>
    </section>
  );
};
