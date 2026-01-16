import { X, ExternalLink, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const DoorVIIBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleClick = () => {
    window.open("https://doorvii.lovable.app", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-purple-600/20 border border-indigo-500/30 p-4 animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-xl" />
      
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors z-10"
        aria-label="Fechar"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="flex items-center justify-between gap-4 pr-6 relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                DoorVII
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-medium">
                <Sparkles className="h-3 w-3" />
                Novo
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Gestão inteligente de condomínios e portarias digitais
            </p>
          </div>
        </div>
        <Button 
          onClick={handleClick} 
          size="sm" 
          className="gap-1.5 shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-violet-500/25"
        >
          Conhecer
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
