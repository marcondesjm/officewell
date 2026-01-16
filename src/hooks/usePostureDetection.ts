import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface PostureResult {
  isGood: boolean;
  headForwardAngle: number;
  shoulderTilt: number;
  issues: string[];
  message: string;
  confidence: number;
}

interface FacePosition {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

// Configurações de detecção
const CONFIG = {
  // Limites de ângulo (graus)
  HEAD_FORWARD_THRESHOLD: 25, // Cabeça inclinada para frente
  SHOULDER_TILT_THRESHOLD: 10, // Ombros desnivelados
  
  // Tempo para alertar (ms)
  BAD_POSTURE_ALERT_DELAY: 12000, // 12 segundos de postura ruim
  
  // Intervalo de análise (ms)
  ANALYSIS_INTERVAL: 3000, // Analisar a cada 3 segundos
  
  // Cooldown entre alertas (ms)
  ALERT_COOLDOWN: 30000, // 30 segundos entre alertas
};

export const usePostureDetection = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<PostureResult | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [badPostureDuration, setBadPostureDuration] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const badPostureStartRef = useRef<number | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calcular ângulo de inclinação baseado na posição do rosto
  const calculatePostureFromFace = useCallback((face: FacePosition, frameWidth: number, frameHeight: number): PostureResult => {
    const issues: string[] = [];
    
    // Calcular desvio horizontal (inclinação lateral)
    const centerOffsetX = (face.centerX - frameWidth / 2) / frameWidth;
    const shoulderTilt = Math.abs(centerOffsetX) * 30; // Converter para graus aproximados
    
    // Calcular posição vertical (cabeça muito baixa = inclinada para frente)
    const expectedY = frameHeight * 0.35; // Posição ideal do rosto
    const yOffset = (face.centerY - expectedY) / frameHeight;
    const headForwardAngle = yOffset * 45; // Converter para graus aproximados
    
    // Verificar tamanho do rosto (muito pequeno = longe, muito grande = perto)
    const faceAreaRatio = (face.width * face.height) / (frameWidth * frameHeight);
    const isDistanceOk = faceAreaRatio > 0.02 && faceAreaRatio < 0.25;
    
    // Aplicar regras de postura
    if (headForwardAngle > CONFIG.HEAD_FORWARD_THRESHOLD) {
      issues.push("cabeça inclinada para frente");
    }
    
    if (headForwardAngle < -15) {
      issues.push("cabeça muito elevada");
    }
    
    if (shoulderTilt > CONFIG.SHOULDER_TILT_THRESHOLD) {
      issues.push(centerOffsetX > 0 ? "inclinado para a direita" : "inclinado para a esquerda");
    }
    
    if (!isDistanceOk) {
      if (faceAreaRatio < 0.02) {
        issues.push("muito longe da câmera");
      } else {
        issues.push("muito perto da câmera");
      }
    }
    
    const isGood = issues.length === 0;
    const confidence = isDistanceOk ? 0.85 : 0.5;
    
    let message: string;
    if (isGood) {
      message = "✅ Postura correta! Continue assim.";
    } else if (issues.length === 1) {
      message = `⚠️ Ajuste: ${issues[0]}.`;
    } else {
      message = `⚠️ Ajustes necessários: ${issues.join(", ")}.`;
    }
    
    return {
      isGood,
      headForwardAngle: Math.max(0, headForwardAngle),
      shoulderTilt,
      issues,
      message,
      confidence,
    };
  }, []);

