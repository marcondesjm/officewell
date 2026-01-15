import { useMemo, useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, Unlock } from "lucide-react";
import eyeBreakImage from "@/assets/eye-break.png";

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
      onClose();
    }
  }, [canClose, startTime, elapsed, onClose]);

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
