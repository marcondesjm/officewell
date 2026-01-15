import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import waterBreakImage from "@/assets/water-break.png";

interface WaterBreakModalProps {
  open: boolean;
  onClose: () => void;
}

export const WaterBreakModal = ({ open, onClose }: WaterBreakModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md glass-strong border-accent/30">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center justify-center gap-2">
            💧 Hora de Hidratar!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Beba um copo de água agora. Mantenha-se saudável!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img 
              src={waterBreakImage} 
              alt="Pessoa bebendo água no escritório"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
          
          <div className="bg-accent/10 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-accent text-sm">Benefícios da hidratação:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Melhora a concentração e foco</li>
              <li>• Ajuda a manter a pele saudável</li>
              <li>• Regula a temperatura corporal</li>
              <li>• Elimina toxinas do corpo</li>
            </ul>
          </div>
          
          <Button 
            onClick={onClose} 
            className="w-full gradient-secondary text-white font-semibold"
          >
            Concluído! ✓
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
