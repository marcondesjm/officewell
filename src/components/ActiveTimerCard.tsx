import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";

const tips = {
  primary: [ // Descanso Visual
    "Olhe para um ponto distante por 20 segundos",
    "Pisque várias vezes para lubrificar os olhos",
    "Ajuste o brilho da tela para reduzir o cansaço",
    "A regra 20-20-20: a cada 20 min, olhe 20m por 20s",
    "Mantenha a tela a 50-70cm de distância dos olhos",
    "Prefira luz natural sempre que possível",
  ],
  secondary: [ // Alongamento
    "Gire os ombros para trás e para frente",
    "Alongue o pescoço inclinando a cabeça",
    "Levante os braços acima da cabeça e estique",
    "Faça rotação dos punhos para relaxar",
    "Levante-se e caminhe um pouco",
    "Alongue as costas girando o tronco",
  ],
  accent: [ // Hidratação
    "Beba água mesmo sem sentir sede",
    "Mantenha uma garrafa de água por perto",
    "A hidratação melhora a concentração",
    "Água ajuda a manter a pele saudável",
    "Evite bebidas muito açucaradas",
    "Chás e água com limão também contam!",
  ],
};

interface ActiveTimerCardProps {
  icon: LucideIcon;
  title: string;
  timeLeft: number;
  totalTime: number;
  variant: "primary" | "secondary" | "accent";
}

export const ActiveTimerCard = ({
  icon: Icon,
  title,
  timeLeft,
  totalTime,
  variant,
}: ActiveTimerCardProps) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = ((totalTime - timeLeft) / totalTime) * 100;
  const isAlmostDone = percentage >= 80;

  // Trocar dica a cada 10 segundos baseado no tempo restante
  const currentTip = useMemo(() => {
    const tipList = tips[variant];
    const tipIndex = Math.floor(timeLeft / 10) % tipList.length;
    return tipList[tipIndex];
  }, [Math.floor(timeLeft / 10), variant]);

  const variantStyles = {
    primary: {
      card: "from-primary-light via-primary/5 to-secondary-light",
      border: "border-primary/30 hover:border-primary/50",
      icon: "from-primary to-info",
      text: "text-primary",
      progress: "gradient-primary",
      glow: "group-hover:shadow-glow",
    },
    secondary: {
      card: "from-secondary-light via-secondary/5 to-success-light",
      border: "border-secondary/30 hover:border-secondary/50",
      icon: "from-secondary to-success",
      text: "text-secondary",
      progress: "gradient-secondary",
      glow: "group-hover:shadow-glow-secondary",
    },
    accent: {
      card: "from-accent-light via-accent/5 to-warning-light",
      border: "border-accent/30 hover:border-accent/50",
      icon: "from-accent to-warning",
      text: "text-accent",
      progress: "gradient-accent",
      glow: "group-hover:shadow-glow-accent",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card 
      className={`
        group relative overflow-hidden p-6 
        bg-gradient-to-br ${styles.card}
        border-2 ${styles.border}
        glass transition-all duration-500 ease-out
        hover-lift ${styles.glow}
        animate-fade-in
      `}
    >
      {/* Background decoration */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${styles.icon} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className="relative space-y-4">
        <div className="flex items-start gap-4">
          <div className={`
            relative p-4 rounded-2xl 
            bg-gradient-to-br ${styles.icon}
            shadow-lg
            ${isAlmostDone ? 'animate-pulse-soft' : ''}
          `}>
            <Icon size={28} className="text-white" />
            {isAlmostDone && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
            )}
          </div>
          
          <div className="flex-1 pt-1">
            <h3 className="font-semibold text-lg text-foreground/90">{title}</h3>
            <div className={`text-4xl font-bold ${styles.text} tabular-nums tracking-tight mt-1`}>
              {String(minutes).padStart(2, '0')}
              <span className="opacity-50">:</span>
              {String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Dica animada */}
        <div className={`text-xs ${styles.text} bg-card/50 rounded-lg px-3 py-2 transition-all duration-500`}>
          <span className="opacity-70">💡</span>{" "}
          <span className="text-muted-foreground">{currentTip}</span>
        </div>
        
        <div className="space-y-2">
          <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className={`h-full ${styles.progress} rounded-full transition-all duration-1000 ease-out relative`}
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="font-medium">{Math.round(percentage)}% concluído</span>
            <span>
              {minutes > 0 ? `${minutes}min ` : ''}{seconds}s restantes
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
