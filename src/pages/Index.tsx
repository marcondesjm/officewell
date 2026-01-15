import { Eye, Dumbbell, Droplets, Download, Heart, Crown, RefreshCw, Coffee, Moon, Briefcase } from "lucide-react";
import { WaterTracker } from "@/components/WaterTracker";
import { ControlPanel } from "@/components/ControlPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ActiveTimerCard } from "@/components/ActiveTimerCard";
import { DonationDialog } from "@/components/DonationDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HealthTips } from "@/components/HealthTips";
import { StretchBreakModal } from "@/components/StretchBreakModal";
import { EyeBreakModal } from "@/components/EyeBreakModal";
import { WaterBreakModal } from "@/components/WaterBreakModal";
import { BirthdayCelebration } from "@/components/BirthdayCelebration";

import { ComplianceReport } from "@/components/ComplianceReport";
import { HRPanel } from "@/components/HRPanel";
import { HRAnnouncementHeader } from "@/components/HRAnnouncementHeader";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { PlansHighlight } from "@/components/PlansHighlight";
import { WorkScheduleSetup } from "@/components/WorkScheduleSetup";
import { useReminders } from "@/hooks/useReminders";
import { useAppRefresh, APP_VERSION } from "@/hooks/useAppRefresh";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const {
    config,
    state,
    stats,
    toggleRunning,
    resetTimers,
    updateConfig,
    requestNotificationPermission,
    closeStretchModal,
    closeEyeModal,
    closeWaterModal,
    workSchedule,
    updateWorkSchedule,
    needsWorkScheduleConfig,
    getWorkStatus,
  } = useReminders();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [workScheduleOpen, setWorkScheduleOpen] = useState(false);
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Show work schedule setup on first load
  useEffect(() => {
    if (needsWorkScheduleConfig) {
      setWorkScheduleOpen(true);
    }
  }, [needsWorkScheduleConfig]);

  // Auto-refresh every hour to keep app updated
  const { checkForUpdates } = useAppRefresh(60 * 60 * 1000);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Limpar cache do service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.update();
        }
      }
      
      // Limpar caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Forçar reload
      window.location.reload();
    } catch (e) {
      console.error('Erro ao atualizar:', e);
      window.location.reload();
    }
  };

  useEffect(() => {
    // Mostrar botão de instalar se não estiver no modo standalone
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setShowInstallButton(!isStandalone);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-decoration">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with HR Announcements */}
        <header className="text-center space-y-6 py-6 animate-fade-in">
          <HRAnnouncementHeader />
          
          {/* Work Status Indicator */}
          {workSchedule.isConfigured && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {getWorkStatus() === 'before_work' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <Briefcase className="h-4 w-4" />
                  Aguardando início do expediente ({workSchedule.startTime})
                </div>
              )}
              {getWorkStatus() === 'lunch' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium">
                  <Coffee className="h-4 w-4" />
                  Horário de almoço - Bom apetite! 🍽️
                </div>
              )}
              {getWorkStatus() === 'after_work' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium">
                  <Moon className="h-4 w-4" />
                  Fim do expediente - Descanse bem! 🌙
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWorkScheduleOpen(true)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ⚙️ {workSchedule.startTime} - {workSchedule.endTime}
              </Button>
            </div>
          )}
          
          {!state.isRunning && getWorkStatus() === 'working' && (
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


        {/* Relatório de Conformidade */}
        <ComplianceReport />

        {/* Painel RH */}
        <HRPanel />

        {/* Planos em Destaque */}
        <PlansHighlight onSelectPlan={() => setPlansOpen(true)} />

        {/* Dicas de Saúde */}
        <HealthTips />

        {/* Dialog de Configurações */}
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          config={config}
          onSave={updateConfig}
        />

        {/* Dialog de Doação */}
        <DonationDialog
          open={donationOpen}
          onOpenChange={setDonationOpen}
        />

        {/* Dialog de Planos */}
        <SubscriptionPlans
          open={plansOpen}
          onOpenChange={setPlansOpen}
        />

        {/* Modal de Alongamento */}
        <StretchBreakModal
          open={state.showStretchModal}
          onClose={closeStretchModal}
        />

        {/* Modal de Descanso Visual */}
        <EyeBreakModal
          open={state.showEyeModal}
          onClose={closeEyeModal}
        />

        {/* Modal de Hidratação */}
        <WaterBreakModal
          open={state.showWaterModal}
          onClose={closeWaterModal}
        />

        {/* Celebração de Aniversário */}
        <BirthdayCelebration />

        {/* Work Schedule Setup */}
        <WorkScheduleSetup
          open={workScheduleOpen}
          onSave={(newSchedule) => {
            updateWorkSchedule(newSchedule);
            setWorkScheduleOpen(false);
          }}
          currentSchedule={workSchedule}
        />

        {/* Footer */}
        <footer className="text-center pt-8 pb-4 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ThemeToggle />
            <Button
              onClick={handleManualRefresh}
              variant="outline"
              disabled={isRefreshing}
              className="rounded-2xl border-2 hover:bg-primary/5"
            >
              <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
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
            <Button
              onClick={() => setDonationOpen(true)}
              variant="outline"
              className="rounded-2xl border-2 hover:bg-pink-500/5 hover:border-pink-500/50 hover:text-pink-500"
            >
              <Heart size={18} className="mr-2" />
              Apoiar Projeto
            </Button>
            <Button
              onClick={() => setPlansOpen(true)}
              variant="outline"
              className="rounded-2xl border-2 hover:bg-yellow-500/5 hover:border-yellow-500/50 hover:text-yellow-600"
            >
              <Crown size={18} className="mr-2" />
              Ver Planos
            </Button>
          </div>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Mantenha-se saudável e produtivo 
            <span className="text-lg">💪</span>
          </p>
          <p className="text-xs text-muted-foreground/60">
            Versão {APP_VERSION}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
