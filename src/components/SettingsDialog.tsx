import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ReminderConfig } from "@/hooks/useReminders";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ReminderConfig;
  onSave: (config: Partial<ReminderConfig>) => void;
}

export const SettingsDialog = ({
  open,
  onOpenChange,
  config,
  onSave,
}: SettingsDialogProps) => {
  const [eyeInterval, setEyeInterval] = useState(config.eyeInterval);
  const [stretchInterval, setStretchInterval] = useState(config.stretchInterval);
  const [waterInterval, setWaterInterval] = useState(config.waterInterval);

  const handleSave = () => {
    onSave({
      eyeInterval,
      stretchInterval,
      waterInterval,
    });
    toast.success("Configurações salvas com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Lembretes</DialogTitle>
          <DialogDescription>
            Personalize os intervalos dos seus lembretes em minutos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="eye">👁️ Descanso Visual (minutos)</Label>
            <Input
              id="eye"
              type="number"
              min="1"
              max="120"
              value={eyeInterval}
              onChange={(e) => setEyeInterval(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 20 minutos (regra 20-20-20)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stretch">🤸 Alongamento (minutos)</Label>
            <Input
              id="stretch"
              type="number"
              min="1"
              max="120"
              value={stretchInterval}
              onChange={(e) => setStretchInterval(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 45-60 minutos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="water">💧 Hidratação (minutos)</Label>
            <Input
              id="water"
              type="number"
              min="1"
              max="120"
              value={waterInterval}
              onChange={(e) => setWaterInterval(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 30 minutos
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 gradient-primary">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
