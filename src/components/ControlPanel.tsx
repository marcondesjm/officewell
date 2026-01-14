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
            ${isRunning 
              ? 'gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl hover:scale-105' 
              : 'bg-accent hover:bg-accent/90 shadow-lg hover:shadow-xl hover:scale-105'
            }
          `}
        >
          {isRunning ? (
            <>
              <Pause size={22} className="mr-2" />
              Pausar
            </>
          ) : (
            <>
              <Play size={22} className="mr-2" />
              Iniciar
            </>
          )}
        </Button>

        <Button 
          onClick={onReset} 
          variant="outline" 
          size="lg"
          className="min-h-14 px-6 rounded-2xl font-medium border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105 touch-manipulation"
        >
          <RotateCcw size={20} className="mr-2" />
          Reiniciar
        </Button>

        <Button 
          onClick={onNotifications} 
          variant="outline" 
          size="lg"
          className="min-h-14 px-6 rounded-2xl font-medium border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105 touch-manipulation"
        >
          <Bell size={20} className="mr-2" />
          Alertas
        </Button>

        <Button 
          onClick={onSettings} 
          variant="outline" 
          size="lg"
          className="min-h-14 px-6 rounded-2xl font-medium border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105 touch-manipulation"
        >
          <Settings size={20} className="mr-2" />
          Ajustes
        </Button>
      </div>
    </Card>
  );
};
