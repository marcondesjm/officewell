import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle2, 
  Trophy,
  Timer,
  ArrowRight,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "sonner";

interface DailyErgonomicsSessionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Exercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  icon: string;
}

const exercises: Exercise[] = [
  {
    id: "pescoço",
    name: "Pescoço",
    duration: 15,
    description: "Incline a cabeça lentamente para frente e para os lados. Não force.",
    icon: "🧘"
  },
  {
    id: "ombros",
    name: "Ombros",
    duration: 10,
    description: "Gire os ombros lentamente para trás.",
    icon: "💪"
  },
  {
    id: "bracos-punhos",
    name: "Braços e Punhos",
    duration: 20,
    description: "Estenda os braços e puxe suavemente os dedos.",
    icon: "🤲"
  },
  {
    id: "coluna",
    name: "Coluna",
    duration: 30,
    description: "Mantenha os pés no chão e a coluna ereta.",
    icon: "🧍"
  },
  {
    id: "olhos",
    name: "Olhos",
    duration: 20,
    description: "Olhe para um ponto distante por 20 segundos.",
    icon: "👀"
  },
];

export const DailyErgonomicsSession = ({ open, onOpenChange }: DailyErgonomicsSessionProps) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(-1); // -1 = not started
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const { addPoints } = useGamification();

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setCurrentExerciseIndex(-1);
      setTimeLeft(0);
      setIsPaused(false);
      setCompletedExercises([]);
      setIsSessionComplete(false);
      setPointsAwarded(false);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (currentExerciseIndex < 0 || isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Exercise completed
          const currentExercise = exercises[currentExerciseIndex];
          setCompletedExercises(prev => [...prev, currentExercise.id]);
          
          // Check if there are more exercises
          if (currentExerciseIndex < exercises.length - 1) {
            const nextIndex = currentExerciseIndex + 1;
            setCurrentExerciseIndex(nextIndex);
            return exercises[nextIndex].duration;
          } else {
            // All exercises completed
            setIsSessionComplete(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentExerciseIndex, isPaused, timeLeft]);

  const startSession = useCallback(() => {
    setCurrentExerciseIndex(0);
    setTimeLeft(exercises[0].duration);
    setIsPaused(false);
    setCompletedExercises([]);
    setIsSessionComplete(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const skipExercise = useCallback(() => {
    const currentExercise = exercises[currentExerciseIndex];
    setCompletedExercises(prev => [...prev, currentExercise.id]);
    
    if (currentExerciseIndex < exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setTimeLeft(exercises[nextIndex].duration);
    } else {
      setIsSessionComplete(true);
    }
  }, [currentExerciseIndex]);

  const handleClose = useCallback(() => {
    // Award points if session was completed and not already awarded
    if (isSessionComplete && !pointsAwarded) {
      const points = addPoints("daily_session");
      setPointsAwarded(true);
      toast.success(`+${points} pontos!`, {
        description: "Sessão diária completada",
        icon: <Star className="h-4 w-4 text-yellow-500" />,
      });
    }
    onOpenChange(false);
  }, [onOpenChange, isSessionComplete, pointsAwarded, addPoints]);

  const currentExercise = currentExerciseIndex >= 0 ? exercises[currentExerciseIndex] : null;
  const progress = currentExercise ? ((currentExercise.duration - timeLeft) / currentExercise.duration) * 100 : 0;
  const totalProgress = (completedExercises.length / exercises.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center justify-center gap-2">
            🏃 Sessão Diária de Ergonomia
          </DialogTitle>
          <DialogDescription>
            {isSessionComplete 
              ? "Parabéns! Você completou todos os exercícios!"
              : currentExerciseIndex >= 0 
                ? `Exercício ${currentExerciseIndex + 1} de ${exercises.length}`
                : "5 exercícios rápidos para sua saúde"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Session Complete Screen */}
          <AnimatePresence mode="wait">
            {isSessionComplete ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-4 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Trophy className="h-20 w-20 mx-auto text-yellow-500" />
                </motion.div>
                <h3 className="text-xl font-bold">Sessão concluída. Sua coluna agradece 👏</h3>
                <p className="text-muted-foreground">
                  Você completou {completedExercises.length} exercícios de ergonomia!
                </p>
                <Button onClick={handleClose} className="gradient-accent w-full">
                  Concluir Sessão
                </Button>
              </motion.div>
            ) : currentExerciseIndex >= 0 && currentExercise ? (
              <motion.div
                key="exercise"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Current Exercise */}
                <div className="bg-secondary/20 rounded-xl p-6 text-center space-y-4 border border-secondary/30">
                  <motion.div
                    key={currentExercise.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl"
                  >
                    {currentExercise.icon}
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-secondary">
                    {currentExercise.name}
                  </h3>
                  
                  <p className="text-muted-foreground">
                    {currentExercise.description}
                  </p>

                  {/* Countdown */}
                  <motion.div 
                    className="text-5xl font-bold font-mono text-primary"
                    key={timeLeft}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {timeLeft}s
                  </motion.div>
                  
                  <Progress value={progress} className="h-2" />
                  
                  {/* Controls */}
                  <div className="flex justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={togglePause}
                      className="gap-2"
                    >
                      {isPaused ? (
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
                      onClick={skipExercise}
                      className="gap-2"
                    >
                      <SkipForward className="h-4 w-4" />
                      Pular
                    </Button>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progresso da sessão</span>
                    <span>{completedExercises.length}/{exercises.length}</span>
                  </div>
                  <Progress value={totalProgress} className="h-2" />
                </div>

                {/* Exercise List */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                  {exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className={`flex items-center gap-2 text-sm p-2 rounded-md transition-all ${
                        index === currentExerciseIndex
                          ? "bg-secondary/20 text-foreground font-medium"
                          : completedExercises.includes(exercise.id)
                          ? "text-green-600 dark:text-green-400 line-through opacity-70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {completedExercises.includes(exercise.id) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : index === currentExerciseIndex ? (
                        <Timer className="h-4 w-4 text-secondary animate-pulse flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                      )}
                      <span className="mr-1">{exercise.icon}</span>
                      <span className="flex-1">{exercise.name}</span>
                      <span className="text-xs opacity-60">{exercise.duration}s</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Exercise Preview */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-center">Exercícios desta sessão:</h4>
                  {exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border"
                    >
                      <span className="text-2xl">{exercise.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">{exercise.description}</p>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">
                        {exercise.duration}s
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total Time */}
                <p className="text-center text-sm text-muted-foreground">
                  Tempo total: ~{Math.ceil(exercises.reduce((acc, e) => acc + e.duration, 0) / 60)} min
                </p>

                {/* Start Button */}
                <Button onClick={startSession} className="w-full gradient-primary gap-2">
                  <Play className="h-4 w-4" />
                  Iniciar Sessão
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legal Disclaimer */}
          <p className="text-[10px] text-muted-foreground/70 text-center leading-tight">
            ⚖️ As orientações do OfficeWell têm caráter educativo e não substituem avaliação médica ou fisioterapêutica.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};