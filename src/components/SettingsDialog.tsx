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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ReminderConfig } from "@/hooks/useReminders";
import { Volume2, VolumeX, Volume1, Eye, Dumbbell, Droplet } from "lucide-react";

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
  const [soundVolume, setSoundVolume] = useState(config.soundVolume ?? 70);
  const [soundForEye, setSoundForEye] = useState(config.soundForEye ?? true);
  const [soundForStretch, setSoundForStretch] = useState(config.soundForStretch ?? true);
  const [soundForWater, setSoundForWater] = useState(config.soundForWater ?? true);

  // Sync state when config changes
  useEffect(() => {
    setEyeInterval(config.eyeInterval);
    setStretchInterval(config.stretchInterval);
    setWaterInterval(config.waterInterval);
    setSoundEnabled(config.soundEnabled ?? true);
    setSoundVolume(config.soundVolume ?? 70);
    setSoundForEye(config.soundForEye ?? true);
    setSoundForStretch(config.soundForStretch ?? true);
    setSoundForWater(config.soundForWater ?? true);
  }, [config]);

  const handleSave = () => {
    onSave({
      eyeInterval,
      stretchInterval,
      waterInterval,
      soundEnabled,
      soundVolume,
      soundForEye,
      soundForStretch,
      soundForWater,
    });
    toast.success("Configurações salvas com sucesso!");
    onOpenChange(false);
  };

  const testSound = () => {
    try {
      const volume = soundVolume / 100;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.3);
        toast.info(`🔊 Teste de som (${soundVolume}%)`);
      }
    } catch {
      toast.error("Som não disponível neste dispositivo");
    }
  };

  const getVolumeIcon = () => {
    if (!soundEnabled || soundVolume === 0) return <VolumeX className="h-5 w-5 text-muted-foreground" />;
    if (soundVolume < 50) return <Volume1 className="h-5 w-5 text-primary" />;
    return <Volume2 className="h-5 w-5 text-primary" />;
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
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getVolumeIcon()}
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

              {/* Controle de Volume */}
              {soundEnabled && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Volume</Label>
                    <span className="text-sm font-medium text-primary">{soundVolume}%</span>
                  </div>
                  <Slider
                    value={[soundVolume]}
                    onValueChange={(value) => setSoundVolume(value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />

                  {/* Seleção de onde tocar o som */}
                  <div className="space-y-3 pt-3 border-t">
                    <Label className="text-sm text-muted-foreground">Tocar som para:</Label>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="soundForEye"
                        checked={soundForEye}
                        onCheckedChange={(checked) => setSoundForEye(checked as boolean)}
                      />
                      <label
                        htmlFor="soundForEye"
                        className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                        Descanso Visual
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="soundForStretch"
                        checked={soundForStretch}
                        onCheckedChange={(checked) => setSoundForStretch(checked as boolean)}
                      />
                      <label
                        htmlFor="soundForStretch"
                        className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer"
                      >
                        <Dumbbell className="h-4 w-4 text-green-500" />
                        Alongamento
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="soundForWater"
                        checked={soundForWater}
                        onCheckedChange={(checked) => setSoundForWater(checked as boolean)}
                      />
                      <label
                        htmlFor="soundForWater"
                        className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer"
                      >
                        <Droplet className="h-4 w-4 text-cyan-500" />
                        Hidratação
                      </label>
                    </div>
                  </div>
                </div>
              )}
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
