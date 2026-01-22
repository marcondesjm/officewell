import { useMemo, useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, Unlock, Star } from "lucide-react";
import sunBreakImage1 from "@/assets/sun-break.png";
import sunBreakImage2 from "@/assets/sun-break-2.png";
import sunBreakImage3 from "@/assets/sun-break-3.png";
import sunBreakImage4 from "@/assets/sun-break-4.png";
import { getRandomIndex } from "@/hooks/useDailyRandomMessage";
import { useGamification } from "@/hooks/useGamification";
import { useGoals } from "@/hooks/useGoals";
import { toast } from "sonner";

const sunBreakImages = [sunBreakImage1, sunBreakImage2, sunBreakImage3, sunBreakImage4];

interface SunBreakModalProps {
  open: boolean;
  onClose: () => void;
}

const MIN_DURATION = 60; // 60 seconds minimum (1 minuto de exposição ao sol)

const descriptions = [
  "Tome um banho de sol de 1 minuto. Vitamina D é essencial!",
  "Hora de absorver luz solar! Vá até a janela ou área externa.",
  "Pause e receba um pouco de sol. Seu corpo agradece!",
  "Momento perfeito para uma dose de vitamina D!",
  "Cuide da sua saúde. Exponha-se brevemente ao sol!",
  "Recarregue suas energias com luz natural!",
  "Lembre-se: sol moderado é saúde. Aproveite!",
  "Seu corpo precisa de luz solar. Atenda esse chamado!",
  "Exposição solar breve = bem-estar garantido!",
  "Faça uma pausa energizante ao sol!",
  "Luz solar melhora sua disposição e humor!",
  "Mantenha-se saudável: tome sol agora!",
  "Sol: o energético natural do seu corpo!",
  "Momento de renovar as energias com luz solar!",
  "Sua saúde agradece: tome um banho de sol!",
];

const tipSets = [
  {
    title: "Benefícios da luz solar:",
    tips: [
      "Produção de vitamina D essencial",
      "Melhora o humor e reduz estresse",
      "Regula o ciclo do sono",
      "Fortalece ossos e sistema imune",
    ],
  },
  {
    title: "Dicas de exposição solar:",
    tips: [
      "5-15 min por dia são suficientes",
      "Prefira horários antes das 10h",
      "Exponha braços e pernas ao sol",
      "Evite exposição prolongada",
    ],
  },
  {
    title: "Sol e produtividade:",
    tips: [
      "Luz natural aumenta energia",
      "Melhora a concentração no trabalho",
      "Reduz sonolência diurna",
      "Combate a fadiga mental",
    ],
  },
  {
    title: "Sinais de deficiência de vitamina D:",
    tips: [
      "Cansaço frequente sem motivo",
      "Dores musculares e ósseas",
      "Imunidade baixa (resfriados)",
      "Alterações de humor",
    ],
  },
  {
    title: "Exposição solar inteligente:",
    tips: [
      "Vá até a janela se não puder sair",
      "Use a pausa do café ao ar livre",
      "Caminhe alguns minutos sob o sol",
      "Tome sol nos braços/rosto",
    ],
  },
  {
    title: "Sol e bem-estar mental:",
    tips: [
      "Aumenta produção de serotonina",
      "Combate sintomas de depressão",
      "Melhora qualidade do sono",
      "Reduz níveis de ansiedade",
    ],
  },
  {
    title: "Sol no ambiente de trabalho:",
    tips: [
      "Posicione mesa perto de janela",
      "Faça pausas em áreas externas",
      "Abra cortinas durante o dia",
      "Combine café com luz solar",
    ],
  },
  {
    title: "Vitamina D e saúde:",
    tips: [
      "Essencial para absorção de cálcio",
      "Protege contra doenças crônicas",
      "Importante para saúde cardiovascular",
      "Fortalece o sistema imunológico",
    ],
  },
  {
    title: "Mitos sobre exposição solar:",
    tips: [
      "Luz pela janela não produz vit. D",
      "Protetor solar reduz síntese de D",
      "Pele mais escura precisa mais sol",
      "Suplementos não substituem o sol",
    ],
  },
  {
    title: "Horários ideais para sol:",
    tips: [
      "Manhã: 8h às 10h (ideal)",
      "Tarde: após 16h (seguro)",
      "Evite 10h às 16h (forte demais)",
      "1-2 exposições diárias bastam",
    ],
  },
];

export const SunBreakModal = ({ open, onClose }: SunBreakModalProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [tipSet, setTipSet] = useState(tipSets[0]);
  const [currentImage, setCurrentImage] = useState(sunBreakImages[0]);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const { addPoints } = useGamification();
  const { incrementProgress } = useGoals();

  // Reset timer and randomize tips when modal opens (no repetition during day)
  useEffect(() => {
    if (open) {
      setStartTime(Date.now());
      setElapsed(0);
      setPointsAwarded(false);
      // Get non-repeating random indices for today
      const descIdx = getRandomIndex("sun", "descriptions", descriptions.length);
      const tipIdx = getRandomIndex("sun", "tipSets", tipSets.length);
      const imageIdx = getRandomIndex("sun", "images", sunBreakImages.length);
      setDescription(descriptions[descIdx]);
      setTipSet(tipSets[tipIdx]);
      setCurrentImage(sunBreakImages[imageIdx]);
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
            type: "sun",
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
          type: "sun",
          scheduledAt: startTime,
          completedAt: Date.now(),
          duration: elapsed,
          wasCompliant: true,
        });
        localStorage.setItem("complianceRecords", JSON.stringify(records));
      } catch (e) {
        console.log("Error saving compliance:", e);
      }
      
      // Award points if not already awarded
      if (!pointsAwarded) {
        const points = addPoints("sun");
        setPointsAwarded(true);
        toast.success(`+${points} pontos!`, {
          description: "Banho de sol completado",
          icon: <Star className="h-4 w-4 text-yellow-500" />,
        });
        
        // Update goals progress - use 'sun' for the sun goal
        incrementProgress("sun", 1);
      }
      
      onClose();
    }
  }, [canClose, startTime, elapsed, onClose, pointsAwarded, addPoints, incrementProgress]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md glass-strong border-orange-500/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center justify-center gap-2">
            ☀️ Hora do Banho de Sol!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img 
              src={currentImage} 
              alt="Banho de sol e vitamina D no trabalho"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
          
          <div className="bg-orange-500/10 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-orange-500 text-sm">{tipSet.title}</h4>
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
                ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600" 
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
