import { Sparkles, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DemoBannerProps {
  onUpgrade: () => void;
}

export const DemoBanner = ({ onUpgrade }: DemoBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 border-2 border-violet-500/40 p-4 animate-fade-in shadow-lg">
      {/* Background sparkles */}
      <div className="absolute top-1 right-8 text-violet-400/30 animate-pulse">
        <Sparkles className="h-8 w-8" />
      </div>
      <div className="absolute bottom-1 left-12 text-fuchsia-400/20 animate-pulse delay-300">
        <Sparkles className="h-6 w-6" />
      </div>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                🎮 Conta Demo Ativa
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Você está explorando todas as funcionalidades gratuitamente!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={onUpgrade} 
            size="sm" 
            className="gap-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg"
          >
            <Crown className="h-4 w-4" />
            Ver Planos
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
