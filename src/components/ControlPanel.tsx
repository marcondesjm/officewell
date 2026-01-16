import { Play, Pause, RotateCcw, Settings, Bell, BellRing, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

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
  const [notificationStatus, setNotificationStatus] = useState<'granted' | 'denied' | 'default'>('default');

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationStatus(Notification.permission as 'granted' | 'denied' | 'default');
      
      // Atualizar status periodicamente
      const checkStatus = setInterval(() => {
        setNotificationStatus(Notification.permission as 'granted' | 'denied' | 'default');
      }, 1000);
      
      return () => clearInterval(checkStatus);
    }
  }, []);

  const getNotificationIcon = () => {
    switch (notificationStatus) {
      case 'granted':
        return <BellRing size={20} className="text-green-500" />;
      case 'denied':
        return <BellOff size={20} className="text-red-500" />;
      default:
        return <Bell size={20} />;
    }
  };

  const getNotificationLabel = () => {
    switch (notificationStatus) {
      case 'granted':
        return 'Alertas Ativos';
      case 'denied':
        return 'Alertas Bloqueados';
      default:
        return 'Ativar Alertas';
    }
  };

  const getNotificationButtonClass = () => {
    switch (notificationStatus) {
      case 'granted':
        return 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400';
      case 'denied':
        return 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400';
      default:
        return 'hover:bg-secondary hover:text-secondary-foreground hover:border-secondary';
    }
  };
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
          className={`min-h-14 px-6 rounded-2xl font-medium border-2 transition-all duration-300 hover:scale-105 touch-manipulation inline-flex items-center gap-2 ${getNotificationButtonClass()}`}
        >
          {getNotificationIcon()}
          <span>{getNotificationLabel()}</span>
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
