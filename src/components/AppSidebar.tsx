import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Timer, 
  Target, 
  Activity, 
  Trophy, 
  Settings,
  Crown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Bell,
  Users,
  Droplets
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logoOfficeWell from "@/assets/logo-officewell.png";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { ThemeToggle } from "@/components/ThemeToggle";
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  section?: string;
  badge?: string;
  locked?: boolean;
}

interface AppSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onOpenPlans: () => void;
  onOpenDonation: () => void;
  onOpenSettings: () => void;
}

export const AppSidebar = ({ 
  currentSection, 
  onSectionChange, 
  onOpenPlans,
  onOpenDonation,
  onOpenSettings
}: AppSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { features, getRequiredPlan } = usePlanFeatures();

  const navItems: NavItem[] = [
    { id: "home", label: "Início", icon: Home, section: "home" },
    { id: "timers", label: "Pausas", icon: Timer, section: "timers" },
    { id: "water", label: "Hidratação", icon: Droplets, section: "water" },
    { id: "ergonomia", label: "Ergonomia", icon: Activity, section: "ergonomia" },
    { id: "metas", label: "Metas", icon: Target, section: "metas", locked: !features.customGoals },
    { id: "gamification", label: "Ranking", icon: Trophy, section: "gamification" },
    { id: "hr", label: "RH", icon: Users, section: "hr", locked: !features.hrPanel },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.section) {
      onSectionChange(item.section);
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col",
        "bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-xl",
        "hidden md:flex"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.img
                key="full-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={logoOfficeWell}
                alt="OfficeWell"
                className="h-8 object-contain"
              />
            ) : (
              <motion.div
                key="icon-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Heart className="h-5 w-5 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Theme Toggle */}
          <ThemeToggle collapsed={isCollapsed} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = currentSection === item.section;
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                    "hover:bg-primary/10 active:scale-[0.98]",
                    isActive && "bg-primary/15 text-primary font-semibold shadow-sm",
                    !isActive && "text-muted-foreground hover:text-foreground",
                    item.locked && "opacity-60"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                    isActive ? "bg-primary/20" : "bg-muted/50"
                  )}>
                    <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex items-center gap-2 overflow-hidden"
                      >
                        <span className="whitespace-nowrap">{item.label}</span>
                        {item.locked && (
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border/50 space-y-1">
        <button
          onClick={onOpenSettings}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50 shrink-0">
            <Settings className="h-5 w-5" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                Configurações
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={onOpenPlans}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
            "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
          )}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/20 shrink-0">
            <Crown className="h-5 w-5" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap font-medium"
              >
                Ver Planos
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-20 h-8 w-8 rounded-full bg-card border border-border shadow-md hover:bg-muted"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </motion.aside>
  );
};
