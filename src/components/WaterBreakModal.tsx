import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import waterBreakImage from "@/assets/water-break.png";

interface WaterBreakModalProps {
  open: boolean;
  onClose: () => void;
}

const descriptions = [
  "Beba um copo de água agora. Mantenha-se saudável!",
  "Hora de hidratar! Seu corpo agradece.",
  "Pause e beba água. Hidratação é essencial!",
  "Momento perfeito para um gole de água fresca!",
  "Cuide do seu corpo. Beba água agora!",
  "Recarregue suas energias com um copo de água!",
  "Lembre-se: água é vida. Hidrate-se!",
];

const tipSets = [
  {
    title: "Benefícios da hidratação:",
    tips: [
      "Melhora a concentração e foco",
      "Ajuda a manter a pele saudável",
      "Regula a temperatura corporal",
      "Elimina toxinas do corpo",
    ],
  },
  {
    title: "Dicas de hidratação:",
    tips: [
      "Beba 2 litros de água por dia",
      "Tenha uma garrafa sempre por perto",
      "Adicione limão para mais sabor",
      "Evite esperar sentir sede",
    ],
  },
  {
    title: "Água e produtividade:",
    tips: [
      "Desidratação reduz a concentração",
      "Beba água ao acordar",
      "Mantenha um copo na sua mesa",
      "Água gelada ajuda a despertar",
    ],
  },
  {
    title: "Sinais de desidratação:",
    tips: [
      "Boca seca e lábios rachados",
      "Dor de cabeça frequente",
      "Cansaço e falta de energia",
      "Urina de cor escura",
    ],
  },
  {
    title: "Hidratação inteligente:",
    tips: [
      "Comece o dia com um copo de água",
      "Beba antes, durante e após exercícios",
      "Frutas também hidratam o corpo",
      "Reduza bebidas com cafeína",
    ],
  },
];

export const WaterBreakModal = ({ open, onClose }: WaterBreakModalProps) => {
  const { description, tipSet } = useMemo(() => {
    const descIndex = Math.floor(Math.random() * descriptions.length);
    const tipIndex = Math.floor(Math.random() * tipSets.length);
    return {
      description: descriptions[descIndex],
      tipSet: tipSets[tipIndex],
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md glass-strong border-accent/30">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center justify-center gap-2">
            💧 Hora de Hidratar!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
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
            <h4 className="font-semibold text-accent text-sm">{tipSet.title}</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tipSet.tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
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
