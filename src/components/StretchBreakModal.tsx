import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import stretchingImage from "@/assets/stretching-break.png";

interface StretchBreakModalProps {
  open: boolean;
  onClose: () => void;
}

export const StretchBreakModal = ({ open, onClose }: StretchBreakModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md glass-strong border-secondary/30">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center justify-center gap-2">
            🤸 Hora de Alongar!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Levante-se e movimente seu corpo. Você merece essa pausa!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img 
              src={stretchingImage} 
              alt="Pessoa fazendo alongamento no escritório"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
          
          <div className="bg-secondary/10 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-secondary text-sm">Sugestões de alongamento:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Gire os ombros para trás e para frente</li>
              <li>• Alongue o pescoço inclinando a cabeça</li>
              <li>• Levante os braços acima da cabeça</li>
              <li>• Faça rotação dos punhos</li>
            </ul>
          </div>
          
          <Button 
            onClick={onClose} 
            className="w-full gradient-accent text-white font-semibold"
          >
            Concluído! ✓
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
