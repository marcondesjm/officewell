import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Download, 
  Smartphone, 
  Check, 
  Share, 
  Plus, 
  Lightbulb, 
  Zap, 
  WifiOff, 
  Bell, 
  HardDrive, 
  Shield,
  Info
} from "lucide-react";
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
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

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

  const resources = [
    { icon: Zap, text: "Acesso rápido pela tela inicial", color: "text-orange-500" },
    { icon: WifiOff, text: "Funciona completamente offline", color: "text-blue-500" },
    { icon: Bell, text: "Notificações push ativadas", color: "text-yellow-500" },
    { icon: HardDrive, text: "Dados salvos localmente", color: "text-green-500" },
    { icon: Zap, text: "Performance otimizada", color: "text-purple-500" },
    { icon: Shield, text: "Seguro e privado", color: "text-red-500" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-lg mx-auto space-y-4 animate-fade-in">
        {/* Header */}
        <div className="space-y-1 pt-4">
          <h1 className="text-2xl font-bold text-foreground">Instalação do App</h1>
          <p className="text-muted-foreground text-sm">
            Instale o OfficeWell como um aplicativo nativo no seu dispositivo.
          </p>
        </div>

        {/* Status Card */}
        <Card className="p-4 border border-border bg-card">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Smartphone size={20} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              {isInstalled ? (
                <>
                  <h3 className="font-semibold text-accent flex items-center gap-2">
                    <Check size={18} />
                    App Instalado
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    O app está instalado e pronto para uso.
                  </p>
                  <Button 
                    onClick={() => navigate("/")} 
                    size="sm"
                    className="mt-3 rounded-xl"
                  >
                    Abrir App
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-orange-500">App Não Instalado</h3>
                  <p className="text-sm text-muted-foreground">
                    Instale para ter acesso rápido, funcionar offline e receber notificações.
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Installation Instructions */}
        {!isInstalled && (
          <Card className="p-4 border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-yellow-500" />
              <h3 className="font-semibold text-foreground">
                {isIOS ? "Como instalar no iPhone/iPad:" : "Como instalar no computador:"}
              </h3>
            </div>
            
            {isIOS ? (
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-medium">1.</span>
                  <span>Toque no botão <strong className="text-foreground">Compartilhar</strong> <Share size={14} className="inline text-primary" /></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-medium">2.</span>
                  <span>Selecione <strong className="text-foreground">"Adicionar à Tela de Início"</strong> <Plus size={14} className="inline text-primary" /></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-medium">3.</span>
                  <span>Clique em "<strong className="text-foreground">Adicionar</strong>" e pronto!</span>
                </li>
              </ol>
            ) : deferredPrompt ? (
              <div className="space-y-3">
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-foreground font-medium">1.</span>
                    <span>Clique no botão <strong className="text-foreground">"Instalar Agora"</strong> abaixo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground font-medium">2.</span>
                    <span>Confirme a instalação no popup do navegador</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground font-medium">3.</span>
                    <span>Pronto! O app estará na sua área de trabalho</span>
                  </li>
                </ol>
                <Button 
                  onClick={handleInstall}
                  className="w-full rounded-xl mt-2"
                >
                  <Download size={18} className="mr-2" />
                  Instalar Agora
                </Button>
              </div>
            ) : (
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-medium">1.</span>
                  <span>Procure o <strong className="text-foreground">ícone de instalação</strong> na barra de endereço (⊕ ou ↓)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-medium">2.</span>
                  <span>Ou no menu (⋮) → "<strong className="text-foreground">Instalar OfficeWell</strong>"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-medium">3.</span>
                  <span>Clique em "<strong className="text-foreground">Instalar</strong>" e pronto!</span>
                </li>
              </ol>
            )}
          </Card>
        )}

        {/* Resources */}
        <Card className="p-4 border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Recursos do App</h3>
          </div>
          
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <resource.icon size={18} className={resource.color} />
                <span className="text-muted-foreground">{resource.text}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Back Button */}
        <Button 
          onClick={() => navigate("/")} 
          variant="outline"
          className="w-full rounded-xl"
        >
          Voltar ao App
        </Button>
      </div>
    </div>
  );
};

export default Install;
