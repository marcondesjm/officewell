import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, Unlock, Play, Pause, SkipForward, Timer, CheckCircle2, Star } from "lucide-react";
import stretchingImage1 from "@/assets/stretching-break.png";
import stretchingImage2 from "@/assets/stretching-break-2.png";
import stretchingImage3 from "@/assets/stretching-break-3.png";
import stretchingImage4 from "@/assets/stretching-break-4.png";
import { getRandomIndex } from "@/hooks/useDailyRandomMessage";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/hooks/useGamification";
import { useGoals } from "@/hooks/useGoals";
import { toast } from "sonner";

const stretchingImages = [stretchingImage1, stretchingImage2, stretchingImage3, stretchingImage4];

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
  "Libere a tensão acumulada. Alongue-se!",
  "Músculos felizes = trabalho mais produtivo!",
  "Previna dores: alongue-se regularmente!",
  "Seu corpo é seu instrumento. Cuide dele!",
  "Pausa ativa para renovar as energias!",
  "Alongamento: investimento na sua saúde!",
  "Movimente-se e sinta a diferença!",
  "Quebre a rigidez. Seu corpo agradece!",
];

interface TipWithDuration {
  text: string;
  duration: number; // seconds
}

interface TipSet {
  title: string;
  tips: TipWithDuration[];
}

const tipSets: TipSet[] = [
  {
    title: "Sugestões de alongamento:",
    tips: [
      { text: "Gire os ombros para trás e para frente", duration: 15 },
      { text: "Alongue o pescoço inclinando a cabeça", duration: 10 },
      { text: "Levante os braços acima da cabeça", duration: 10 },
      { text: "Faça rotação dos punhos", duration: 10 },
    ],
  },
  {
    title: "Alongamento para costas:",
    tips: [
      { text: "Gire o tronco sentado na cadeira", duration: 15 },
      { text: "Incline-se para frente tocando os pés", duration: 12 },
      { text: "Arqueie as costas como um gato", duration: 10 },
      { text: "Estique os braços para cima", duration: 8 },
    ],
  },
  {
    title: "Exercícios para o pescoço:",
    tips: [
      { text: "Incline a cabeça para cada lado", duration: 10 },
      { text: "Gire o pescoço em movimentos circulares", duration: 15 },
      { text: "Olhe para cima e depois para baixo", duration: 8 },
      { text: "Mantenha cada posição por 5 segundos", duration: 10 },
    ],
  },
  {
    title: "Movimentos para as pernas:",
    tips: [
      { text: "Levante-se e caminhe um pouco", duration: 20 },
      { text: "Faça agachamentos leves", duration: 15 },
      { text: "Estique uma perna de cada vez", duration: 12 },
      { text: "Gire os tornozelos em círculos", duration: 10 },
    ],
  },
  {
    title: "Alongamento das mãos:",
    tips: [
      { text: "Estenda os dedos e feche em punho", duration: 10 },
      { text: "Gire os pulsos em círculos", duration: 12 },
      { text: "Pressione as palmas uma contra outra", duration: 8 },
      { text: "Massageie cada dedo suavemente", duration: 15 },
    ],
  },
  {
    title: "Relaxamento muscular:",
    tips: [
      { text: "Contraia e relaxe os ombros", duration: 12 },
      { text: "Respire fundo 5 vezes", duration: 20 },
      { text: "Balance os braços soltos", duration: 10 },
      { text: "Sacuda as mãos vigorosamente", duration: 8 },
    ],
  },
  {
    title: "Alongamento de quadril:",
    tips: [
      { text: "Cruze uma perna sobre a outra", duration: 12 },
      { text: "Incline o tronco para frente", duration: 10 },
      { text: "Gire o quadril sentado", duration: 15 },
      { text: "Estenda as pernas sob a mesa", duration: 10 },
    ],
  },
  {
    title: "Exercícios para ombros:",
    tips: [
      { text: "Eleve os ombros até as orelhas", duration: 10 },
      { text: "Role os ombros para trás 10x", duration: 15 },
      { text: "Cruze os braços e abrace-se", duration: 8 },
      { text: "Estique um braço e puxe com o outro", duration: 12 },
    ],
  },
  {
    title: "Postura correta:",
    tips: [
      { text: "Pés apoiados no chão", duration: 8 },
      { text: "Costas retas encostadas na cadeira", duration: 10 },
      { text: "Ombros relaxados, não elevados", duration: 8 },
      { text: "Queixo paralelo ao chão", duration: 8 },
    ],
  },
  {
    title: "Movimentos anti-sedentarismo:",
    tips: [
      { text: "Fique em pé e alongue-se", duration: 15 },
      { text: "Faça 10 polichinelos leves", duration: 20 },
      { text: "Caminhe no lugar por alguns segundos", duration: 15 },
      { text: "Faça micro-pausas ativas", duration: 10 },
    ],
  },
  {
    title: "Respiração e alongamento:",
    tips: [
      { text: "Inspire ao alongar, expire ao relaxar", duration: 12 },
      { text: "Respiração profunda pelo nariz", duration: 15 },
      { text: "Segure 5 segundos cada posição", duration: 10 },
      { text: "Nunca force além do confortável", duration: 8 },
    ],
  },
  {
    title: "Prevenção de LER/DORT:",
    tips: [
      { text: "Alongue os pulsos e antebraços", duration: 12 },
      { text: "Mantenha pulsos neutros ao digitar", duration: 10 },
      { text: "Faça pausas frequentes", duration: 8 },
      { text: "Massageie os músculos do antebraço", duration: 15 },
    ],
  },
];

