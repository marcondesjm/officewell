import { useState, useEffect } from "react";
import { Download, Heart, Crown, RefreshCw, Sparkles } from "lucide-react";
import { Check, AlertCircle, Loader2, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Layout Components
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import ParallaxBackground from "@/components/ParallaxBackground";
import logoOfficeWell from "@/assets/logo-officewell.png";

// Section Components
import { HomeSection } from "@/components/sections/HomeSection";
import { TimersSection } from "@/components/sections/TimersSection";
import { WaterSection } from "@/components/sections/WaterSection";
import { ErgonomiaSection } from "@/components/sections/ErgonomiaSection";
import { GamificationSection } from "@/components/sections/GamificationSection";
import { MetasSection } from "@/components/sections/MetasSection";
import { HRSection } from "@/components/sections/HRSection";

// Modal Components
import { SettingsDialog } from "@/components/SettingsDialog";
import { DonationDialog } from "@/components/DonationDialog";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { StretchBreakModal } from "@/components/StretchBreakModal";
import { EyeBreakModal } from "@/components/EyeBreakModal";
import { WaterBreakModal } from "@/components/WaterBreakModal";
import { PostureCheckModal } from "@/components/PostureCheckModal";
import { DailyErgonomicsSession } from "@/components/DailyErgonomicsSession";
import { WorkScheduleSetup } from "@/components/WorkScheduleSetup";
import { PlanDemoModal } from "@/components/PlanDemoModal";
import { PlansHighlight } from "@/components/PlansHighlight";
import { EnterpriseRenewCard } from "@/components/EnterpriseRenewCard";
import { PartnersBanner } from "@/components/PartnersBanner";
import { AdBanner } from "@/components/AdBanner";
import { HealthTips } from "@/components/HealthTips";
import { DemoBanner } from "@/components/DemoBanner";

// UI Components
import { Button } from "@/components/ui/button";

// Overlays
import { OnboardingTour, useTour } from "@/components/OnboardingTour";
import { LGPDConsentBanner } from "@/components/LGPDConsentBanner";
import { VirtualAssistant } from "@/components/VirtualAssistant";

// Hooks
import { useReminders } from "@/hooks/useReminders";
import { useAppRefresh, APP_VERSION } from "@/hooks/useAppRefresh";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useGamification } from "@/hooks/useGamification";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";

