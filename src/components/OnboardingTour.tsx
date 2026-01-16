import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Droplets,
  Activity,
  Eye,
  Target,
  Users,
  FileBarChart,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  PartyPopper,
  Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
  action?: {
    label: string;
    route?: string;
    onClick?: () => void;
  };
}

const TOUR_STORAGE_KEY = 'officewell_tour_completed';

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao OfficeWell! 🎉',
    description: 'Você está na conta demo com todas as funcionalidades liberadas por 7 dias. Vamos fazer um tour rápido pelas principais features!',
    icon: <Crown className="h-8 w-8" />,
  },
  {
    id: 'water',
    title: 'Lembretes de Hidratação',
    description: 'Receba lembretes inteligentes para beber água ao longo do dia. Mantenha-se hidratado e produtivo!',
    icon: <Droplets className="h-8 w-8" />,
    highlight: 'water-tracker',
  },
  {
    id: 'stretch',
    title: 'Pausas para Alongamento',
    description: 'Exercícios guiados para prevenir lesões e melhorar sua postura. Cuide do seu corpo durante o trabalho!',
    icon: <Activity className="h-8 w-8" />,
    highlight: 'stretch-card',
  },
  {
    id: 'eyes',
    title: 'Descanso Visual',
    description: 'Proteja sua visão com a técnica 20-20-20. A cada 20 minutos, olhe para algo a 20 pés de distância por 20 segundos.',
    icon: <Eye className="h-8 w-8" />,
    highlight: 'eye-card',
  },
  {
    id: 'goals',
    title: 'Metas Personalizadas',
    description: 'Defina metas de saúde e produtividade. Acompanhe seu progresso diário e receba notificações motivacionais!',
    icon: <Target className="h-8 w-8" />,
    action: {
      label: 'Ver Metas',
      route: '/metas',
    },
  },
  {
    id: 'hr',
    title: 'Painel RH Completo',
    description: 'Gerencie funcionários, aniversários e comunicados internos. Ferramenta completa para equipes de RH.',
    icon: <Users className="h-8 w-8" />,
    action: {
      label: 'Acessar Painel RH',
      route: '/rh',
    },
  },
  {
    id: 'reports',
    title: 'Relatórios de Compliance',
    description: 'Acompanhe a adesão da equipe às práticas de saúde. Gere relatórios detalhados para a diretoria.',
    icon: <FileBarChart className="h-8 w-8" />,
  },
  {
    id: 'finish',
    title: 'Você está pronto! 🚀',
    description: 'Explore todas as funcionalidades durante seus 7 dias de teste. Qualquer dúvida, estamos aqui para ajudar!',
    icon: <PartyPopper className="h-8 w-8" />,
  },
];

interface OnboardingTourProps {
  onComplete?: () => void;
}

export const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if tour was completed before
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    const isNewDemo = sessionStorage.getItem('officewell_new_demo');
    
    if (!tourCompleted && isNewDemo) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    sessionStorage.removeItem('officewell_new_demo');
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    sessionStorage.removeItem('officewell_new_demo');
    setIsOpen(false);
  };

  const handleAction = (step: TourStep) => {
    if (step.action?.route) {
      handleComplete();
      navigate(step.action.route);
    } else if (step.action?.onClick) {
      step.action.onClick();
    }
  };

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleSkip}
        />

        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="border-2 border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Header with progress */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Tour Guiado
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleSkip}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground">
                  {currentStep + 1}/{tourSteps.length}
                </span>
              </div>
            </div>

            <CardContent className="p-6 overflow-hidden">
              {/* Icon */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTourStep.id}
                  initial={{ opacity: 0, x: 30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    opacity: { duration: 0.3 }
                  }}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div 
                    className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mb-4"
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.1, 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 15 
                    }}
                  >
                    {currentTourStep.icon}
                  </motion.div>

                  <motion.h3 
                    className="text-xl font-bold mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                  >
                    {currentTourStep.title}
                  </motion.h3>

                  <motion.p 
                    className="text-muted-foreground mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    {currentTourStep.description}
                  </motion.p>

                  {/* Action button if available */}
                  {currentTourStep.action && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.3 }}
                    >
                      <Button
                        variant="outline"
                        className="mb-4"
                        onClick={() => handleAction(currentTourStep)}
                      >
                        {currentTourStep.action.label}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>

                {currentStep === tourSteps.length - 1 ? (
                  <Button
                    onClick={handleComplete}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                  >
                    Começar a usar!
                    <PartyPopper className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Próximo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Skip link */}
              <button
                onClick={handleSkip}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
              >
                Pular tour
              </button>
            </CardContent>
          </Card>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {tourSteps.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : index < currentStep
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-white/30'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to manually trigger tour
export const useTour = () => {
  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    sessionStorage.setItem('officewell_new_demo', 'true');
    window.location.reload();
  };

  const isTourCompleted = () => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  };

  return { resetTour, isTourCompleted };
};
