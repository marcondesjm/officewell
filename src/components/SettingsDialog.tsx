import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ReminderConfig, NotificationTone } from "@/hooks/useReminders";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Volume2, VolumeX, Volume1, Eye, Dumbbell, Droplet, Music, Bell, BellRing, Loader2, CheckCircle2, XCircle, Smartphone } from "lucide-react";

const TONE_OPTIONS: { value: NotificationTone; label: string; description: string }[] = [
  { value: 'soft-beep', label: '🔔 Beep Suave', description: 'Som suave e discreto' },
  { value: 'chime', label: '🎵 Sino', description: 'Melodia de sino harmoniosa' },
  { value: 'bell', label: '🛎️ Campainha', description: 'Som de campainha tradicional' },
  { value: 'digital', label: '📱 Digital', description: 'Tom eletrônico moderno' },
  { value: 'gentle', label: '🌸 Gentil', description: 'Som calmo e relaxante' },
  { value: 'alert', label: '⚡ Alerta', description: 'Tom mais chamativo' },
];

// Componente de ondas sonoras animadas
const SoundWaves = ({ volume, isAnimating }: { volume: number; isAnimating: boolean }) => {
  const bars = 5;
  const normalizedVolume = volume / 100;
  
  return (
    <div className="flex items-center justify-center gap-0.5 h-8 w-16">
      {Array.from({ length: bars }).map((_, i) => {
        const baseHeight = 0.3 + (i === Math.floor(bars / 2) ? 0.4 : (Math.abs(i - Math.floor(bars / 2)) < 2 ? 0.2 : 0));
        const maxHeight = baseHeight + normalizedVolume * (1 - baseHeight);
        
        return (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-primary"
            initial={{ height: 4 }}
            animate={{
              height: isAnimating 
                ? [4, maxHeight * 32, 8, maxHeight * 28, 4]
                : Math.max(4, normalizedVolume * 24),
              opacity: volume === 0 ? 0.3 : 1,
            }}
            transition={{
              duration: isAnimating ? 0.8 : 0.2,
              repeat: isAnimating ? Infinity : 0,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

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
  const {
    isSupported: isPushSupported,
    isSubscribed: isPushSubscribed,
    isLoading: isPushLoading,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush,
    testPushNotification,
  } = usePushNotifications();
  const [eyeInterval, setEyeInterval] = useState(config.eyeInterval);
  const [stretchInterval, setStretchInterval] = useState(config.stretchInterval);
  const [waterInterval, setWaterInterval] = useState(config.waterInterval);
  const [soundEnabled, setSoundEnabled] = useState(config.soundEnabled ?? true);
  const [soundVolume, setSoundVolume] = useState(config.soundVolume ?? 70);
  const [soundForEye, setSoundForEye] = useState(config.soundForEye ?? true);
  const [soundForStretch, setSoundForStretch] = useState(config.soundForStretch ?? true);
  const [soundForWater, setSoundForWater] = useState(config.soundForWater ?? true);
  const [notificationTone, setNotificationTone] = useState<NotificationTone>(config.notificationTone ?? 'soft-beep');
  const [notifyOnResume, setNotifyOnResume] = useState(config.notifyOnResume ?? false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [isAdjustingVolume, setIsAdjustingVolume] = useState(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    setNotificationTone(config.notificationTone ?? 'soft-beep');
    setNotifyOnResume(config.notifyOnResume ?? false);
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
      notificationTone,
      notifyOnResume,
    });
    toast.success("Configurações salvas com sucesso!");
    onOpenChange(false);
  };

  // Configurações de tons para teste
  const NOTIFICATION_TONES_CONFIG: Record<NotificationTone, { frequencies: number[]; durations: number[]; type: OscillatorType }> = {
    'soft-beep': { frequencies: [880, 1046, 1320], durations: [0.3, 0.3, 0.4], type: 'sine' },
    'chime': { frequencies: [523, 659, 784, 1047], durations: [0.4, 0.3, 0.3, 0.5], type: 'sine' },
    'bell': { frequencies: [440, 880, 1320], durations: [0.5, 0.4, 0.6], type: 'triangle' },
    'digital': { frequencies: [800, 1000, 800, 1200], durations: [0.15, 0.15, 0.15, 0.3], type: 'square' },
    'gentle': { frequencies: [392, 523, 659], durations: [0.6, 0.5, 0.7], type: 'sine' },
    'alert': { frequencies: [1000, 1200, 1000, 1400], durations: [0.2, 0.2, 0.2, 0.4], type: 'sawtooth' }
  };

  const testSound = (toneToTest?: NotificationTone) => {
    const toneKey = toneToTest || notificationTone;
    const tone = NOTIFICATION_TONES_CONFIG[toneKey];
    
    setIsPlayingSound(true);
    
    try {
      const volume = soundVolume / 100;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        
        let delay = 0;
        let totalDuration = 0;
        tone.frequencies.forEach((freq, index) => {
          const duration = tone.durations[index] || 0.3;
          totalDuration += duration * 1000;
          
          setTimeout(() => {
            try {
              const osc = audioContext.createOscillator();
              const gain = audioContext.createGain();
              osc.connect(gain);
              gain.connect(audioContext.destination);
              osc.frequency.value = freq;
              osc.type = tone.type;
              gain.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
              osc.start(audioContext.currentTime);
              osc.stop(audioContext.currentTime + duration);
            } catch {}
          }, delay);
          
          delay += duration * 1000;
        });
        
        // Parar animação após o som terminar
        setTimeout(() => {
          setIsPlayingSound(false);
        }, totalDuration + 200);
        
        const toneName = TONE_OPTIONS.find(t => t.value === toneKey)?.label || 'Som';
        toast.info(`🔊 ${toneName} (${soundVolume}%)`);
      }
    } catch {
      setIsPlayingSound(false);
      toast.error("Som não disponível neste dispositivo");
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setSoundVolume(value[0]);
    setIsAdjustingVolume(true);
    
    // Limpar timeout anterior
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    
    // Parar animação após 500ms sem ajuste
    volumeTimeoutRef.current = setTimeout(() => {
      setIsAdjustingVolume(false);
    }, 500);
  };

  const getVolumeIcon = () => {
    if (!soundEnabled || soundVolume === 0) return <VolumeX className="h-5 w-5 text-muted-foreground" />;
    if (soundVolume < 50) return <Volume1 className="h-5 w-5 text-primary" />;
    return <Volume2 className="h-5 w-5 text-primary" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Configurações de Lembretes</DialogTitle>
          <DialogDescription>
            Personalize os intervalos e notificações
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden -mx-6">
          <ScrollArea className="h-full max-h-[55vh] px-6">
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
                    <Button variant="ghost" size="sm" onClick={() => testSound()}>
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

              {/* Seleção de Tom */}
              {soundEnabled && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-primary" />
                    <Label className="text-sm">Tom de Notificação</Label>
                  </div>
                  <Select value={notificationTone} onValueChange={(value: NotificationTone) => setNotificationTone(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um tom" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          <div className="flex flex-col">
                            <span>{tone.label}</span>
                            <span className="text-xs text-muted-foreground">{tone.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((tone) => (
                      <Button
                        key={tone.value}
                        variant={notificationTone === tone.value ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setNotificationTone(tone.value);
                          testSound(tone.value);
                        }}
                      >
                        {tone.label.split(' ')[0]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Controle de Volume */}
              {soundEnabled && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Volume</Label>
                    <div className="flex items-center gap-3">
                      <AnimatePresence>
                        {(isAdjustingVolume || isPlayingSound) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <SoundWaves 
                              volume={soundVolume} 
                              isAnimating={isPlayingSound} 
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <motion.span 
                        className="text-sm font-medium text-primary min-w-[3rem] text-right"
                        animate={{ 
                          scale: isAdjustingVolume ? 1.1 : 1,
                          color: isAdjustingVolume ? 'hsl(var(--primary))' : 'hsl(var(--primary))'
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        {soundVolume}%
                      </motion.span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ 
                        scale: soundVolume === 0 ? 0.9 : 1,
                        opacity: soundVolume === 0 ? 0.5 : 1 
                      }}
                    >
                      {soundVolume === 0 ? (
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      ) : soundVolume < 50 ? (
                        <Volume1 className="h-4 w-4 text-primary" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-primary" />
                      )}
                    </motion.div>
                    <Slider
                      value={[soundVolume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      min={0}
                      step={5}
                      className="flex-1"
                    />
                  </div>

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

            {/* Push Notifications (Backend) */}
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isPushSubscribed ? (
                    <BellRing className="h-5 w-5 text-green-500" />
                  ) : (
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-medium">Notificações Push</Label>
                      <Badge variant="secondary" className="text-xs">
                        <Smartphone className="h-3 w-3 mr-1" />
                        Backend
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Receba lembretes mesmo com o app fechado
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPushLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : isPushSubscribed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {!isPushSupported ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Push notifications não são suportadas neste navegador.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {isPushSubscribed ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={testPushNotification}
                          disabled={isPushLoading}
                          className="flex-1"
                        >
                          🧪 Testar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={unsubscribeFromPush}
                          disabled={isPushLoading}
                          className="flex-1"
                        >
                          Desativar
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={subscribeToPush}
                        disabled={isPushLoading}
                        className="w-full gradient-primary"
                      >
                        {isPushLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Ativando...
                          </>
                        ) : (
                          <>
                            <BellRing className="h-4 w-4 mr-2" />
                            Ativar Push Notifications
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {isPushSubscribed && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✅ Você receberá notificações mesmo quando o app estiver fechado.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Opção de Notificação ao Retomar */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="notifyOnResume" className="text-base font-medium">Notificar ao Retomar</Label>
                    <p className="text-xs text-muted-foreground">
                      Mostrar lembretes perdidos ao abrir o app
                    </p>
                  </div>
                </div>
                <Switch
                  id="notifyOnResume"
                  checked={notifyOnResume}
                  onCheckedChange={setNotifyOnResume}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {notifyOnResume 
                  ? "✅ Ao reabrir o app, você verá os lembretes que expiraram enquanto estava fechado."
                  : "❌ Ao reabrir o app, os timers expirados serão reiniciados silenciosamente."
                }
              </p>
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
        </div>

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
