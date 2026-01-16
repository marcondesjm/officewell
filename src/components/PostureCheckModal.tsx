import { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePostureDetection } from "@/hooks/usePostureDetection";
import { Camera, CameraOff, Scan, AlertTriangle, CheckCircle, Shield, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PostureCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostureCheckModal = ({ open, onOpenChange }: PostureCheckModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    isAnalyzing,
    isLoading,
    lastResult,
    cameraPermission,
    startAnalysis,
    captureAndAnalyze,
    stopCamera,
  } = usePostureDetection();

  // Parar câmera quando o modal fechar
  useEffect(() => {
    if (!open && isAnalyzing) {
      stopCamera();
    }
  }, [open, isAnalyzing, stopCamera]);

  const handleStartCamera = async () => {
    if (videoRef.current) {
      await startAnalysis(videoRef.current);
    }
  };

  const handleClose = () => {
    stopCamera();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Verificação de Postura
          </DialogTitle>
          <DialogDescription>
            Analise sua postura usando a câmera frontal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Aviso de Privacidade */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-600 dark:text-green-400">
                Processamento Local
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                A análise é feita apenas no seu dispositivo. Nenhuma imagem é gravada ou enviada para servidores.
              </p>
            </div>
          </div>

          {/* Área da Câmera */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
            />
            
            {!isAnalyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm">
                {cameraPermission === 'denied' ? (
                  <>
                    <CameraOff className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground text-center px-4">
                      Câmera bloqueada. Verifique as permissões do navegador.
                    </p>
                  </>
                ) : (
                  <>
                    <Camera className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Clique para ativar a câmera
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Guia de posicionamento */}
            {isAnalyzing && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Guia central */}
                  <ellipse 
                    cx="50" 
                    cy="40" 
                    rx="20" 
                    ry="25" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    className="text-primary/50"
                  />
                  {/* Linha horizontal dos ombros */}
                  <line 
                    x1="25" 
                    y1="70" 
                    x2="75" 
                    y2="70" 
                    stroke="currentColor" 
                    strokeWidth="0.3"
                    strokeDasharray="2 2"
                    className="text-primary/30"
                  />
                </svg>
              </div>
            )}

            {/* Loading overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Analisando postura...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Resultado */}
          <AnimatePresence mode="wait">
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
                  <div>
                    <p className={`font-medium ${
                      lastResult.isGood ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {lastResult.isGood ? 'Postura Correta' : 'Ajuste Necessário'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lastResult.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dicas */}
          {isAnalyzing && !lastResult && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📍 Posicione-se de frente para a câmera</p>
              <p>💡 Certifique-se de boa iluminação</p>
              <p>🪑 Sente-se naturalmente como trabalha</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!isAnalyzing ? (
            <>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Fechar
              </Button>
              <Button 
                onClick={handleStartCamera} 
                className="flex-1 gradient-primary"
                disabled={isLoading || cameraPermission === 'denied'}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                Ativar Câmera
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={stopCamera} className="flex-1">
                <CameraOff className="h-4 w-4 mr-2" />
                Desativar
              </Button>
              <Button 
                onClick={captureAndAnalyze} 
                className="flex-1 gradient-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Scan className="h-4 w-4 mr-2" />
                )}
                Analisar Postura
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
