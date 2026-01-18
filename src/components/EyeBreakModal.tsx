import { useMemo, useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, Unlock, Star } from "lucide-react";
import eyeBreakImage1 from "@/assets/eye-break.png";
import eyeBreakImage2 from "@/assets/eye-break-2.png";
import eyeBreakImage3 from "@/assets/eye-break-3.png";
import eyeBreakImage4 from "@/assets/eye-break-4.png";
import { getRandomIndex } from "@/hooks/useDailyRandomMessage";
import { useGamification } from "@/hooks/useGamification";
import { useGoals } from "@/hooks/useGoals";
import { toast } from "sonner";

const eyeBreakImages = [eyeBreakImage1, eyeBreakImage2, eyeBreakImage3, eyeBreakImage4];

interface EyeBreakModalProps {
  open: boolean;
  onClose: () => void;
}

const MIN_DURATION = 20; // 20 seconds minimum

const descriptions = [
  "Olhe para longe por 20 segundos. Seus olhos agradecem!",
  "Hora de relaxar sua visão! Olhe para o horizonte.",
  "Dê uma pausa às suas pupilas. Focalize algo distante.",
  "Seus olhos merecem descanso. Aproveite este momento!",
  "Tempo de aliviar a tensão ocular. Respire fundo.",
  "Cuide dos seus olhos agora. Olhe para longe!",
  "Momento de renovar sua visão. Pisque bastante!",
  "Descanse os olhos e recarregue sua energia visual!",
  "Seus olhos trabalham duro. Dê a eles esse descanso!",
  "Pausa estratégica para manter sua visão saudável!",
  "Olhos descansados = produtividade aumentada!",
  "Dedique este momento à saúde dos seus olhos!",
  "Sua visão é preciosa. Cuide dela agora!",
  "Relaxe o foco e deixe seus olhos respirarem.",
  "Momento zen para seus olhos. Aproveite!",
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
  {
    title: "Prevenção da fadiga visual:",
    tips: [
      "Evite usar o celular em ambientes escuros",
      "Pisque conscientemente a cada minuto",
      "Use óculos com filtro de luz azul",
      "Mantenha distância adequada das telas",
    ],
  },
  {
    title: "Relaxamento ocular profundo:",
    tips: [
      "Cubra os olhos com as palmas por 30s",
      "Respire profundamente 5 vezes",
      "Imagine um cenário natural relaxante",
      "Solte a tensão da testa e sobrancelhas",
    ],
  },
  {
    title: "Yoga para os olhos:",
    tips: [
      "Mova os olhos em forma de 8 deitado",
      "Foque alternadamente perto e longe",
      "Aperte e relaxe os olhos 5 vezes",
      "Olhe para os 4 cantos lentamente",
    ],
  },
  {
    title: "Ergonomia visual:",
    tips: [
      "Tela ligeiramente inclinada para trás",
      "Centro da tela na altura dos olhos",
      "Iluminação lateral, nunca por trás",
      "Evite trabalhar de frente para janelas",
    ],
  },
  {
    title: "Nutrientes para os olhos:",
    tips: [
      "Vitamina A: cenoura, abóbora, manga",
      "Ômega-3: peixes, chia, linhaça",
      "Luteína: espinafre, couve, brócolis",
      "Zinco: castanhas, sementes, ovos",
    ],
  },
];

export const EyeBreakModal = ({ open, onClose }: EyeBreakModalProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [tipSet, setTipSet] = useState(tipSets[0]);
  const [currentImage, setCurrentImage] = useState(eyeBreakImages[0]);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const { addPoints, stats } = useGamification();
  const { incrementProgress } = useGoals();

  // Reset timer and randomize tips when modal opens (no repetition during day)
  useEffect(() => {
    if (open) {
      setStartTime(Date.now());
      setElapsed(0);
      setPointsAwarded(false);
      // Get non-repeating random indices for today
      const descIdx = getRandomIndex("eye", "descriptions", descriptions.length);
      const tipIdx = getRandomIndex("eye", "tipSets", tipSets.length);
      const imageIdx = getRandomIndex("eye", "images", eyeBreakImages.length);
      setDescription(descriptions[descIdx]);
      setTipSet(tipSets[tipIdx]);
      setCurrentImage(eyeBreakImages[imageIdx]);
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
            type: "eye",
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
          type: "eye",
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
        const points = addPoints("eye");
        setPointsAwarded(true);
        toast.success(`+${points} pontos!`, {
          description: "Descanso visual completado",
          icon: <Star className="h-4 w-4 text-yellow-500" />,
        });
        
        // Update goals progress
        incrementProgress("eye_exercises", 1);
      }
      
      onClose();
    }
  }, [canClose, startTime, elapsed, onClose, pointsAwarded, addPoints, incrementProgress]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md glass-strong border-primary/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
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
              src={currentImage} 
              alt="Pessoa fazendo pausa para descansar os olhos"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
          
          <div className="bg-primary-light rounded-lg p-4 space-y-2 border border-primary/20">
            <h4 className="font-semibold text-primary text-sm">{tipSet.title}</h4>
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
                  <Unlock className="h-4 w-4 text-success" />
                ) : (
                  <Lock className="h-4 w-4 text-accent animate-pulse" />
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
                ? "gradient-primary text-white" 
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