export const StretchBreakModal = ({ open, onClose }: StretchBreakModalProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [tipSet, setTipSet] = useState<TipSet>(tipSets[0]);
  const [currentImage, setCurrentImage] = useState(stretchingImages[0]);
  
  // Exercise mode states
  const [exerciseMode, setExerciseMode] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0);
  const [isExercisePaused, setIsExercisePaused] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [mainTimerPaused, setMainTimerPaused] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const { addPoints } = useGamification();
  const { incrementProgress } = useGoals();

  // Calculate minimum duration based on exercise times
  const totalExerciseTime = tipSet.tips.reduce((acc, tip) => acc + tip.duration, 0);
  const MIN_DURATION = Math.max(30, totalExerciseTime);

  // Reset timer and randomize tips when modal opens
  useEffect(() => {
    if (open) {
      setStartTime(Date.now());
      setElapsed(0);
      setExerciseMode(false);
      setCurrentExerciseIndex(0);
      setExerciseTimeLeft(0);
      setIsExercisePaused(false);
      setCompletedExercises([]);
      setMainTimerPaused(false);
      setPointsAwarded(false);
      
      const descIdx = getRandomIndex("stretch", "descriptions", descriptions.length);
      const tipIdx = getRandomIndex("stretch", "tipSets", tipSets.length);
      const imageIdx = getRandomIndex("stretch", "images", stretchingImages.length);
      setDescription(descriptions[descIdx]);
      setTipSet(tipSets[tipIdx]);
      setCurrentImage(stretchingImages[imageIdx]);
    } else {
      setStartTime(null);
      setElapsed(0);
    }
  }, [open]);

  // Main timer - only runs when not paused
  useEffect(() => {
    if (!open || !startTime || mainTimerPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSecs = Math.floor((now - startTime) / 1000);
      setElapsed(elapsedSecs);
    }, 100);

    return () => clearInterval(interval);
  }, [open, startTime, mainTimerPaused]);

  // Exercise countdown timer
  useEffect(() => {
    if (!exerciseMode || isExercisePaused || exerciseTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setExerciseTimeLeft(prev => {
        if (prev <= 1) {
          // Exercise completed
          setCompletedExercises(prev => [...prev, currentExerciseIndex]);
          
          // Check if there are more exercises
          if (currentExerciseIndex < tipSet.tips.length - 1) {
            // Move to next exercise automatically
            const nextIndex = currentExerciseIndex + 1;
            setCurrentExerciseIndex(nextIndex);
            return tipSet.tips[nextIndex].duration;
          } else {
            // All exercises completed
            setExerciseMode(false);
            setMainTimerPaused(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [exerciseMode, isExercisePaused, exerciseTimeLeft, currentExerciseIndex, tipSet.tips]);

  const startExercises = useCallback(() => {
    setExerciseMode(true);
    setMainTimerPaused(true);
    setCurrentExerciseIndex(0);
    setExerciseTimeLeft(tipSet.tips[0].duration);
    setIsExercisePaused(false);
    setCompletedExercises([]);
  }, [tipSet.tips]);

  const toggleExercisePause = useCallback(() => {
    setIsExercisePaused(prev => !prev);
  }, []);

  const skipExercise = useCallback(() => {
    setCompletedExercises(prev => [...prev, currentExerciseIndex]);
    
    if (currentExerciseIndex < tipSet.tips.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setExerciseTimeLeft(tipSet.tips[nextIndex].duration);
    } else {
      setExerciseMode(false);
      setMainTimerPaused(false);
    }
  }, [currentExerciseIndex, tipSet.tips]);

  const exitExerciseMode = useCallback(() => {
    setExerciseMode(false);
    setMainTimerPaused(false);
  }, []);

  const remaining = Math.max(0, MIN_DURATION - elapsed);
  const canClose = remaining === 0 || completedExercises.length === tipSet.tips.length;
  const progress = Math.min(100, (elapsed / MIN_DURATION) * 100);

  const handleClose = useCallback(() => {
    if (canClose) {
      try {
        const records = JSON.parse(localStorage.getItem("complianceRecords") || "[]");
        records.push({
          type: "stretch",
          scheduledAt: startTime,
          completedAt: Date.now(),
          duration: elapsed,
          wasCompliant: true,
          exercisesCompleted: completedExercises.length,
        });
        localStorage.setItem("complianceRecords", JSON.stringify(records));
      } catch (e) {
        console.log("Error saving compliance:", e);
      }
      
      // Award points if not already awarded
      if (!pointsAwarded) {
        const points = addPoints("stretch");
        setPointsAwarded(true);
        toast.success(`+${points} pontos!`, {
          description: "Alongamento completado",
          icon: <Star className="h-4 w-4 text-yellow-500" />,
        });
        
        // Update goals progress
        incrementProgress("breaks", 1);
      }
      
      onClose();
    }
  }, [canClose, startTime, elapsed, completedExercises, onClose, pointsAwarded, addPoints, incrementProgress]);

  const currentExercise = tipSet.tips[currentExerciseIndex];
  const exerciseProgress = currentExercise ? ((currentExercise.duration - exerciseTimeLeft) / currentExercise.duration) * 100 : 0;

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
          {/* Image - only show when not in exercise mode */}
          <AnimatePresence mode="wait">
            {!exerciseMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative rounded-xl overflow-hidden shadow-lg"
              >
                <img 
                  src={currentImage} 
                  alt="Pessoa fazendo alongamento no escritório"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exercise Mode UI */}
          <AnimatePresence mode="wait">
            {exerciseMode ? (
              <motion.div
                key="exercise-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                {/* Current Exercise Card */}
                <div className="bg-secondary/20 rounded-xl p-5 border border-secondary/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Exercício {currentExerciseIndex + 1} de {tipSet.tips.length}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-secondary">
                      <CheckCircle2 className="h-3 w-3" />
                      {completedExercises.length} concluídos
                    </span>
                  </div>
                  
                  <motion.p 
                    key={currentExerciseIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-semibold text-center text-foreground"
                  >
                    {currentExercise?.text}
                  </motion.p>

                  {/* Countdown Timer */}
                  <div className="flex flex-col items-center gap-2">
                    <motion.div 
                      className="text-5xl font-bold font-mono text-secondary"
                      key={exerciseTimeLeft}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                    >
                      {exerciseTimeLeft}s
                    </motion.div>
                    <Progress value={exerciseProgress} className="h-2 w-full" />
                  </div>

                  {/* Exercise Controls */}
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleExercisePause}
                      className="gap-2"
                    >
                      {isExercisePaused ? (
                        <>
                          <Play className="h-4 w-4" />
                          Continuar
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4" />
                          Pausar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={skipExercise}
                      className="gap-2"
                    >
                      <SkipForward className="h-4 w-4" />
                      Pular
                    </Button>
                  </div>
                </div>

                {/* Exercise List Progress */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">{tipSet.title}</h4>
                  <div className="space-y-1.5">
                    {tipSet.tips.map((tip, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-2 text-sm p-2 rounded-md transition-all ${
                          index === currentExerciseIndex 
                            ? "bg-secondary/20 text-foreground font-medium" 
                            : completedExercises.includes(index)
                            ? "text-green-600 dark:text-green-400 line-through opacity-70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {completedExercises.includes(index) ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : index === currentExerciseIndex ? (
                          <Timer className="h-4 w-4 text-secondary animate-pulse flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                        )}
                        <span className="flex-1 truncate">{tip.text}</span>
                        <span className="text-xs opacity-60">{tip.duration}s</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exit Exercise Mode */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exitExerciseMode}
                  className="w-full text-muted-foreground"
                >
                  Sair do modo guiado
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="normal-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Tips with durations */}
                <div className="bg-secondary/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-secondary text-sm">{tipSet.title}</h4>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={startExercises}
                      className="gap-2 text-xs"
                    >
                      <Play className="h-3 w-3" />
                      Iniciar Guiado
                    </Button>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {tipSet.tips.map((tip, index) => (
                      <li key={index} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="text-secondary">•</span>
                          {tip.text}
                        </span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                          {tip.duration}s
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
                    Tempo total: ~{Math.ceil(totalExerciseTime / 60)} min
                  </p>
                </div>

                {/* Main timer indicator */}
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
              </motion.div>
            )}
          </AnimatePresence>
          
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

          {/* Legal Disclaimer */}
          <p className="text-[10px] text-muted-foreground/70 text-center leading-tight">
            ⚖️ As orientações de ergonomia do OfficeWell têm caráter educativo e preventivo, não substituindo avaliação médica ou fisioterapêutica.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
