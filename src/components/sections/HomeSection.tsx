import { MoodTracker } from "@/components/MoodTracker";
import { TipOfTheDay } from "@/components/TipOfTheDay";
import { UserHeaderCard } from "@/components/UserHeaderCard";
import { HRAnnouncementHeader } from "@/components/HRAnnouncementHeader";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { BackgroundPushBanner } from "@/components/BackgroundPushBanner";
import { TrialBanner } from "@/components/TrialBanner";
import { InactivityWarning } from "@/components/InactivityWarning";
import { Briefcase, Coffee, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeSectionProps {
  workSchedule: {
    isConfigured: boolean;
    startTime: string;
    endTime: string;
  };
  getWorkStatus: () => string;
  getRemainingWorkMinutes: () => number;
  onWorkScheduleOpen: () => void;
  onUpgrade: () => void;
  requestNotificationPermission: () => void;
  inactivityInfo: any;
  dismissInactivityWarning: () => void;
  isRunning: boolean;
}

export const HomeSection = ({
  workSchedule,
  getWorkStatus,
  getRemainingWorkMinutes,
  onWorkScheduleOpen,
  onUpgrade,
  requestNotificationPermission,
  inactivityInfo,
  dismissInactivityWarning,
  isRunning,
}: HomeSectionProps) => {
  return (
    <section className="space-y-6 animate-fade-in">
      {/* User Card */}
      <UserHeaderCard />
      
      {/* HR Announcements */}
      <HRAnnouncementHeader />
      
      {/* Work Status */}
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
            onClick={onWorkScheduleOpen}
            className="min-h-11 px-4 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium flex items-center gap-2 touch-manipulation active:scale-95 transition-all"
          >
            ⚙️ {workSchedule.startTime} - {workSchedule.endTime}
            <span className="text-primary font-semibold">(alterar)</span>
          </Button>
        </div>
      )}

      {!isRunning && getWorkStatus() === 'working' && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium animate-pulse-soft mx-auto">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          Lembretes pausados
        </div>
      )}

      {/* Inactivity Warning */}
      {inactivityInfo && (
        <InactivityWarning info={inactivityInfo} onDismiss={dismissInactivityWarning} />
      )}

      {/* Notification Banners */}
      <NotificationPermissionBanner onRequestPermission={requestNotificationPermission} />
      <BackgroundPushBanner />
      
      {/* Trial Banner */}
      <TrialBanner onUpgrade={onUpgrade} />

      {/* Mood & Tip */}
      <div className="grid md:grid-cols-2 gap-6">
        <MoodTracker />
        <TipOfTheDay />
      </div>
    </section>
  );
};
