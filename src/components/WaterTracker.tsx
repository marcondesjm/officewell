import { Droplets, Plus, Minus } from "lucide-react";
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

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 shadow-soft animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-card text-primary">
          <Droplets size={28} />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Hidratação Diária</h3>
          <p className="text-sm text-muted-foreground">Meta: {dailyGoal} copos por dia</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-primary">{waterCount}</span>
          <span className="text-sm text-muted-foreground">de {dailyGoal} copos</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full gradient-primary transition-smooth rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={removeWater}
          variant="outline"
          size="icon"
          className="h-12 w-12 transition-smooth hover:scale-105"
          disabled={waterCount === 0}
        >
          <Minus size={20} />
        </Button>
        <Button 
          onClick={addWater}
          className="flex-1 h-12 gradient-primary hover:opacity-90 transition-smooth"
          disabled={waterCount >= dailyGoal}
        >
          <Plus size={20} className="mr-2" />
          Bebi água
        </Button>
      </div>
    </Card>
  );
};
