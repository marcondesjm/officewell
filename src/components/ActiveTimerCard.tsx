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

  const variantStyles = {
    primary: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
    secondary: "bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20",
    accent: "bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20",
  };

  const iconStyles = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
  };

  const progressColors = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
  };

  return (
    <Card className={`p-6 transition-smooth hover:shadow-glow ${variantStyles[variant]} border-2 animate-fade-in`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl bg-card ${iconStyles[variant]}`}>
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <div className={`text-2xl font-bold ${iconStyles[variant]} tabular-nums`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${progressColors[variant]} transition-smooth rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(percentage)}% completo
          </p>
        </div>
      </div>
    </Card>
  );
};
