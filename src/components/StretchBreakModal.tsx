import { useMemo, useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, Unlock } from "lucide-react";
import stretchingImage from "@/assets/stretching-break.png";

interface StretchBreakModalProps {
  open: boolean;
  onClose: () => void;
}

const MIN_DURATION = 30; // 30 seconds minimum

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
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [tipSet, setTipSet] = useState(tipSets[0]);

  // Reset timer and randomize tips when modal opens
  useEffect(() => {
    if (open) {
      setStartTime(Date.now());
      setElapsed(0);
      // Randomize tips each time modal opens
      setDescription(descriptions[Math.floor(Math.random() * descriptions.length)]);
      setTipSet(tipSets[Math.floor(Math.random() * tipSets.length)]);
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
            type: "stretch",
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
          type: "stretch",
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
        className="sm:max-w-md glass-strong border-secondary/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
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
                ? "gradient-accent text-white" 
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
