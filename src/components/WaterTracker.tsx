import { Droplets, Plus, Minus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const WaterTracker = () => {
  const [waterCount, setWaterCount] = useState(() => {
    const saved = localStorage.getItem("waterCount");
    const date = localStorage.getItem("waterDate");
    const today = new Date().toDateString();
    
    // Reset se for um novo dia
    if (date !== today) {
      localStorage.setItem("waterDate", today);
      localStorage.setItem("waterCount", "0");
      return 0;
    }
    
    return saved ? Number(saved) : 0;
  });
  
  const dailyGoal = 8;

  useEffect(() => {
    localStorage.setItem("waterCount", String(waterCount));
  }, [waterCount]);

  const addWater = () => {
    const newCount = Math.min(waterCount + 1, dailyGoal);
    setWaterCount(newCount);
    
    if (newCount === dailyGoal) {
      toast.success("🎉 Parabéns! Meta diária de água alcançada!");
    } else {
      toast.success("💧 Copo de água adicionado!");
    }
  };

  const removeWater = () => {
    setWaterCount(prev => Math.max(prev - 1, 0));
  };

  const percentage = (waterCount / dailyGoal) * 100;
  const isComplete = waterCount >= dailyGoal;

  // Generate water drops for visual representation
  const drops = Array.from({ length: dailyGoal }, (_, i) => i < waterCount);

  return (
    <Card className={`
      relative overflow-hidden p-6 md:p-8
      glass-strong shadow-card border-0
      animate-fade-in
      ${isComplete ? 'ring-2 ring-accent/50' : ''}
    `}>
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className={`
              p-4 rounded-2xl shadow-lg
              ${isComplete 
                ? 'bg-gradient-to-br from-accent to-primary animate-glow' 
                : 'bg-gradient-to-br from-primary to-accent'
              }
            `}>
              {isComplete ? (
                <Trophy size={28} className="text-white" />
              ) : (
                <Droplets size={28} className="text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground">Hidratação Diária</h3>
              <p className="text-sm text-muted-foreground">
                {isComplete ? 'Meta alcançada! 🎉' : `Meta: ${dailyGoal} copos por dia`}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold text-gradient tabular-nums">
              {waterCount}
              <span className="text-muted-foreground text-2xl font-normal">/{dailyGoal}</span>
            </div>
          </div>
        </div>

        {/* Visual water drops */}
        <div className="flex justify-center gap-2 mb-6">
          {drops.map((filled, index) => (
            <div
              key={index}
              className={`
                w-8 h-10 rounded-full rounded-tl-sm transition-all duration-500
                ${filled 
                  ? 'bg-gradient-to-b from-primary to-accent shadow-lg scale-100' 
                  : 'bg-muted/50 scale-90'
                }
              `}
              style={{ 
                transitionDelay: `${index * 50}ms`,
                transform: filled ? 'scale(1)' : 'scale(0.9)'
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full h-4 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full gradient-primary rounded-full transition-all duration-700 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full" />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2 font-medium">
            {Math.round(percentage)}% da meta diária
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={removeWater}
            variant="outline"
            size="lg"
            className="h-14 w-14 rounded-2xl border-2 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all duration-300 hover:scale-105"
            disabled={waterCount === 0}
          >
            <Minus size={24} />
          </Button>
          <Button 
            onClick={addWater}
            size="lg"
            className={`
              flex-1 h-14 rounded-2xl font-semibold text-base
              transition-all duration-300 hover:scale-[1.02]
              ${isComplete 
                ? 'bg-accent hover:bg-accent/90' 
                : 'gradient-primary hover:opacity-90'
              }
              shadow-lg hover:shadow-xl
            `}
            disabled={waterCount >= dailyGoal}
          >
            <Plus size={22} className="mr-2" />
            {isComplete ? 'Meta Concluída!' : 'Bebi água'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
