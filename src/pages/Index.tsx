import { Eye, Dumbbell, Droplets, Download, Heart, Crown, RefreshCw, Coffee, Moon, Briefcase, ScanFace, Activity, Target, Sparkles, ClipboardCheck, WifiOff, Bell } from "lucide-react";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { WaterTracker } from "@/components/WaterTracker";
import { ControlPanel } from "@/components/ControlPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ActiveTimerCard } from "@/components/ActiveTimerCard";
import { DonationDialog } from "@/components/DonationDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HealthTips } from "@/components/HealthTips";
import { TipOfTheDay } from "@/components/TipOfTheDay";
import { MoodTracker } from "@/components/MoodTracker";
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
import { UserAccountHeader } from "@/components/UserAccountHeader";
import logoOfficeWell from "@/assets/logo-officewell.png";
import { LockedFeature } from "@/components/LockedFeature";
import { LGPDConsentBanner } from "@/components/LGPDConsentBanner";
import ParallaxBackground from "@/components/ParallaxBackground";
import { VirtualAssistant } from "@/components/VirtualAssistant";
import { useReminders } from "@/hooks/useReminders";
import { useAppRefresh, APP_VERSION, SyncStatus } from "@/hooks/useAppRefresh";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Check, AlertCircle, Loader2 } from "lucide-react";
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
  const { checkForUpdates, syncStatus, lastSyncTime } = useAppRefresh(60 * 60 * 1000);
  
  // Online status
  const isOnline = useOnlineStatus();

  // Verificação leve de atualizações (sem reload)
  const handleCheckUpdates = async () => {
    setIsRefreshing(true);
    
    try {
      const { toast } = await import("sonner");
      
      // Apenas verificar se há atualizações disponíveis
      const hasUpdates = await checkForUpdates();
      
      if (!hasUpdates) {
        toast.success("✅ App já está atualizado!", {
          description: `Versão ${APP_VERSION}`,
          duration: 2000,
        });
      }
      // Se hasUpdates = true, o hook useAppRefresh já mostra o toast e faz o reload
      
    } catch (e) {
      console.error('Erro ao verificar atualizações:', e);
      const { toast } = await import("sonner");
      toast.error("Erro ao verificar atualizações", { duration: 2000 });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Função para forçar atualização completa (apenas quando realmente necessário)
  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const { toast } = await import("sonner");
      toast.info("Forçando atualização...", { duration: 2000 });
      
      localStorage.setItem('app-just-updated', 'true');
      
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      localStorage.removeItem('app-version');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      window.location.href = window.location.origin + window.location.pathname + '?refresh=' + Date.now();
    } catch (e) {
      console.error('Erro ao atualizar:', e);
      localStorage.setItem('app-just-updated', 'true');
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
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Parallax Background */}
      <ParallaxBackground />
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header with HR Announcements */}
        <header className="text-center space-y-6 py-6 animate-fade-in">
          {/* Top bar with logo and user account */}
          <div className="flex items-center justify-between mb-4">
            <img 
              src={logoOfficeWell} 
              alt="OfficeWell" 
              className="h-8 sm:h-10 object-contain"
            />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserAccountHeader />
            </div>
          </div>
          
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
                variant="outline"
                onClick={() => setWorkScheduleOpen(true)}
                className="min-h-11 px-4 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium flex items-center gap-2 touch-manipulation active:scale-95 transition-all"
                aria-label="Alterar horário de trabalho"
              >
                ⚙️ {workSchedule.startTime} - {workSchedule.endTime}
                <span className="text-primary font-semibold">
                  (alterar)
                </span>
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

        {/* Notification Permission Banner - Most visible position */}
        <NotificationPermissionBanner onRequestPermission={requestNotificationPermission} />

        {/* Trial Banner */}
        <TrialBanner onUpgrade={() => setPlansOpen(true)} />

        {/* Mood Tracker e Dica do Dia */}
        <div className="grid md:grid-cols-2 gap-6">
          <MoodTracker />
          <TipOfTheDay />
        </div>

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
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          <Card className="p-5 glass-card hover:shadow-lg transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                  <ScanFace className="h-7 w-7 text-violet-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Monitoramento de Postura</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analise sua postura usando a câmera
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setPostureCheckOpen(true)}
                className="gradient-primary min-h-12 px-6 text-base font-semibold rounded-xl w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
                aria-label="Verificar postura"
              >
                <ScanFace className="h-5 w-5 mr-2" />
                Verificar
              </Button>
            </div>
          </Card>

          <Card className="p-5 glass-card hover:shadow-lg transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-7 w-7 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Sessão Diária de Ergonomia</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    5 exercícios rápidos para sua saúde
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setDailySessionOpen(true)}
                variant="secondary"
                className="min-h-12 px-6 text-base font-semibold rounded-xl w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
                aria-label="Iniciar sessão de ergonomia"
              >
                <Activity className="h-5 w-5 mr-2" />
                Iniciar
              </Button>
            </div>
          </Card>
        </div>

        {/* Ergonomic Assessment Card */}
        <Card className="p-5 glass-card overflow-hidden hover:shadow-lg transition-all duration-300 group">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                <ClipboardCheck className="h-7 w-7 text-teal-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Avaliação Ergonômica</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Analise LER, fadiga mental e postura de trabalho
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/ergonomia")}
              className="gradient-primary min-h-12 px-6 text-base font-semibold rounded-xl w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
              aria-label="Iniciar avaliação ergonômica"
            >
              <ClipboardCheck className="h-5 w-5 mr-2" />
              Avaliar
            </Button>
          </div>
        </Card>

        {/* Push Notifications Card */}
        <Card className="p-5 glass-card overflow-hidden hover:shadow-lg transition-all duration-300 group">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 group-hover:scale-110 transition-transform duration-300">
                <Bell className="h-7 w-7 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Push Notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie e envie notificações push
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/push")}
              variant="secondary"
              className="min-h-12 px-6 text-base font-semibold rounded-xl w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
              aria-label="Gerenciar notificações push"
            >
              <Bell className="h-5 w-5 mr-2" />
              Gerenciar
            </Button>
          </div>
        </Card>

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
        <footer className="text-center pt-8 pb-6 space-y-6 animate-fade-in">
          {/* Status de sincronização - destacado */}
          <div className="flex justify-center">
            {/* Status Offline - prioridade máxima */}
            {!isOnline && (
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 text-base font-semibold border-2 border-red-500/30 shadow-sm">
                <WifiOff size={20} className="flex-shrink-0" />
                <span>Sem conexão</span>
              </div>
            )}
            
            {isOnline && (syncStatus === 'synced' || syncStatus === 'checking') && !isRefreshing && (
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-500/15 text-green-600 dark:text-green-400 text-base font-semibold border-2 border-green-500/30 shadow-sm">
                {syncStatus === 'checking' ? (
                  <Loader2 size={20} className="animate-spin flex-shrink-0" />
                ) : (
                  <Check size={20} className="flex-shrink-0" />
                )}
                <div className="flex flex-col">
                  <span>{syncStatus === 'checking' ? 'Verificando...' : 'App atualizado'}</span>
                  {syncStatus === 'synced' && lastSyncTime && (
                    <span className="text-xs font-normal opacity-75">
                      {lastSyncTime.toLocaleDateString('pt-BR')} às {lastSyncTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleCheckUpdates}
                  variant="ghost"
                  size="sm"
                  className="ml-2 min-h-10 min-w-10 h-10 w-10 p-0 rounded-xl text-green-600 dark:text-green-400 hover:bg-green-500/20 touch-manipulation active:scale-95 transition-transform"
                  aria-label="Verificar atualizações"
                  disabled={syncStatus === 'checking'}
                >
                  <RefreshCw size={18} className={syncStatus === 'checking' ? "animate-spin" : ""} />
                </Button>
              </div>
            )}
            
            {isOnline && (syncStatus === 'updating' || isRefreshing) && (
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 text-base font-semibold border-2 border-blue-500/30">
                <Loader2 size={20} className="animate-spin flex-shrink-0" />
                <span>{syncStatus === 'updating' ? 'Atualizando...' : 'Sincronizando...'}</span>
              </div>
            )}
            
            {isOnline && syncStatus === 'error' && !isRefreshing && (
              <Button
                onClick={handleCheckUpdates}
                className="min-h-12 px-6 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border-2 border-orange-500/30 hover:bg-orange-500/25 font-semibold"
                aria-label="Tentar sincronizar novamente"
              >
                <AlertCircle size={20} className="mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>

          {/* Ações principais */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ThemeToggle />
            
            {showInstallButton && (
              <Button
                onClick={() => navigate("/install")}
                className="min-h-12 px-5 rounded-2xl bg-primary/10 text-primary border-2 border-primary/30 hover:bg-primary/20 font-semibold touch-manipulation active:scale-95 transition-transform"
                aria-label="Instalar aplicativo"
              >
                <Download size={20} className="mr-2" />
                Instalar App
              </Button>
            )}
            
            <Button
              onClick={() => setDonationOpen(true)}
              className="min-h-12 px-5 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 border-2 border-pink-500/30 hover:bg-pink-500/20 font-semibold touch-manipulation active:scale-95 transition-transform"
              aria-label="Apoiar o projeto"
            >
              <Heart size={20} className="mr-2" />
              Apoiar
            </Button>
            
            <Button
              onClick={() => setPlansOpen(true)}
              className="min-h-12 px-5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500 border-2 border-amber-500/30 hover:bg-amber-500/20 font-semibold touch-manipulation active:scale-95 transition-transform"
              aria-label="Ver planos disponíveis"
            >
              <Crown size={20} className="mr-2" />
              Planos
            </Button>
            
            <Button
              onClick={resetTour}
              variant="outline"
              className="min-h-12 px-5 rounded-2xl border-2 hover:bg-primary/10 font-semibold touch-manipulation active:scale-95 transition-transform"
              aria-label="Ver tour do aplicativo"
            >
              <Sparkles size={20} className="mr-2" />
              Tour
            </Button>
          </div>
          
          {/* Branding */}
          <div className="pt-4 space-y-4">
            <div className="bg-slate-900 rounded-2xl p-3 mx-auto w-fit shadow-lg hover:scale-105 transition-transform duration-300">
              <img 
                src={logoOfficeWell} 
                alt="OfficeWell - Seu assistente de bem-estar no trabalho" 
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
              Mantenha-se saudável e produtivo 
              <span className="text-2xl animate-pulse">💪</span>
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/15 text-primary text-sm font-bold mx-auto shadow-sm">
              Versão {APP_VERSION}
            </div>
            
            {/* Legal Disclaimer */}
            <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-2 border-amber-500/40 rounded-2xl p-5 max-w-lg mx-auto shadow-sm">
              <p className="text-base text-foreground leading-relaxed flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">⚖️</span>
                <span className="font-semibold">As orientações do OfficeWell têm caráter educativo e não substituem avaliação médica ou fisioterapêutica.</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Onboarding Tour for new demo users */}
      <OnboardingTour />
      
      {/* LGPD Consent Banner */}
      <LGPDConsentBanner />
      
      {/* Virtual Assistant */}
      <VirtualAssistant />
    </div>
  );
};

export default Index;
