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
    <Card className="p-4 md:p-6 bg-card shadow-soft border-2 border-border">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button
          onClick={onToggle}
          size="lg"
          className="gradient-primary hover:opacity-90 transition-smooth min-h-12 px-6 touch-manipulation"
        >
          {isRunning ? (
            <>
              <Pause size={20} className="mr-2" />
              Pausar
            </>
          ) : (
            <>
              <Play size={20} className="mr-2" />
              Iniciar
            </>
          )}
        </Button>

        <Button 
          onClick={onReset} 
          variant="outline" 
          size="lg"
          className="min-h-12 px-6 touch-manipulation"
        >
          <RotateCcw size={20} className="mr-2" />
          Reiniciar
        </Button>

        <Button 
          onClick={onNotifications} 
          variant="outline" 
          size="lg"
          className="min-h-12 px-6 touch-manipulation"
        >
          <Bell size={20} className="mr-2" />
          Notificações
        </Button>

        <Button 
          onClick={onSettings} 
          variant="outline" 
          size="lg"
          className="min-h-12 px-6 touch-manipulation"
        >
          <Settings size={20} className="mr-2" />
          Configurar
        </Button>
      </div>
    </Card>
  );
};
