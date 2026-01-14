import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

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

  const variantStyles = {
    primary: {
      card: "from-primary/5 via-primary/10 to-secondary/5",
      border: "border-primary/30 hover:border-primary/50",
      icon: "from-primary to-secondary",
      text: "text-primary",
      progress: "gradient-primary",
      glow: "group-hover:shadow-[0_0_40px_hsl(220_90%_56%/0.3)]",
    },
    secondary: {
      card: "from-secondary/5 via-secondary/10 to-primary/5",
      border: "border-secondary/30 hover:border-secondary/50",
      icon: "from-secondary to-primary",
      text: "text-secondary",
      progress: "gradient-accent",
      glow: "group-hover:shadow-[0_0_40px_hsl(280_70%_60%/0.3)]",
    },
    accent: {
      card: "from-accent/5 via-accent/10 to-primary/5",
      border: "border-accent/30 hover:border-accent/50",
      icon: "from-accent to-primary",
      text: "text-accent",
      progress: "gradient-secondary",
      glow: "group-hover:shadow-[0_0_40px_hsl(160_80%_45%/0.3)]",
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
      
      <div className="relative space-y-5">
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
