import { useState } from "react";
import { Heart, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DonationDialog = ({ open, onOpenChange }: DonationDialogProps) => {
  const [copied, setCopied] = useState(false);
  const pixKey = "48996029392"; // Chave PIX

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
      <DialogContent className="sm:max-w-md glass-strong border-0 rounded-3xl">
        <DialogHeader className="text-left space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="text-pink-500" fill="currentColor" size={24} />
            Apoie o Projeto
          </DialogTitle>
          <DialogDescription className="text-base">
            Ajude-nos a continuar desenvolvendo o OfficeWell com sua contribuição.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* PIX Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="currentColor">
                  <path d="M13.152 6.045l4.803 4.803a2.04 2.04 0 010 2.886l-4.803 4.803a2.04 2.04 0 01-2.886 0l-4.803-4.803a2.04 2.04 0 010-2.886l4.803-4.803a2.04 2.04 0 012.886 0zm-2.068.818l-4.803 4.803a.68.68 0 000 .962l4.803 4.803a.68.68 0 00.962 0l4.803-4.803a.68.68 0 000-.962l-4.803-4.803a.68.68 0 00-.962 0z"/>
                </svg>
              </div>
              <span className="font-semibold">Doação via PIX</span>
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

          <p className="text-center text-sm text-muted-foreground">
            Qualquer valor é bem-vindo e nos ajuda a melhorar o app! 💚
          </p>

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
