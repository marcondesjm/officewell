import { X, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface AdBannerProps {
  onUpgrade: () => void;
  variant?: "inline" | "sidebar" | "banner";
}

const adContent = [
  {
    title: "Remova os anúncios",
    description: "Assine o plano Pro e tenha uma experiência sem interrupções",
    cta: "Ver Planos",
    icon: Sparkles,
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
  },
  {
    title: "Relatórios Detalhados",
    description: "Acompanhe sua evolução com gráficos e métricas avançadas",
    cta: "Desbloquear",
    icon: Crown,
    gradient: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
  },
  {
    title: "Metas Personalizadas",
    description: "Defina suas próprias metas de saúde e produtividade",
    cta: "Testar Grátis",
    icon: Sparkles,
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
  },
  {
    title: "7 dias grátis!",
    description: "Experimente todos os recursos premium sem compromisso",
    cta: "Começar Trial",
    icon: Crown,
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
  },
];

export const AdBanner = ({ onUpgrade, variant = "inline" }: AdBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [currentAd, setCurrentAd] = useState(0);

  // Rotate ads every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % adContent.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  const ad = adContent[currentAd];
  const Icon = ad.icon;

  if (variant === "banner") {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${ad.gradient} border ${ad.border} p-4 animate-fade-in`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
        
        <div className="flex items-center justify-between gap-4 pr-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{ad.title}</p>
              <p className="text-sm text-muted-foreground">{ad.description}</p>
            </div>
          </div>
          <Button onClick={onUpgrade} size="sm" className="gap-1.5 shrink-0">
            {ad.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${ad.gradient} border ${ad.border} p-4 animate-fade-in`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
        
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{ad.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{ad.description}</p>
          </div>
          <Button onClick={onUpgrade} size="sm" className="w-full gap-1.5 mt-2">
            <Crown className="h-4 w-4" />
            {ad.cta}
          </Button>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${ad.gradient} border ${ad.border} p-3 animate-fade-in`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{ad.title}</p>
            <p className="text-xs text-muted-foreground truncate">{ad.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button onClick={onUpgrade} size="sm" variant="ghost" className="h-8 px-2 text-xs">
            {ad.cta}
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-black/10 transition-colors"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};
