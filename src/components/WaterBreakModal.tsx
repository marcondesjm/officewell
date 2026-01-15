import { useMemo, useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, Unlock } from "lucide-react";
import waterBreakImage1 from "@/assets/water-break.png";
import waterBreakImage2 from "@/assets/water-break-2.png";
import waterBreakImage3 from "@/assets/water-break-3.png";
import waterBreakImage4 from "@/assets/water-break-4.png";
import { getRandomIndex } from "@/hooks/useDailyRandomMessage";

const waterBreakImages = [waterBreakImage1, waterBreakImage2, waterBreakImage3, waterBreakImage4];

interface WaterBreakModalProps {
  open: boolean;
  onClose: () => void;
}

const MIN_DURATION = 10; // 10 seconds minimum

const descriptions = [
  "Beba um copo de água agora. Mantenha-se saudável!",
  "Hora de hidratar! Seu corpo agradece.",
  "Pause e beba água. Hidratação é essencial!",
  "Momento perfeito para um gole de água fresca!",
  "Cuide do seu corpo. Beba água agora!",
  "Recarregue suas energias com um copo de água!",
  "Lembre-se: água é vida. Hidrate-se!",
  "Seu corpo precisa de água. Atenda esse chamado!",
  "Hidratação constante = saúde em dia!",
  "Faça uma pausa refrescante com água!",
  "Beber água melhora sua concentração!",
  "Mantenha o foco: hidrate-se agora!",
  "Água: o combustível do seu cérebro!",
  "Momento de renovar as energias com água!",
  "Sua produtividade agradece: beba água!",
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
  {
    title: "Água e bem-estar:",
    tips: [
      "Ajuda na digestão dos alimentos",
      "Previne dores de cabeça",
      "Melhora o humor e disposição",
      "Contribui para perda de peso",
    ],
  },
  {
    title: "Hidratação no trabalho:",
    tips: [
      "Use app para lembrar de beber água",
      "Associe água com tarefas diárias",
      "Prefira água a refrigerantes",
      "Beba um copo a cada hora",
    ],
  },
  {
    title: "Água e saúde mental:",
    tips: [
      "Desidratação aumenta o estresse",
      "Água melhora a memória",
      "Hidratação reduz ansiedade",
      "Beber água ajuda a relaxar",
    ],
  },
  {
    title: "Mitos sobre hidratação:",
    tips: [
      "Chá e café também contam",
      "Não precisa ser só água pura",
      "Sede já é sinal de desidratação leve",
      "Excesso de água também faz mal",
    ],
  },
  {
    title: "Alternativas refrescantes:",
    tips: [
      "Água com rodelas de pepino",
      "Água com hortelã fresca",
      "Água de coco natural",
      "Chás gelados sem açúcar",
    ],
  },
];

export const WaterBreakModal = ({ open, onClose }: WaterBreakModalProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [tipSet, setTipSet] = useState(tipSets[0]);
  const [currentImage, setCurrentImage] = useState(waterBreakImages[0]);

  // Reset timer and randomize tips when modal opens (no repetition during day)
  useEffect(() => {
    if (open) {
      setStartTime(Date.now());
      setElapsed(0);
      // Get non-repeating random indices for today
      const descIdx = getRandomIndex("water", "descriptions", descriptions.length);
      const tipIdx = getRandomIndex("water", "tipSets", tipSets.length);
      const imageIdx = getRandomIndex("water", "images", waterBreakImages.length);
      setDescription(descriptions[descIdx]);
      setTipSet(tipSets[tipIdx]);
      setCurrentImage(waterBreakImages[imageIdx]);
    } else {
      setStartTime(null);
      setElapsed(0);
    }
  }, [open]);

  // Update elapsed time and auto-close
  useEffect(() => {
    if (!open || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSecs = Math.floor((now - startTime) / 1000);
      setElapsed(elapsedSecs);

      // Auto-close when timer completes
      if (elapsedSecs >= MIN_DURATION) {
        // Record compliance
        try {
          const records = JSON.parse(localStorage.getItem("complianceRecords") || "[]");
          records.push({
            type: "water",
            scheduledAt: startTime,
            completedAt: Date.now(),
            duration: elapsedSecs,
            wasCompliant: true,
          });
          localStorage.setItem("complianceRecords", JSON.stringify(records));
        } catch (e) {
          console.log("Error saving compliance:", e);
        }
        clearInterval(interval);
        onClose();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [open, startTime]);

  const remaining = Math.max(0, MIN_DURATION - elapsed);
  const canClose = remaining === 0;
  const progress = Math.min(100, (elapsed / MIN_DURATION) * 100);

  const handleClose = useCallback(() => {
    if (canClose) {
      // Record compliance
      try {
        const records = JSON.parse(localStorage.getItem("complianceRecords") || "[]");
        records.push({
          type: "water",
          scheduledAt: startTime,
          completedAt: Date.now(),
          duration: elapsed,
          wasCompliant: true,
        });
        localStorage.setItem("complianceRecords", JSON.stringify(records));
      } catch (e) {
        console.log("Error saving compliance:", e);
      }
      onClose();
    }
  }, [canClose, startTime, elapsed, onClose]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md glass-strong border-accent/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
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
              src={currentImage} 
              alt="Hidratação e água no trabalho"
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

          {/* Mandatory timer indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                {canClose ? (
                  <Unlock className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-orange-500 animate-pulse" />
                )}
                {canClose ? "Pausa concluída!" : "Aguarde para concluir"}
              </span>
              <span className="font-mono font-bold">
                {canClose ? "✓" : `${remaining}s`}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <Button 
            onClick={handleClose} 
            disabled={!canClose}
            className={`w-full font-semibold transition-all ${
              canClose 
                ? "gradient-secondary text-white" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {canClose ? "Concluído! ✓" : `Aguarde ${remaining}s...`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
