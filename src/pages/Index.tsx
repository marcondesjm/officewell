import { Eye, Dumbbell, Droplets, Sparkles } from "lucide-react";
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
    <div className="min-h-screen p-4 md:p-8 bg-decoration">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 py-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-muted-foreground mb-4 animate-float">
            <Sparkles size={16} className="text-primary" />
            <span>Seu parceiro de bem-estar</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gradient tracking-tight">
            OfficeWell
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto">
            Cuide da sua saúde enquanto trabalha 🌱
          </p>
          
          {!state.isRunning && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium animate-pulse-soft">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              Lembretes pausados
            </div>
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
        <footer className="text-center text-sm text-muted-foreground pt-8 pb-4">
          <p className="flex items-center justify-center gap-2">
            Mantenha-se saudável e produtivo 
            <span className="text-lg">💪</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
