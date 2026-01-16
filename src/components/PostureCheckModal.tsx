import { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePostureDetection } from "@/hooks/usePostureDetection";
import { 
  Camera, 
  CameraOff, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Loader2,
  Info,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PostureCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostureCheckModal = ({ open, onOpenChange }: PostureCheckModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    isMonitoring,
    isLoading,
    lastResult,
    cameraPermission,
    badPostureDuration,
    showAlert,
    startMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    stopMonitoring,
    dismissAlert,
    config,
  } = usePostureDetection();

  // Parar monitoramento quando o modal fechar
  useEffect(() => {
    if (!open && isMonitoring) {
      stopMonitoring();
    }
  }, [open, isMonitoring, stopMonitoring]);

  const handleStartMonitoring = async () => {
    if (videoRef.current) {
      await startMonitoring(videoRef.current);
    }
  };

  const handleClose = () => {
    stopMonitoring();
    onOpenChange(false);
  };

  // Calcular progresso do alerta
  const alertProgress = Math.min((badPostureDuration / config.BAD_POSTURE_ALERT_DELAY) * 100, 100);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Monitoramento de Postura em Tempo Real
          </DialogTitle>
          <DialogDescription>
            Análise contínua da sua postura durante o trabalho
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 flex-1 overflow-auto">
          {/* Aviso de Privacidade */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-600 dark:text-green-400">
                Privacidade Garantida
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                O monitoramento utiliza a câmera apenas para análise em tempo real. 
                <strong> Nenhuma imagem ou vídeo é armazenado ou enviado para servidores.</strong>
              </p>
            </div>
          </div>

          {/* Área da Câmera */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-muted">
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
            />
            
            {/* Overlay quando câmera não está ativa */}
            {!isMonitoring && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/90 backdrop-blur-sm">
                {cameraPermission === 'denied' ? (
                  <>
                    <CameraOff className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground text-center px-4">
                      Câmera bloqueada. Verifique as permissões do navegador.
                    </p>
                  </>
                ) : (
                  <>
                    <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground text-center px-4 mb-2">
                      Clique em "Iniciar Monitoramento" para começar
                    </p>
                    <p className="text-xs text-muted-foreground/70 text-center px-8">
                      Posicione-se de frente para a câmera como se estivesse trabalhando normalmente
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Guia visual de posição */}
            {isMonitoring && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Silhueta de referência */}
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                  {/* Guia do rosto */}
                  <ellipse 
                    cx="50" 
                    cy="35" 
                    rx="15" 
                    ry="18" 
                    fill="none" 
                    stroke={lastResult?.isGood ? "#22c55e" : lastResult ? "#f59e0b" : "#6366f1"}
                    strokeWidth="0.8"
                    strokeDasharray="3 2"
                    opacity="0.7"
                  />
                  
                  {/* Linha dos ombros */}
                  <line 
                    x1="25" 
                    y1="60" 
                    x2="75" 
                    y2="60" 
                    stroke={lastResult?.isGood ? "#22c55e" : lastResult ? "#f59e0b" : "#6366f1"}
                    strokeWidth="0.6"
                    strokeDasharray="3 2"
                    opacity="0.5"
                  />
                  
                  {/* Linha central vertical */}
                  <line 
                    x1="50" 
                    y1="20" 
                    x2="50" 
                    y2="80" 
                    stroke={lastResult?.isGood ? "#22c55e" : lastResult ? "#f59e0b" : "#6366f1"}
                    strokeWidth="0.4"
                    strokeDasharray="2 3"
                    opacity="0.3"
                  />
                </svg>
                
                {/* Indicador de status */}
                <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                  lastResult?.isGood 
                    ? 'bg-green-500/90 text-white' 
                    : lastResult 
                      ? 'bg-amber-500/90 text-white' 
                      : 'bg-primary/90 text-white'
                }`}>
                  {lastResult?.isGood ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Postura OK
                    </>
                  ) : lastResult ? (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      Ajuste necessário
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analisando...
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Loading overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium">Iniciando câmera...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Barra de progresso para alerta */}
          {isMonitoring && badPostureDuration > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Postura incorreta detectada
                </span>
                <span className="text-muted-foreground">
                  {Math.ceil((config.BAD_POSTURE_ALERT_DELAY - badPostureDuration) / 1000)}s para alerta
                </span>
              </div>
              <Progress value={alertProgress} className="h-2" />
            </div>
          )}

          {/* Alerta ativo */}
          <AnimatePresence>
            {showAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        ⚠️ Atenção à postura!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lastResult?.message || "Sua postura está incorreta há mais de 12 segundos. Ajuste sua coluna."}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={dismissAlert}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resultado da análise */}
          {lastResult && !showAlert && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                lastResult.isGood 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-amber-500/10 border-amber-500/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {lastResult.isGood ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    lastResult.isGood ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {lastResult.isGood ? 'Postura Correta' : 'Ajuste Recomendado'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lastResult.message}
                  </p>
                  {lastResult.isGood && (
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      🧍 Endireite a coluna e relaxe os ombros para evitar sobrecarga.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Dicas quando monitorando */}
          {isMonitoring && (
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <span>📍</span>
                <span>Fique de frente para a câmera</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <span>💡</span>
                <span>Boa iluminação ajuda</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <span>🪑</span>
                <span>Sente-se naturalmente</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <span>⏱️</span>
                <span>Análise a cada 3s</span>
              </div>
            </div>
          )}

          {/* Aviso legal */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Este recurso tem caráter educativo e preventivo, não substituindo avaliação médica ou fisioterapêutica.
            </p>
          </div>
        </div>

        {/* Botões de controle */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Fechar
          </Button>
          
          {!isMonitoring && !isLoading && (
            <Button 
              onClick={handleStartMonitoring} 
              className="flex-1 gradient-primary"
              disabled={cameraPermission === 'denied'}
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Monitoramento
            </Button>
          )}
          
          {isMonitoring && (
            <Button 
              onClick={pauseMonitoring} 
              variant="secondary"
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          )}
          
          {!isMonitoring && !isLoading && cameraPermission === 'granted' && (
            <Button 
              onClick={resumeMonitoring} 
              className="flex-1 gradient-primary"
            >
              <Play className="h-4 w-4 mr-2" />
              Retomar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
