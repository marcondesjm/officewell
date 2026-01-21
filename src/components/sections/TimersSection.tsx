import { Eye, Dumbbell, Droplets } from "lucide-react";
import { ActiveTimerCard } from "@/components/ActiveTimerCard";
import { ControlPanel } from "@/components/ControlPanel";

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
}

export const TimersSection = ({
  config,
  state,
  toggleRunning,
  resetTimers,
  onSettings,
  requestNotificationPermission,
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
    </section>
  );
};
