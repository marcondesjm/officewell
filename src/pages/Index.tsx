import { Eye, Dumbbell, Droplets } from "lucide-react";
import { WaterTracker } from "@/components/WaterTracker";
import { ControlPanel } from "@/components/ControlPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ActiveTimerCard } from "@/components/ActiveTimerCard";
import { useReminders } from "@/hooks/useReminders";
import { useState } from "react";

const Index = () => {
  const {
    config,
    state,
    toggleRunning,
    resetTimers,
    updateConfig,
    requestNotificationPermission,
  } = useReminders();

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent">
            Bem-Estar Home Office
          </h1>
          <p className="text-muted-foreground text-lg">
            Cuide da sua saúde enquanto trabalha 🌱
          </p>
          {!state.isRunning && (
            <p className="text-sm text-accent font-medium animate-pulse-soft">
              ⏸️ Lembretes pausados
            </p>
          )}
        </header>

        {/* Painel de Controle */}
        <ControlPanel
          isRunning={state.isRunning}
          onToggle={toggleRunning}
          onReset={resetTimers}
          onSettings={() => setSettingsOpen(true)}
          onNotifications={requestNotificationPermission}
        />

        {/* Timers Ativos */}
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

        {/* Contador de Água */}
        <WaterTracker />

        {/* Dialog de Configurações */}
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          config={config}
          onSave={updateConfig}
        />

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8">
          <p>Mantenha-se saudável e produtivo 💪</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
