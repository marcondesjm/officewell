import { Eye, Dumbbell, Droplets, Download, Heart, Crown, RefreshCw, Coffee, Moon, Briefcase, ScanFace, Activity, Target, Sparkles } from "lucide-react";
import { WaterTracker } from "@/components/WaterTracker";
import { ControlPanel } from "@/components/ControlPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ActiveTimerCard } from "@/components/ActiveTimerCard";
import { DonationDialog } from "@/components/DonationDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HealthTips } from "@/components/HealthTips";
import { TipOfTheDay } from "@/components/TipOfTheDay";
import { StretchBreakModal } from "@/components/StretchBreakModal";
import { EyeBreakModal } from "@/components/EyeBreakModal";
import { WaterBreakModal } from "@/components/WaterBreakModal";
import { BirthdayCelebration } from "@/components/BirthdayCelebration";
import { PostureCheckModal } from "@/components/PostureCheckModal";
import { DailyErgonomicsSession } from "@/components/DailyErgonomicsSession";
import { GamificationCard } from "@/components/GamificationCard";
import { InactivityWarning } from "@/components/InactivityWarning";
import { OnboardingTour, useTour } from "@/components/OnboardingTour";
import { useGamification } from "@/hooks/useGamification";
import { ComplianceReport } from "@/components/ComplianceReport";
import { HRPanel } from "@/components/HRPanel";
import { HRAnnouncementHeader } from "@/components/HRAnnouncementHeader";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { PlansHighlight } from "@/components/PlansHighlight";
import { PlanDemoModal } from "@/components/PlanDemoModal";
import { TrialBanner } from "@/components/TrialBanner";
import { WorkScheduleSetup } from "@/components/WorkScheduleSetup";
import { AdBanner } from "@/components/AdBanner";
import { PartnersBanner } from "@/components/PartnersBanner";
import logoOfficeWell from "@/assets/logo-officewell.png";
import { LockedFeature } from "@/components/LockedFeature";
import { useReminders } from "@/hooks/useReminders";
import { useAppRefresh, APP_VERSION } from "@/hooks/useAppRefresh";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { useGoals } from "@/hooks/useGoals";
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
    getRemainingWorkMinutes,
    optimalIntervals,
  } = useReminders();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoPlanId, setDemoPlanId] = useState<string | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [workScheduleOpen, setWorkScheduleOpen] = useState(false);
  const [postureCheckOpen, setPostureCheckOpen] = useState(false);
  const [dailySessionOpen, setDailySessionOpen] = useState(false);
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Plan features
  const { currentPlan, features, isFeatureLocked, getRequiredPlan } = usePlanFeatures();
  
  // Goals tracking
  const { goals, incrementProgress, getTotalProgress } = useGoals();
  const goalsProgress = getTotalProgress();
  
  // Gamification with inactivity tracking
  const { inactivityInfo, dismissInactivityWarning } = useGamification();
  
  // Tour hook
  const { resetTour } = useTour();
  
  // Show work schedule setup on first load (but not during tour)
  useEffect(() => {
    const isTourActive = sessionStorage.getItem('officewell_new_demo') === 'true' && 
                         localStorage.getItem('officewell_tour_completed') !== 'true';
    
    // Não abrir WorkScheduleSetup se o Tour estiver ativo
    if (needsWorkScheduleConfig && !isTourActive) {
      setWorkScheduleOpen(true);
    }
  }, [needsWorkScheduleConfig]);

  // Auto-refresh every hour to keep app updated
  const { checkForUpdates } = useAppRefresh(60 * 60 * 1000);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Mostrar feedback imediato
      const { toast } = await import("sonner");
      toast.info("Atualizando app...", { duration: 2000 });
      
      // Marcar que está atualizando para mostrar confirmação após reload
      localStorage.setItem('app-just-updated', 'true');
      
      // Limpar cache do service worker e forçar atualização
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          // Desregistrar o service worker atual
          await registration.unregister();
        }
      }
      
      // Limpar todos os caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Limpar localStorage de versão para forçar nova verificação
      localStorage.removeItem('app-version');
      
      // Pequeno delay para garantir que tudo foi limpo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Forçar reload completo usando location.href (funciona melhor em PWAs)
      window.location.href = window.location.origin + window.location.pathname + '?refresh=' + Date.now();
    } catch (e) {
      console.error('Erro ao atualizar:', e);
      localStorage.setItem('app-just-updated', 'true');
      // Fallback: reload simples
      window.location.href = window.location.origin + '?refresh=' + Date.now();
    }
  };

  // Verificar se acabou de atualizar e mostrar confirmação
  useEffect(() => {
    const justUpdated = localStorage.getItem('app-just-updated');
    if (justUpdated === 'true') {
      localStorage.removeItem('app-just-updated');
      
      // Importar toast dinamicamente e mostrar confirmação
      import("sonner").then(({ toast }) => {
        toast.success("✨ App atualizado com sucesso!", {
          description: `Versão ${APP_VERSION} - Todos os recursos estão atualizados.`,
          duration: 4000,
        });
      });
    }
  }, []);

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
              {getWorkStatus() === 'working' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                  <Briefcase className="h-4 w-4" />
                  <span>
                    Expediente ativo • {Math.floor(getRemainingWorkMinutes() / 60)}h{getRemainingWorkMinutes() % 60}min restantes
                  </span>
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

        {/* Inactivity Warning */}
        {inactivityInfo && (
          <InactivityWarning info={inactivityInfo} onDismiss={dismissInactivityWarning} />
        )}

        {/* Trial Banner */}
        <TrialBanner onUpgrade={() => setPlansOpen(true)} />

        {/* Dica do Dia */}
        <TipOfTheDay />

        {/* Ranking e Pontuação */}
        <GamificationCard />

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

        {/* Botões de Postura e Sessão Diária */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 glass-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                  <ScanFace className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Monitoramento de Postura</h3>
                  <p className="text-sm text-muted-foreground">
                    Analise sua postura usando a câmera
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setPostureCheckOpen(true)}
                className="gradient-primary"
              >
                <ScanFace className="h-4 w-4 mr-2" />
                Verificar
              </Button>
            </div>
          </Card>

          <Card className="p-4 glass-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                  <Activity className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Sessão Diária de Ergonomia</h3>
                  <p className="text-sm text-muted-foreground">
                    5 exercícios rápidos para sua saúde
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setDailySessionOpen(true)}
                variant="secondary"
              >
                <Activity className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
            </div>
          </Card>
        </div>

        {/* Goals Card - Minhas Metas */}
        <Card className="p-4 glass-card overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <Target className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold">Minhas Metas</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe seu progresso diário
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-2xl font-bold text-amber-500">{goalsProgress.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Progresso hoje</p>
              </div>
              <Button 
                onClick={() => navigate("/metas")}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Target className="h-4 w-4 mr-2" />
                Ver Metas
              </Button>
            </div>
          </div>
        </Card>

        {/* Contador de Água */}
        <WaterTracker />

        {/* Anúncio para plano básico */}
        {!features.noAds && (
          <>
            <PartnersBanner />
            <AdBanner onUpgrade={() => setPlansOpen(true)} variant="banner" />
          </>
        )}

        {/* Relatório de Conformidade - Bloqueado para plano básico */}
        {features.complianceReports ? (
          <ComplianceReport />
        ) : (
          <LockedFeature
            featureName="Relatórios de Compliance"
            requiredPlan={getRequiredPlan("complianceReports")}
            description="Acompanhe a conformidade da equipe com relatórios detalhados e métricas de adesão."
            onUpgrade={() => setPlansOpen(true)}
          />
        )}

        {/* Painel RH - Bloqueado para planos básico e pro */}
        {features.hrPanel ? (
          <HRPanel />
        ) : (
          <LockedFeature
            featureName="Painel Administrativo RH"
            requiredPlan={getRequiredPlan("hrPanel")}
            description="Gerencie funcionários, aniversários e comunicados internos para toda a empresa."
            onUpgrade={() => setPlansOpen(true)}
          />
        )}

        {/* Planos em Destaque */}
        <PlansHighlight 
          onSelectPlan={(planId) => {
            setSelectedPlanId(planId || null);
            setPlansOpen(true);
          }} 
          onShowDemo={(planId) => {
            setDemoPlanId(planId);
            setDemoOpen(true);
          }}
        />

        {/* Demo Modal */}
        <PlanDemoModal
          open={demoOpen}
          onOpenChange={setDemoOpen}
          planId={demoPlanId}
          onSelectPlan={(planId) => {
            setSelectedPlanId(planId);
            setPlansOpen(true);
          }}
        />

        {/* Anúncio adicional para plano básico */}
        {!features.noAds && (
          <AdBanner onUpgrade={() => setPlansOpen(true)} variant="inline" />
        )}

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
          onOpenChange={(open) => {
            setPlansOpen(open);
            if (!open) setSelectedPlanId(null);
          }}
          preSelectedPlan={selectedPlanId}
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

        {/* Modal de Verificação de Postura */}
        <PostureCheckModal
          open={postureCheckOpen}
          onOpenChange={setPostureCheckOpen}
        />

        {/* Modal de Sessão Diária */}
        <DailyErgonomicsSession
          open={dailySessionOpen}
          onOpenChange={setDailySessionOpen}
        />

        {/* Work Schedule Setup */}
        <WorkScheduleSetup
          open={workScheduleOpen}
          onOpenChange={setWorkScheduleOpen}
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
            <Button
              onClick={resetTour}
              variant="outline"
              className="rounded-2xl border-2 hover:bg-primary/5 hover:border-primary/50"
            >
              <Sparkles size={18} className="mr-2" />
              Ver Tour
            </Button>
          </div>
          <img 
            src={logoOfficeWell} 
            alt="OfficeWell" 
            className="h-10 w-auto object-contain mx-auto drop-shadow-md"
          />
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Mantenha-se saudável e produtivo 
            <span className="text-lg">💪</span>
          </p>
          <p className="text-xs text-muted-foreground/60">
            Versão {APP_VERSION}
          </p>
          {/* Legal Disclaimer */}
          <p className="text-[10px] text-muted-foreground/50 max-w-md mx-auto leading-tight pt-2">
            ⚖️ As orientações do OfficeWell têm caráter educativo e não substituem avaliação médica ou fisioterapêutica.
          </p>
        </footer>
      </div>
      
      {/* Onboarding Tour for new demo users */}
      <OnboardingTour />
    </div>
  );
};

export default Index;
