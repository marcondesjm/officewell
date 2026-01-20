import { useGoals } from "@/hooks/useGoals";
import { GoalCard } from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  ArrowLeft, 
  Target, 
  Trophy,
  Sparkles,
  Save,
  RotateCcw,
  Lock,
  Rocket
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { useState } from "react";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";

const Goals = () => {
  const navigate = useNavigate();
  const { 
    goals, 
    updateGoal, 
    getTotalProgress,
    resetDailyProgress 
  } = useGoals();
  const { features, currentPlan } = usePlanFeatures();
  const [plansOpen, setPlansOpen] = useState(false);

  const totalProgress = getTotalProgress();
  const completedGoals = goals.filter(g => g.enabled && (g.progress / g.target) >= 1).length;
  const totalEnabledGoals = goals.filter(g => g.enabled).length;

  const handleSave = () => {
    toast.success("Metas salvas com sucesso!", {
      description: "Suas configurações foram atualizadas.",
    });
  };

  const handleReset = () => {
    resetDailyProgress();
    toast.info("Progresso diário reiniciado", {
      description: "Todas as metas foram zeradas para hoje.",
    });
  };

  // Show locked state for non-Pro users
  if (!features.customGoals) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-decoration">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Target className="h-7 w-7 text-primary" />
                  Minhas Metas
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acompanhe seu progresso diário
                </p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          {/* Locked Content */}
          <Card className="border-2 border-blue-500/30 bg-blue-500/5">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Metas Personalizadas</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Defina metas diárias personalizadas para água, alongamento, pausas e mais. 
                Acompanhe seu progresso e mantenha-se motivado!
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                <div className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium">
                  📊 Progresso visual
                </div>
                <div className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium">
                  🎯 Metas customizáveis
                </div>
                <div className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium">
                  🏆 Conquistas diárias
                </div>
              </div>

              <Button onClick={() => setPlansOpen(true)} size="lg" className="gap-2">
                <Rocket className="h-5 w-5" />
                Fazer Upgrade para Pro
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                🎁 Teste grátis por 7 dias
              </p>
            </CardContent>
          </Card>

          <SubscriptionPlans
            open={plansOpen}
            onOpenChange={setPlansOpen}
            preSelectedPlan="pro"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-decoration">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Target className="h-7 w-7 text-primary" />
                Minhas Metas
              </h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe seu progresso diário
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Motivational Quote */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="py-4 px-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm md:text-base text-muted-foreground italic">
                "Defina metas que se adaptem à sua rotina. Pequenos hábitos geram grandes resultados."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Progresso Geral</h2>
                  <p className="text-sm text-muted-foreground">
                    {completedGoals} de {totalEnabledGoals} metas concluídas hoje
                  </p>
                </div>
              </div>
              <div className={cn(
                "text-3xl font-bold",
                totalProgress >= 100 ? "text-green-600" : "text-primary"
              )}>
                {totalProgress.toFixed(0)}%
              </div>
            </div>
            
            <Progress 
              value={totalProgress} 
              className={cn(
                "h-4",
                totalProgress >= 100 && "[&>div]:bg-green-500"
              )}
            />
            
            {totalProgress >= 100 && (
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg text-center">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  🎉 Parabéns! Você completou todas as suas metas de hoje!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdate={updateGoal}
              progressPercent={Math.min((goal.progress / goal.target) * 100, 100)}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleSave}
            size="lg"
            className="gap-2"
          >
            <Save className="h-5 w-5" />
            Salvar Metas
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Reiniciar Progresso
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Suas metas são salvas automaticamente no seu dispositivo.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Goals;