const Index = () => {
  const {
    config,
    state,
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
  } = useReminders();

  // Section navigation with scroll to top
  const [currentSection, setCurrentSection] = useState("home");
  
  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    // Scroll to top when changing sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modal states
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const navigate = useNavigate();
  const { features } = usePlanFeatures();
  const { inactivityInfo, dismissInactivityWarning } = useGamification();
  const { resetTour } = useTour();
  const { checkForUpdates, syncStatus, lastSyncTime } = useAppRefresh(60 * 60 * 1000);
  const isOnline = useOnlineStatus();

  // Auto-activate demo mode on first visit or PWA access
  useEffect(() => {
    const hasVisited = localStorage.getItem('officewell_has_visited');
    const isDemo = sessionStorage.getItem('officewell_demo_active') === 'true';
    const isStandalonePWA = window.matchMedia("(display-mode: standalone)").matches;
    
    // PWA standalone always gets demo mode activated
    // First visit also gets demo mode
    const shouldActivateDemo = !hasVisited || (isStandalonePWA && !isDemo);
    
    if (shouldActivateDemo) {
      // First visit or PWA standalone - activate demo mode
      localStorage.setItem('officewell_has_visited', 'true');
      sessionStorage.setItem('officewell_demo_active', 'true');
      setIsDemoMode(true);
      
      // Only reset metrics on first visit (not on every PWA session)
      if (!hasVisited) {
        localStorage.removeItem('officewell_tour_completed');
        localStorage.removeItem('officewell_water_count');
        localStorage.removeItem('officewell_stretch_count');
        localStorage.removeItem('officewell_eye_count');
        localStorage.removeItem('officewell_points');
        localStorage.removeItem('officewell_daily_goal');
        localStorage.removeItem('officewell_mood_today');
        localStorage.removeItem('officewell_last_report_date');
        sessionStorage.setItem('officewell_new_demo', 'true');
        
        import("sonner").then(({ toast }) => {
          toast.success('🎉 Bem-vindo! Você está usando a Conta Demo com todas as funcionalidades liberadas.', {
            duration: 6000,
          });
        });
      }
    } else if (isDemo) {
      setIsDemoMode(true);
    }
  }, []);

  // Show work schedule setup on first load
  useEffect(() => {
    const isTourActive = sessionStorage.getItem('officewell_new_demo') === 'true' && 
                         localStorage.getItem('officewell_tour_completed') !== 'true';
    if (needsWorkScheduleConfig && !isTourActive) {
      setWorkScheduleOpen(true);
    }
  }, [needsWorkScheduleConfig]);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setShowInstallButton(!isStandalone);
  }, []);

  // Check for updates on load
  useEffect(() => {
    const justUpdated = localStorage.getItem('app-just-updated');
    if (justUpdated === 'true') {
      localStorage.removeItem('app-just-updated');
      import("sonner").then(({ toast }) => {
        toast.success("✨ App atualizado com sucesso!", {
          description: `Versão ${APP_VERSION} - Todos os recursos estão atualizados.`,
          duration: 4000,
        });
      });
    }
  }, []);

  const handleCheckUpdates = async () => {
    setIsRefreshing(true);
    try {
      const { toast } = await import("sonner");
      toast.loading("🔍 Verificando atualizações...", { id: 'update-check' });
      const hasUpdates = await checkForUpdates();
      if (!hasUpdates) {
        toast.success("✅ App sincronizado!", {
          id: 'update-check',
          description: `Versão ${APP_VERSION} • Tudo atualizado`,
          duration: 3000,
        });
      }
    } catch (e) {
      console.error('Erro ao verificar atualizações:', e);
      const { toast } = await import("sonner");
      toast.error("❌ Erro ao verificar", { id: 'update-check', duration: 3000 });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Render current section
  const renderSection = () => {
    switch (currentSection) {
      case "home":
        return (
          <HomeSection
            workSchedule={workSchedule}
            getWorkStatus={getWorkStatus}
            getRemainingWorkMinutes={getRemainingWorkMinutes}
            onWorkScheduleOpen={() => setWorkScheduleOpen(true)}
            onUpgrade={() => setPlansOpen(true)}
            requestNotificationPermission={requestNotificationPermission}
            inactivityInfo={inactivityInfo}
            dismissInactivityWarning={dismissInactivityWarning}
            isRunning={state.isRunning}
          />
        );
      case "timers":
        return (
          <TimersSection
            config={config}
            state={state}
            toggleRunning={toggleRunning}
            resetTimers={resetTimers}
            onSettings={() => setSettingsOpen(true)}
            requestNotificationPermission={requestNotificationPermission}
          />
        );
      case "water":
        return <WaterSection />;
      case "ergonomia":
        return (
          <ErgonomiaSection
            onPostureCheck={() => setPostureCheckOpen(true)}
            onDailySession={() => setDailySessionOpen(true)}
          />
        );
      case "gamification":
        return <GamificationSection />;
      case "metas":
        return <MetasSection onUpgrade={() => setPlansOpen(true)} />;
      case "hr":
        return <HRSection onUpgrade={() => setPlansOpen(true)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ParallaxBackground />

      {/* Desktop Sidebar */}
      <AppSidebar
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        onOpenPlans={() => setPlansOpen(true)}
        onOpenDonation={() => setDonationOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="md:ml-60 min-h-screen pb-24 md:pb-8 relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <img src={logoOfficeWell} alt="OfficeWell" className="h-7 object-contain" />
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
          {/* Demo Banner */}
          {isDemoMode && (
            <DemoBanner onUpgrade={() => setPlansOpen(true)} />
          )}
          
          {renderSection()}

          {/* Plans/Renew Section - Show on home */}
          {currentSection === "home" && (
            <>
              {/* Ads for non-enterprise users */}
              {!features.noAds && (
                <>
                  <PartnersBanner />
                  <AdBanner onUpgrade={() => setPlansOpen(true)} variant="banner" />
                </>
              )}
              
              {/* Enterprise users see renew card, others see plans */}
              {features.hrPanel ? (
                <EnterpriseRenewCard onRenew={() => setPlansOpen(true)} />
              ) : (
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
              )}

              {!features.noAds && (
                <AdBanner onUpgrade={() => setPlansOpen(true)} variant="inline" />
              )}

              <HealthTips />
            </>
          )}

          {/* Footer */}
          <footer className="text-center pt-8 pb-6 space-y-6">
            {/* Sync Status */}
            <div className="flex justify-center">
              {!isOnline && (
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 text-base font-semibold border-2 border-red-500/30 shadow-sm">
                  <WifiOff size={20} />
                  <span>Sem conexão</span>
                </div>
              )}
              
              {isOnline && (syncStatus === 'synced' || syncStatus === 'checking') && !isRefreshing && (
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-500/15 text-green-600 dark:text-green-400 text-base font-semibold border-2 border-green-500/30 shadow-sm">
                  {syncStatus === 'checking' ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Check size={20} />
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
                    className="ml-2 min-h-10 min-w-10 h-10 w-10 p-0 rounded-xl text-green-600 dark:text-green-400 hover:bg-green-500/20"
                    disabled={syncStatus === 'checking'}
                  >
                    <RefreshCw size={18} className={syncStatus === 'checking' ? "animate-spin" : ""} />
                  </Button>
                </div>
              )}

              {isOnline && (syncStatus === 'updating' || isRefreshing) && (
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 text-base font-semibold border-2 border-blue-500/30">
                  <Loader2 size={20} className="animate-spin" />
                  <span>{syncStatus === 'updating' ? 'Atualizando...' : 'Sincronizando...'}</span>
                </div>
              )}

              {isOnline && syncStatus === 'error' && !isRefreshing && (
                <Button onClick={handleCheckUpdates} className="min-h-12 px-6 rounded-2xl bg-orange-500/15 text-orange-600 border-2 border-orange-500/30">
                  <AlertCircle size={20} className="mr-2" />
                  Tentar novamente
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ThemeToggle />
              
              {showInstallButton && (
                <Button onClick={() => navigate("/install")} className="min-h-12 px-5 rounded-2xl bg-primary/10 text-primary border-2 border-primary/30 hover:bg-primary/20 font-semibold">
                  <Download size={20} className="mr-2" />
                  Instalar App
                </Button>
              )}
              
              <Button onClick={() => setDonationOpen(true)} className="min-h-12 px-5 rounded-2xl bg-pink-500/10 text-pink-600 border-2 border-pink-500/30 hover:bg-pink-500/20 font-semibold">
                <Heart size={20} className="mr-2" />
                Apoiar
              </Button>
              
              <Button onClick={() => setPlansOpen(true)} className="min-h-12 px-5 rounded-2xl bg-amber-500/10 text-amber-600 border-2 border-amber-500/30 hover:bg-amber-500/20 font-semibold">
                <Crown size={20} className="mr-2" />
                Planos
              </Button>
              
              <Button onClick={resetTour} variant="outline" className="min-h-12 px-5 rounded-2xl border-2 hover:bg-primary/10 font-semibold">
                <Sparkles size={20} className="mr-2" />
                Tour
              </Button>
            </div>

            {/* Branding */}
            <div className="pt-4 space-y-4">
              <div className="bg-slate-900 rounded-2xl p-3 mx-auto w-fit shadow-lg hover:scale-105 transition-transform duration-300">
                <img src={logoOfficeWell} alt="OfficeWell" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
                Mantenha-se saudável e produtivo 
                <span className="text-2xl animate-pulse">💪</span>
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/15 text-primary text-sm font-bold mx-auto shadow-sm">
                Versão {APP_VERSION}
              </div>
              
              <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-2 border-amber-500/40 rounded-2xl p-5 max-w-lg mx-auto shadow-sm">
                <p className="text-base text-foreground leading-relaxed flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">⚖️</span>
                  <span className="font-semibold">As orientações do OfficeWell têm caráter educativo e não substituem avaliação médica ou fisioterapêutica.</span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav currentSection={currentSection} onSectionChange={handleSectionChange} />

      {/* Modals */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} config={config} onSave={updateConfig} />
      <DonationDialog open={donationOpen} onOpenChange={setDonationOpen} />
      <SubscriptionPlans
        open={plansOpen}
        onOpenChange={(open) => {
          setPlansOpen(open);
          if (!open) setSelectedPlanId(null);
        }}
        preSelectedPlan={selectedPlanId}
      />
      <PlanDemoModal
        open={demoOpen}
        onOpenChange={setDemoOpen}
        planId={demoPlanId}
        onSelectPlan={(planId) => {
          setSelectedPlanId(planId);
          setPlansOpen(true);
        }}
      />
      <StretchBreakModal open={state.showStretchModal} onClose={closeStretchModal} />
      <EyeBreakModal open={state.showEyeModal} onClose={closeEyeModal} />
      <WaterBreakModal open={state.showWaterModal} onClose={closeWaterModal} />
      <PostureCheckModal open={postureCheckOpen} onOpenChange={setPostureCheckOpen} />
      <DailyErgonomicsSession open={dailySessionOpen} onOpenChange={setDailySessionOpen} />
      <WorkScheduleSetup
        open={workScheduleOpen}
        onOpenChange={setWorkScheduleOpen}
        onSave={(newSchedule) => {
          updateWorkSchedule(newSchedule);
          setWorkScheduleOpen(false);
        }}
        currentSchedule={workSchedule}
      />

      {/* Overlays */}
      <OnboardingTour />
      <LGPDConsentBanner />
      <VirtualAssistant />
    </div>
  );
};

export default Index;
