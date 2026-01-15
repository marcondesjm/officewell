import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import eyeBreakImage from "@/assets/eye-break.png";

interface EyeBreakModalProps {
  open: boolean;
  onClose: () => void;
}

const descriptions = [
  "Olhe para longe por 20 segundos. Seus olhos agradecem!",
  "Hora de relaxar sua visão! Olhe para o horizonte.",
  "Dê uma pausa às suas pupilas. Focalize algo distante.",
  "Seus olhos merecem descanso. Aproveite este momento!",
  "Tempo de aliviar a tensão ocular. Respire fundo.",
  "Cuide dos seus olhos agora. Olhe para longe!",
  "Momento de renovar sua visão. Pisque bastante!",
];

const tipSets = [
  {
    title: "Regra 20-20-20:",
    tips: [
      "A cada 20 minutos de tela",
      "Olhe para algo a 20 metros de distância",
      "Por pelo menos 20 segundos",
      "Pisque várias vezes para lubrificar",
    ],
  },
  {
    title: "Exercícios oculares:",
    tips: [
      "Mova os olhos em círculos lentamente",
      "Feche os olhos por 10 segundos",
      "Olhe para cima, baixo, esquerda e direita",
      "Massageie suavemente as pálpebras",
    ],
  },
  {
    title: "Dicas para seus olhos:",
    tips: [
      "Mantenha a tela a 50-70cm dos olhos",
      "Ajuste o brilho da tela ao ambiente",
      "Use colírio lubrificante se necessário",
      "Evite ar condicionado direto nos olhos",
    ],
  },
  {
    title: "Cuide da sua visão:",
    tips: [
      "Posicione a tela abaixo do nível dos olhos",
      "Use o modo noturno após as 18h",
      "Faça pausas a cada 20-30 minutos",
      "Mantenha boa iluminação no ambiente",
    ],
  },
  {
    title: "Saúde ocular no trabalho:",
    tips: [
      "Reduza reflexos na tela",
      "Aumente o tamanho da fonte se necessário",
      "Mantenha os olhos hidratados",
      "Consulte um oftalmologista anualmente",
    ],
  },
];

export const EyeBreakModal = ({ open, onClose }: EyeBreakModalProps) => {
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
      <DialogContent className="sm:max-w-md glass-strong border-primary/30">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center justify-center gap-2">
            👁️ Descanso Visual
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
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
            <h4 className="font-semibold text-primary text-sm">{tipSet.title}</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tipSet.tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
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
