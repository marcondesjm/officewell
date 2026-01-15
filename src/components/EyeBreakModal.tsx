import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import eyeBreakImage from "@/assets/eye-break.png";

interface EyeBreakModalProps {
  open: boolean;
  onClose: () => void;
}

export const EyeBreakModal = ({ open, onClose }: EyeBreakModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md glass-strong border-primary/30">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center justify-center gap-2">
            👁️ Descanso Visual
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Olhe para longe por 20 segundos. Seus olhos agradecem!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img 
              src={eyeBreakImage} 
              alt="Pessoa olhando pela janela para descansar os olhos"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
          
          <div className="bg-primary/10 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-primary text-sm">Regra 20-20-20:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• A cada 20 minutos de tela</li>
              <li>• Olhe para algo a 20 metros de distância</li>
              <li>• Por pelo menos 20 segundos</li>
              <li>• Pisque várias vezes para lubrificar</li>
            </ul>
          </div>
          
          <Button 
            onClick={onClose} 
            className="w-full gradient-primary text-white font-semibold"
          >
            Concluído! ✓
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
