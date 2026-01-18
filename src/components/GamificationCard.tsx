import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Flame, 
  Star, 
  ChevronDown, 
  ChevronUp,
  Target,
  Zap,
  Award
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { motion, AnimatePresence } from "framer-motion";

export const GamificationCard = () => {
  const [expanded, setExpanded] = useState(false);
  const { 
    stats, 
    ranks,
    getCurrentRank, 
    getNextRank, 
    getProgressToNextRank,
    pointsConfig 
  } = useGamification();

  const currentRank = getCurrentRank();
  const nextRank = getNextRank();
  const progress = getProgressToNextRank();
  const pointsToNext = nextRank ? nextRank.minPoints - stats.totalPoints : 0;

  return (
    <Card className="glass-card overflow-hidden">
      {/* Main Card */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="text-4xl"
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {currentRank.icon}
            </motion.div>
            <div>
              <h3 className={`font-bold text-lg ${currentRank.color}`}>
                {currentRank.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {stats.totalPoints.toLocaleString()} pontos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent-light text-accent">
                <Flame className="h-4 w-4" />
                <span className="font-bold text-sm">{stats.currentStreak}</span>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress to next rank */}
        {nextRank && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Próximo: {nextRank.icon} {nextRank.name}</span>
              <span>{pointsToNext} pts restantes</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t bg-muted/30"
          >
            <div className="p-4 space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary-light border border-primary/20">
                  <div className="flex items-center gap-2 text-primary">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-medium">Atividades</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.activitiesCompleted}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-accent-light border border-accent/20">
                  <div className="flex items-center gap-2 text-accent">
                    <Flame className="h-4 w-4" />
                    <span className="text-xs font-medium">Maior Sequência</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.longestStreak} dias</p>
                </div>

                <div className="p-3 rounded-lg bg-success-light border border-success/20">
                  <div className="flex items-center gap-2 text-success">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-medium">Sessões Diárias</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.dailySessionsCompleted}</p>
                </div>

                <div className="p-3 rounded-lg bg-secondary-light border border-secondary/20">
                  <div className="flex items-center gap-2 text-secondary">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-medium">Verificações Postura</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.postureChecksCompleted}</p>
                </div>
              </div>

              {/* Activity Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Pausas Completadas
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <p className="text-lg font-bold">{stats.stretchBreaksCompleted}</p>
                    <p className="text-xs text-muted-foreground">Alongamentos</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/20">
                    <p className="text-lg font-bold">{stats.eyeBreaksCompleted}</p>
                    <p className="text-xs text-muted-foreground">Descanso Visual</p>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/20">
                    <p className="text-lg font-bold">{stats.waterBreaksCompleted}</p>
                    <p className="text-xs text-muted-foreground">Hidratação</p>
                  </div>
                </div>
              </div>

              {/* Points Info */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary-light to-secondary-light border border-primary/20">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" />
                  Pontos por Atividade
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Sessão Diária</span>
                    <span className="font-bold text-success">+{pointsConfig.daily_session}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alongamento</span>
                    <span className="font-bold text-secondary">+{pointsConfig.stretch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Descanso Visual</span>
                    <span className="font-bold text-primary">+{pointsConfig.eye}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hidratação</span>
                    <span className="font-bold text-info">+{pointsConfig.water}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span>Bônus por dia de sequência</span>
                    <span className="font-bold text-accent">+{pointsConfig.streak_bonus}/dia</span>
                  </div>
                </div>
              </div>

              {/* All Ranks */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Todos os Ranks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {ranks.map((rank) => (
                    <div 
                      key={rank.id}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                        rank.id === currentRank.id 
                          ? "bg-primary/20 border-2 border-primary/50" 
                          : stats.totalPoints >= rank.minPoints
                          ? "bg-green-500/10 opacity-80"
                          : "bg-muted/50 opacity-50"
                      }`}
                    >
                      <span className="text-xl">{rank.icon}</span>
                      <div>
                        <p className={`font-semibold ${rank.color}`}>{rank.name}</p>
                        <p className="text-muted-foreground">{rank.minPoints}+ pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};