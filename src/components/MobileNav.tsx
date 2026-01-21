import { Home, Timer, Droplets, Activity, Trophy, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { Crown } from "lucide-react";

interface MobileNavProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "home", label: "Início", icon: Home, section: "home" },
  { id: "timers", label: "Pausas", icon: Timer, section: "timers" },
  { id: "water", label: "Água", icon: Droplets, section: "water" },
  { id: "ergonomia", label: "Ergonomia", icon: Activity, section: "ergonomia" },
  { id: "gamification", label: "Ranking", icon: Trophy, section: "gamification" },
];

export const MobileNav = ({ currentSection, onSectionChange }: MobileNavProps) => {
  const { features } = usePlanFeatures();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
          {navItems.map((item) => {
            const isActive = currentSection === item.section;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.section)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl min-w-[60px] transition-all duration-200",
                  "active:scale-95 touch-manipulation",
                  isActive && "bg-primary/15"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                  isActive ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
