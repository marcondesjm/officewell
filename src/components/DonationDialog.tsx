import { useState } from "react";
import { Heart, Copy, Check, Info, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DonationDialog = ({ open, onOpenChange }: DonationDialogProps) => {
  const [copied, setCopied] = useState(false);
  const pixKey = "48996029392";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success("Chave PIX copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-strong border-0 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Info className="text-primary" size={22} />
            Sobre o Criador
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Creator Info */}
          <div className="p-5 rounded-2xl bg-card border-2 border-border space-y-3">
            <h3 className="font-bold text-lg">Marcondes Jorge Machado</h3>
            <p className="text-sm text-muted-foreground">
              Tecnólogo em Análise e Desenvolvimento de Sistemas desde 2017
            </p>
            <a 
              href="https://doorviihome.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm font-medium inline-block"
            >
              CEO da DoorVii Home
            </a>
            <a 
              href="https://instagram.com/doorviiHome" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram size={18} />
              @doorviiHome
            </a>
          </div>

          {/* PIX Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="currentColor">
                  <path d="M13.152 6.045l4.803 4.803a2.04 2.04 0 010 2.886l-4.803 4.803a2.04 2.04 0 01-2.886 0l-4.803-4.803a2.04 2.04 0 010-2.886l4.803-4.803a2.04 2.04 0 012.886 0zm-2.068.818l-4.803 4.803a.68.68 0 000 .962l4.803 4.803a.68.68 0 00.962 0l4.803-4.803a.68.68 0 000-.962l-4.803-4.803a.68.68 0 00-.962 0z"/>
                </svg>
              </div>
              <span className="font-semibold">Apoie o Projeto</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Faça uma doação via PIX para ajudar no desenvolvimento:
            </p>

            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 bg-background rounded-xl border-2 border-border font-mono text-sm">
                {pixKey}
              </div>
              <Button
                onClick={handleCopy}
                className={`px-6 rounded-xl font-semibold transition-all ${
                  copied 
                    ? 'bg-accent hover:bg-accent' 
                    : 'gradient-primary hover:opacity-90'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={18} className="mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy size={18} className="mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full h-12 rounded-2xl border-2 font-medium"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
