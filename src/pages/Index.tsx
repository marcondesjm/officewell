import { Eye, Dumbbell, Droplets, Sparkles, Download } from "lucide-react";
import { WaterTracker } from "@/components/WaterTracker";
import { ControlPanel } from "@/components/ControlPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ActiveTimerCard } from "@/components/ActiveTimerCard";
import { useReminders } from "@/hooks/useReminders";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  const [showInstallButton, setShowInstallButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Mostrar botão de instalar se não estiver no modo standalone
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setShowInstallButton(!isStandalone);
  }, []);

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
        <footer className="text-center pt-8 pb-4 space-y-4">
          {showInstallButton && (
            <Button
              onClick={() => navigate("/install")}
              variant="outline"
              className="rounded-2xl border-2 hover:bg-primary/5"
            >
              <Download size={18} className="mr-2" />
              Instalar App
            </Button>
          )}
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Mantenha-se saudável e produtivo 
            <span className="text-lg">💪</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
