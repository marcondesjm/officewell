import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toggle } from "@/components/ui/toggle";
import { Clock, Coffee, Briefcase, Moon, Calendar, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { WorkSchedule, ExerciseProfile } from "@/hooks/useWorkSchedule";

interface WorkScheduleSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (schedule: Partial<WorkSchedule>) => void;
  currentSchedule: WorkSchedule;
}

const WEEKDAYS = [
  { value: 1, label: "Seg", fullLabel: "Segunda" },
  { value: 2, label: "Ter", fullLabel: "Terça" },
  { value: 3, label: "Qua", fullLabel: "Quarta" },
  { value: 4, label: "Qui", fullLabel: "Quinta" },
  { value: 5, label: "Sex", fullLabel: "Sexta" },
  { value: 6, label: "Sáb", fullLabel: "Sábado" },
  { value: 0, label: "Dom", fullLabel: "Domingo" },
];

const EXERCISE_OPTIONS: { value: ExerciseProfile; label: string; description: string }[] = [
  { value: "none", label: "Sedentário", description: "Não pratico exercícios regularmente" },
  { value: "light", label: "Leve", description: "Caminhadas ou atividades 1-2x por semana" },
  { value: "moderate", label: "Moderado", description: "Academia ou esportes 3-4x por semana" },
  { value: "intense", label: "Intenso", description: "Treino intenso 5+ vezes por semana" },
];

export const WorkScheduleSetup = ({ open, onOpenChange, onSave, currentSchedule }: WorkScheduleSetupProps) => {
  const [startTime, setStartTime] = useState(currentSchedule.startTime);
  const [lunchStart, setLunchStart] = useState(currentSchedule.lunchStart);
  const [lunchDuration, setLunchDuration] = useState<string>(String(currentSchedule.lunchDuration));
  const [endTime, setEndTime] = useState(currentSchedule.endTime);
  const [workDays, setWorkDays] = useState<number[]>(currentSchedule.workDays || [1, 2, 3, 4, 5]);
  const [exerciseProfile, setExerciseProfile] = useState<ExerciseProfile>(currentSchedule.exerciseProfile || "none");

  const toggleWorkDay = (day: number) => {
    setWorkDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = () => {
    // Validate times
    const [startH] = startTime.split(":").map(Number);
    const [lunchH] = lunchStart.split(":").map(Number);
    const [endH] = endTime.split(":").map(Number);

    if (startH >= lunchH) {
      toast.error("O horário de almoço deve ser depois do início");
      return;
    }

    const lunchEndH = lunchH + Math.floor(Number(lunchDuration) / 60);
    if (lunchEndH >= endH) {
      toast.error("O horário de saída deve ser depois do fim do almoço");
      return;
    }

    if (workDays.length === 0) {
      toast.error("Selecione pelo menos um dia de trabalho");
      return;
    }

    onSave({
      startTime,
      lunchStart,
      lunchDuration: Number(lunchDuration),
      endTime,
      workDays,
      exerciseProfile,
      isConfigured: true,
    });

    toast.success("Configuração salva!", {
      description: exerciseProfile !== "none" 
        ? "Os alertas foram ajustados ao seu perfil ativo!" 
        : "Os alertas serão otimizados para sedentários.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="h-5 w-5 text-primary" />
            Configure seu Expediente
          </DialogTitle>
          <DialogDescription>
            Os alertas de saúde funcionarão apenas durante seu horário de trabalho.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Start Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Clock className="h-4 w-4 text-primary" />
              Horário de Início
            </Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="text-lg h-12"
            />
          </div>

          {/* Lunch Start */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Coffee className="h-4 w-4 text-secondary" />
              Início do Almoço
            </Label>
            <Input
              type="time"
              value={lunchStart}
              onChange={(e) => setLunchStart(e.target.value)}
              className="text-lg h-12"
            />
          </div>

          {/* Lunch Duration */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Duração do Almoço</Label>
            <RadioGroup
              value={lunchDuration}
              onValueChange={setLunchDuration}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="60" id="lunch-60" />
                <Label htmlFor="lunch-60" className="cursor-pointer">1 hora</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="120" id="lunch-120" />
                <Label htmlFor="lunch-120" className="cursor-pointer">2 horas</Label>
              </div>
          </RadioGroup>
          </div>

          {/* Work Days Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              Dias de Trabalho
            </Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <Toggle
                  key={day.value}
                  pressed={workDays.includes(day.value)}
                  onPressedChange={() => toggleWorkDay(day.value)}
                  variant="outline"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 py-2 min-w-[48px]"
                  aria-label={day.fullLabel}
                >
                  {day.label}
                </Toggle>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Alertas funcionarão apenas nos dias selecionados
            </p>
          </div>

          {/* Exercise Profile */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Dumbbell className="h-4 w-4 text-secondary" />
              Prática de Exercícios
            </Label>
            <RadioGroup
              value={exerciseProfile}
              onValueChange={(value) => setExerciseProfile(value as ExerciseProfile)}
              className="space-y-2"
            >
              {EXERCISE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                    exerciseProfile === option.value 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`exercise-${option.value}`} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={`exercise-${option.value}`} className="cursor-pointer font-medium">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Seu nível de atividade física ajusta as recomendações de pausas e alertas
            </p>
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Moon className="h-4 w-4 text-accent" />
              Horário de Saída
            </Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="text-lg h-12"
            />
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">📋 Resumo da Configuração:</p>
            <p>• Trabalho: {startTime} às {lunchStart}</p>
            <p>• Almoço: {lunchDuration === "60" ? "1 hora" : "2 horas"}</p>
            <p>• Retorno e saída: até {endTime}</p>
            <p>• Dias: {WEEKDAYS.filter(d => workDays.includes(d.value)).map(d => d.label).join(", ") || "Nenhum"}</p>
            <p>• Perfil: {EXERCISE_OPTIONS.find(e => e.value === exerciseProfile)?.label || "Sedentário"}</p>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full h-12 text-base gradient-primary">
          Salvar Configuração
        </Button>
      </DialogContent>
    </Dialog>
  );
};
