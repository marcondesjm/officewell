import { Play, Pause, RotateCcw, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ControlPanelProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSettings: () => void;
  onNotifications: () => void;
}

export const ControlPanel = ({
  isRunning,
  onToggle,
  onReset,
  onSettings,
  onNotifications,
}: ControlPanelProps) => {
  return (
    <Card className="p-5 md:p-6 glass-strong shadow-card border-0 animate-fade-in">
      <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
        <Button
          onClick={onToggle}
          size="lg"
          className={`
            min-h-14 px-8 rounded-2xl font-semibold text-base
            transition-all duration-300 ease-out touch-manipulation
            inline-flex items-center gap-2
            ${isRunning 
              ? 'gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl hover:scale-105' 
              : 'bg-accent hover:bg-accent/90 shadow-lg hover:shadow-xl hover:scale-105'
            }
          `}
        >
          {isRunning ? (
            <>
              <Pause size={22} />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play size={22} />
              <span>Iniciar</span>
            </>
          )}
        </Button>

        <Button 
          onClick={onReset} 
          variant="outline" 
          size="lg"
          className="min-h-14 px-6 rounded-2xl font-medium border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-105 touch-manipulation inline-flex items-center gap-2"
        >
          <RotateCcw size={20} />
          <span>Reiniciar</span>
        </Button>

        <Button 
          onClick={onNotifications} 
          variant="outline" 
          size="lg"
          className="min-h-14 px-6 rounded-2xl font-medium border-2 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all duration-300 hover:scale-105 touch-manipulation inline-flex items-center gap-2"
        >
          <Bell size={20} />
          <span>Alertas</span>
        </Button>

        <Button 
          onClick={onSettings} 
          variant="outline" 
          size="lg"
          className="min-h-14 px-6 rounded-2xl font-medium border-2 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 hover:scale-105 touch-manipulation inline-flex items-center gap-2"
        >
          <Settings size={20} />
          <span>Ajustes</span>
        </Button>
      </div>
    </Card>
  );
};
