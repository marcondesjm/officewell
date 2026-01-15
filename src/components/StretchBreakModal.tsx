import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import stretchingImage from "@/assets/stretching-break.png";

interface StretchBreakModalProps {
  open: boolean;
  onClose: () => void;
}

const descriptions = [
  "Levante-se e movimente seu corpo. Você merece essa pausa!",
  "Hora de alongar! Seus músculos precisam de movimento.",
  "Dê uma pausa ao seu corpo. Alongue-se agora!",
  "Momento de relaxar a tensão muscular. Respire fundo!",
  "Cuide da sua postura. Faça um alongamento!",
  "Seu corpo pede movimento. Atenda esse chamado!",
  "Energize-se com um bom alongamento!",
];

const tipSets = [
  {
    title: "Sugestões de alongamento:",
    tips: [
      "Gire os ombros para trás e para frente",
      "Alongue o pescoço inclinando a cabeça",
      "Levante os braços acima da cabeça",
      "Faça rotação dos punhos",
    ],
  },
  {
    title: "Alongamento para costas:",
    tips: [
      "Gire o tronco sentado na cadeira",
      "Incline-se para frente tocando os pés",
      "Arqueie as costas como um gato",
      "Estique os braços para cima",
    ],
  },
  {
    title: "Exercícios para o pescoço:",
    tips: [
      "Incline a cabeça para cada lado",
      "Gire o pescoço em movimentos circulares",
      "Olhe para cima e depois para baixo",
      "Mantenha cada posição por 5 segundos",
    ],
  },
  {
    title: "Movimentos para as pernas:",
    tips: [
      "Levante-se e caminhe um pouco",
      "Faça agachamentos leves",
      "Estique uma perna de cada vez",
      "Gire os tornozelos em círculos",
    ],
  },
  {
    title: "Alongamento das mãos:",
    tips: [
      "Estenda os dedos e feche em punho",
      "Gire os pulsos em círculos",
      "Pressione as palmas uma contra outra",
      "Massageie cada dedo suavemente",
    ],
  },
  {
    title: "Relaxamento muscular:",
    tips: [
      "Contraia e relaxe os ombros",
      "Respire fundo 5 vezes",
      "Balance os braços soltos",
      "Sacuda as mãos vigorosamente",
    ],
  },
];

export const StretchBreakModal = ({ open, onClose }: StretchBreakModalProps) => {
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
      <DialogContent className="sm:max-w-md glass-strong border-secondary/30">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center justify-center gap-2">
            🤸 Hora de Alongar!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
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
            <h4 className="font-semibold text-secondary text-sm">{tipSet.title}</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tipSet.tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
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
