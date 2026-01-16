import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ReminderConfig } from "@/hooks/useReminders";
import { Volume2, VolumeX } from "lucide-react";

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
  const [soundEnabled, setSoundEnabled] = useState(config.soundEnabled ?? true);

  // Sync state when config changes
  useEffect(() => {
    setEyeInterval(config.eyeInterval);
    setStretchInterval(config.stretchInterval);
    setWaterInterval(config.waterInterval);
    setSoundEnabled(config.soundEnabled ?? true);
  }, [config]);

  const handleSave = () => {
    onSave({
      eyeInterval,
      stretchInterval,
      waterInterval,
      soundEnabled,
    });
    toast.success("Configurações salvas com sucesso!");
    onOpenChange(false);
  };

  const testSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.5, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.3);
        toast.info("🔊 Teste de som reproduzido");
      }
    } catch {
      toast.error("Som não disponível neste dispositivo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurações de Lembretes</DialogTitle>
          <DialogDescription>
            Personalize os intervalos e notificações
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Configuração de Som */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-primary" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="sound" className="text-base font-medium">Som de Notificação</Label>
                  <p className="text-xs text-muted-foreground">
                    Tocar som quando o timer acabar
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {soundEnabled && (
                  <Button variant="ghost" size="sm" onClick={testSound}>
                    Testar
                  </Button>
                )}
                <Switch
                  id="sound"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </div>

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
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
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
