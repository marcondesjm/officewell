import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, Coffee, Briefcase, Moon } from "lucide-react";
import { toast } from "sonner";
import { WorkSchedule } from "@/hooks/useWorkSchedule";

interface WorkScheduleSetupProps {
  open: boolean;
  onSave: (schedule: Partial<WorkSchedule>) => void;
  currentSchedule: WorkSchedule;
}

export const WorkScheduleSetup = ({ open, onSave, currentSchedule }: WorkScheduleSetupProps) => {
  const [startTime, setStartTime] = useState(currentSchedule.startTime);
  const [lunchStart, setLunchStart] = useState(currentSchedule.lunchStart);
  const [lunchDuration, setLunchDuration] = useState<string>(String(currentSchedule.lunchDuration));
  const [endTime, setEndTime] = useState(currentSchedule.endTime);

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

    onSave({
      startTime,
      lunchStart,
      lunchDuration: Number(lunchDuration),
      endTime,
      isConfigured: true,
    });

    toast.success("Horário de trabalho configurado!");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
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
            <p className="font-medium text-foreground mb-1">📋 Resumo do Expediente:</p>
            <p>• Trabalho: {startTime} às {lunchStart}</p>
            <p>• Almoço: {lunchDuration === "60" ? "1 hora" : "2 horas"}</p>
            <p>• Retorno e saída: até {endTime}</p>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full h-12 text-base gradient-primary">
          Salvar Configuração
        </Button>
      </DialogContent>
    </Dialog>
  );
};
