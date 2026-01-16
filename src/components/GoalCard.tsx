import { Goal } from "@/hooks/useGoals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  Eye, 
  Dumbbell, 
  Activity, 
  ScanFace, 
  Brain,
  Settings2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: Goal;
  onUpdate: (goalId: string, updates: Partial<Goal>) => void;
  progressPercent: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'eye': Eye,
  'dumbbell': Dumbbell,
  'activity': Activity,
  'scan-face': ScanFace,
  'brain': Brain,
};

const getMotivationalMessage = (percent: number): string => {
  if (percent === 0) return "Vamos começar! 💪";
  if (percent < 25) return "Bom começo! Continue assim!";
  if (percent < 50) return "Você está no caminho certo!";
  if (percent < 75) return "Mais da metade! Excelente!";
  if (percent < 100) return "Quase lá! Você consegue! 🔥";
  return "🎉 Meta concluída! Parabéns!";
};

export const GoalCard = ({ goal, onUpdate, progressPercent }: GoalCardProps) => {
  const [editTarget, setEditTarget] = useState(goal.target.toString());
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const Icon = iconMap[goal.icon] || Activity;
  const isCompleted = progressPercent >= 100;
  
  const handleSaveTarget = () => {
    const newTarget = parseFloat(editTarget);
    if (!isNaN(newTarget) && newTarget > 0) {
      onUpdate(goal.id, { target: newTarget });
      setDialogOpen(false);
    }
  };

  const getUnitLabel = () => {
    switch (goal.unit) {
      case 'hours': return goal.target === 1 ? 'hora' : 'horas';
      case 'minutes': return goal.target === 1 ? 'minuto' : 'minutos';
      case 'times': return goal.target === 1 ? 'vez' : 'vezes';
      default: return '';
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg border-2",
      isCompleted 
        ? "border-green-500/50 bg-gradient-to-br from-green-500/5 to-emerald-500/10" 
        : "border-transparent hover:border-primary/20",
      !goal.enabled && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl transition-colors",
              isCompleted 
                ? "bg-green-500/20 text-green-600" 
                : "bg-primary/10 text-primary"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Icon className="h-6 w-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {goal.name}
                {isCompleted && <Sparkles className="h-4 w-4 text-yellow-500" />}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {goal.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Meta: {goal.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-target">
                      Meta diária ({getUnitLabel()} por dia)
                    </Label>
                    <Input
                      id="goal-target"
                      type="number"
                      min="1"
                      step={goal.unit === 'hours' ? '0.5' : '1'}
                      value={editTarget}
                      onChange={(e) => setEditTarget(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSaveTarget}>Salvar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Switch
              checked={goal.enabled}
              onCheckedChange={(enabled) => onUpdate(goal.id, { enabled })}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Progress Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {goal.progress.toFixed(goal.unit === 'hours' ? 1 : 0)} / {goal.target} {getUnitLabel()}
          </span>
          <span className={cn(
            "font-semibold",
            isCompleted ? "text-green-600" : "text-primary"
          )}>
            {progressPercent.toFixed(0)}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <Progress 
          value={progressPercent} 
          className={cn(
            "h-3",
            isCompleted && "[&>div]:bg-green-500"
          )}
        />
        
        {/* Motivational Message */}
        <p className={cn(
          "text-xs text-center py-2 rounded-lg",
          isCompleted 
            ? "bg-green-500/10 text-green-700 dark:text-green-400" 
            : "bg-muted/50 text-muted-foreground"
        )}>
          {getMotivationalMessage(progressPercent)}
        </p>
      </CardContent>
    </Card>
  );
};
