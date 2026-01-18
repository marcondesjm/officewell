import { Play, Pause, RotateCcw, Settings, Bell, BellRing, BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const [isTesting, setIsTesting] = useState(false);

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

  const testNotification = async () => {
    setIsTesting(true);
    
    try {
      // Primeiro verificar/solicitar permissão
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            toast.error("❌ Permissão de notificação negada");
            setIsTesting(false);
            return;
          }
        }
        
        if (Notification.permission === "denied") {
          toast.error("⚠️ Notificações bloqueadas. Ative nas configurações do navegador.");
          setIsTesting(false);
          return;
        }

        // Tocar som de teste
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioContext = new AudioContextClass();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = "sine";

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          }
        } catch {}

        // Vibrar no mobile
        try {
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        } catch {}

        // Mostrar toast
        toast.success("🔔 Teste de Notificação", {
          description: "Esta é uma notificação de teste. Se você vir isso, está funcionando!",
          duration: 5000,
        });

        // Enviar notificação do navegador
        const notif = new Notification("🔔 Teste de Notificação - OfficeWell", {
          body: "✅ As notificações estão funcionando corretamente! Você receberá alertas mesmo com o app minimizado.",
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: "officewell-test",
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        setTimeout(() => notif.close(), 10000);
        
        toast.success("✅ Notificação enviada com sucesso!");
      } else {
        toast.error("Notificações não suportadas neste navegador");
      }
    } catch (e) {
      toast.error("Erro ao enviar notificação de teste");
      console.error(e);
    }
    
    setIsTesting(false);
  };

  const getNotificationIcon = () => {
    switch (notificationStatus) {
      case 'granted':
        return <BellRing size={20} className="text-success" />;
      case 'denied':
        return <BellOff size={20} className="text-destructive" />;
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
        return 'border-success/50 bg-success-light hover:bg-success/20 text-success dark:text-success';
      case 'denied':
        return 'border-destructive/50 bg-destructive-light hover:bg-destructive/20 text-destructive dark:text-destructive';
      default:
        return 'hover:bg-secondary-light hover:text-secondary hover:border-secondary';
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
            inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105
            ${isRunning 
              ? 'gradient-primary text-primary-foreground' 
              : 'gradient-secondary text-secondary-foreground'
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
          onClick={testNotification}
          disabled={isTesting}
          variant="outline" 
          size="lg"
          className="min-h-14 px-6 rounded-2xl font-medium border-2 border-info/50 bg-info-light hover:bg-info/20 text-info transition-all duration-300 hover:scale-105 touch-manipulation inline-flex items-center gap-2"
        >
          <Send size={20} className={isTesting ? "animate-pulse" : ""} />
          <span>{isTesting ? "Enviando..." : "Testar"}</span>
        </Button>
        <Button 
          onClick={onSettings} 
          variant="outline" 
          size="lg"
          className="min-h-14 px-6 rounded-2xl font-medium border-2 hover:bg-accent-light hover:text-accent hover:border-accent transition-all duration-300 hover:scale-105 touch-manipulation inline-flex items-center gap-2"
        >
          <Settings size={20} />
          <span>Ajustes</span>
        </Button>
      </div>
    </Card>
  );
};
