import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Verificar se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Capturar evento de instalação
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-decoration flex items-center justify-center">
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <Card className="p-8 glass-strong shadow-card border-0 text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shadow-lg animate-float">
            <Smartphone size={48} className="text-white" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gradient">Instalar OfficeWell</h1>
            <p className="text-muted-foreground">
              Tenha acesso rápido aos seus lembretes de bem-estar
            </p>
          </div>

          {isInstalled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-accent">
                <Check size={24} />
                <span className="font-semibold">App instalado!</span>
              </div>
              <Button 
                onClick={() => navigate("/")} 
                size="lg"
                className="w-full h-14 rounded-2xl gradient-primary font-semibold"
              >
                Abrir App
              </Button>
            </div>
          ) : isIOS ? (
            <div className="space-y-4 text-left">
              <p className="text-sm text-muted-foreground text-center">
                Para instalar no iPhone/iPad:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Share size={20} className="text-primary" />
                  </div>
                  <span className="text-sm">Toque no botão <strong>Compartilhar</strong></span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Plus size={20} className="text-primary" />
                  </div>
                  <span className="text-sm">Selecione <strong>"Adicionar à Tela de Início"</strong></span>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/")} 
                variant="outline"
                size="lg"
                className="w-full h-14 rounded-2xl font-semibold"
              >
                Continuar no navegador
              </Button>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-4">
              <Button 
                onClick={handleInstall}
                size="lg"
                className="w-full h-14 rounded-2xl gradient-primary font-semibold text-lg hover:scale-[1.02] transition-transform"
              >
                <Download size={22} className="mr-2" />
                Instalar Agora
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                variant="ghost"
                className="w-full"
              >
                Continuar no navegador
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Acesse pelo navegador do celular para instalar o app
              </p>
              <Button 
                onClick={() => navigate("/")} 
                size="lg"
                className="w-full h-14 rounded-2xl gradient-primary font-semibold"
              >
                Ir para o App
              </Button>
            </div>
          )}

          {/* Benefits */}
          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Vantagens do app instalado
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check size={16} className="text-accent" />
                <span>Acesso rápido</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check size={16} className="text-accent" />
                <span>Funciona offline</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check size={16} className="text-accent" />
                <span>Notificações</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check size={16} className="text-accent" />
                <span>Tela cheia</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Install;