  // Analisar frame atual
  const analyzeFrame = useCallback(async (): Promise<PostureResult | null> => {
    if (!videoRef.current || !streamRef.current) return null;
    
    const video = videoRef.current;
    
    // Criar canvas se não existir
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Capturar frame
    ctx.drawImage(video, 0, 0);
    
    try {
      // Tentar usar Face Detection API nativa (Chrome 94+)
      if ('FaceDetector' in window) {
        const faceDetector = new (window as any).FaceDetector({ fastMode: true });
        const faces = await faceDetector.detect(canvas);
        
        if (faces.length > 0) {
          const face = faces[0];
          const box = face.boundingBox;
          
          const facePosition: FacePosition = {
            centerX: box.x + box.width / 2,
            centerY: box.y + box.height / 2,
            width: box.width,
            height: box.height,
          };
          
          return calculatePostureFromFace(facePosition, canvas.width, canvas.height);
        }
      }
      
      // Fallback: análise básica por luminosidade (detectar região do rosto)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Encontrar centro de massa dos pixels claros (aproximação do rosto)
      let sumX = 0, sumY = 0, count = 0;
      const threshold = 120;
      
      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const i = (y * canvas.width + x) * 4;
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          if (brightness > threshold) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      }
      
      if (count > 100) {
        const centerX = sumX / count;
        const centerY = sumY / count;
        
        // Estimativa do tamanho do rosto baseado na distribuição
        const estimatedWidth = canvas.width * 0.25;
        const estimatedHeight = canvas.height * 0.3;
        
        const facePosition: FacePosition = {
          centerX,
          centerY,
          width: estimatedWidth,
          height: estimatedHeight,
        };
        
        const result = calculatePostureFromFace(facePosition, canvas.width, canvas.height);
        result.confidence = 0.6; // Menor confiança para fallback
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Erro na análise:', error);
      return null;
    }
  }, [calculatePostureFromFace]);

  // Loop de monitoramento
  const startMonitoringLoop = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    
    const runAnalysis = async () => {
      const result = await analyzeFrame();
      
      if (result) {
        setLastResult(result);
        
        const now = Date.now();
        
        if (!result.isGood) {
          // Postura ruim detectada
          if (!badPostureStartRef.current) {
            badPostureStartRef.current = now;
          }
          
          const duration = now - badPostureStartRef.current;
          setBadPostureDuration(duration);
          
          // Verificar se deve alertar
          if (duration >= CONFIG.BAD_POSTURE_ALERT_DELAY) {
            const timeSinceLastAlert = now - lastAlertTimeRef.current;
            
            if (timeSinceLastAlert >= CONFIG.ALERT_COOLDOWN) {
              setShowAlert(true);
              lastAlertTimeRef.current = now;
              
              // Notificação
              toast.warning("⚠️ Ajuste sua postura!", {
                description: result.message,
                duration: 8000,
              });
              
              // Vibrar
              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }
              
              // Resetar contador após alerta
              badPostureStartRef.current = now;
              setBadPostureDuration(0);
            }
          }
        } else {
          // Postura boa - resetar contadores
          badPostureStartRef.current = null;
          setBadPostureDuration(0);
          setShowAlert(false);
        }
      }
    };
    
    // Executar imediatamente
    runAnalysis();
    
    // Configurar intervalo
    analysisIntervalRef.current = setInterval(runAnalysis, CONFIG.ANALYSIS_INTERVAL);
  }, [analyzeFrame]);

  // Iniciar monitoramento
  const startMonitoring = useCallback(async (videoElement: HTMLVideoElement) => {
    setIsLoading(true);
    videoRef.current = videoElement;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      
      streamRef.current = stream;
      videoElement.srcObject = stream;
      await videoElement.play();
      
      setCameraPermission('granted');
      setIsMonitoring(true);
      setIsLoading(false);
      
      // Iniciar loop de análise
      startMonitoringLoop();
      
      toast.success("Monitoramento ativo", {
        description: "Mantenha-se na posição natural de trabalho",
      });
      
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setCameraPermission('denied');
      setIsLoading(false);
      
      toast.error("Câmera não disponível", {
        description: "Verifique as permissões do navegador",
      });
    }
  }, [startMonitoringLoop]);

  // Pausar monitoramento
  const pauseMonitoring = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    setIsMonitoring(false);
    badPostureStartRef.current = null;
    setBadPostureDuration(0);
    setShowAlert(false);
    
    toast.info("Monitoramento pausado");
  }, []);

  // Retomar monitoramento
  const resumeMonitoring = useCallback(() => {
    if (streamRef.current && videoRef.current) {
      setIsMonitoring(true);
      startMonitoringLoop();
      toast.success("Monitoramento retomado");
    }
  }, [startMonitoringLoop]);

  // Parar completamente
  const stopMonitoring = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsMonitoring(false);
    setLastResult(null);
    badPostureStartRef.current = null;
    setBadPostureDuration(0);
    setShowAlert(false);
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  // Resetar alerta
  const dismissAlert = useCallback(() => {
    setShowAlert(false);
  }, []);

  return {
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
    config: CONFIG,
  };
};
