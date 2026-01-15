import { Eye, Dumbbell, Droplets, TrendingUp, Calendar, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatsData {
  today: { eye: number; stretch: number; water: number };
  week: { eye: number; stretch: number; water: number };
  total: { eye: number; stretch: number; water: number };
}

interface ReminderStatsCardProps {
  stats: StatsData;
}

const StatItem = ({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  bgColor 
}: { 
  icon: typeof Eye; 
  label: string; 
  value: number; 
  color: string; 
  bgColor: string;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card/80 transition-colors">
    <div className={`p-2 rounded-lg ${bgColor}`}>
      <Icon size={18} className={color} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

export const ReminderStatsCard = ({ stats }: ReminderStatsCardProps) => {
  const todayTotal = stats.today.eye + stats.today.stretch + stats.today.water;
  const weekTotal = stats.week.eye + stats.week.stretch + stats.week.water;

  return (
    <Card className="p-5 md:p-6 glass-strong shadow-card border-0 animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Estatísticas</h2>
          </div>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar size={14} />
              Hoje ({todayTotal})
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center gap-2">
              <CalendarDays size={14} />
              Semana ({weekTotal})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-2 mt-0">
            <StatItem
              icon={Eye}
              label="Descanso Visual"
              value={stats.today.eye}
              color="text-primary"
              bgColor="bg-primary/10"
            />
            <StatItem
              icon={Dumbbell}
              label="Alongamentos"
              value={stats.today.stretch}
              color="text-secondary"
              bgColor="bg-secondary/10"
            />
            <StatItem
              icon={Droplets}
              label="Hidratação"
              value={stats.today.water}
              color="text-accent"
              bgColor="bg-accent/10"
            />
          </TabsContent>

          <TabsContent value="week" className="space-y-2 mt-0">
            <StatItem
              icon={Eye}
              label="Descanso Visual"
              value={stats.week.eye}
              color="text-primary"
              bgColor="bg-primary/10"
            />
            <StatItem
              icon={Dumbbell}
              label="Alongamentos"
              value={stats.week.stretch}
              color="text-secondary"
              bgColor="bg-secondary/10"
            />
            <StatItem
              icon={Droplets}
              label="Hidratação"
              value={stats.week.water}
              color="text-accent"
              bgColor="bg-accent/10"
            />
          </TabsContent>
        </Tabs>

        {todayTotal === 0 && (
          <p className="text-center text-sm text-muted-foreground py-2">
            Complete lembretes para ver suas estatísticas! 🎯
          </p>
        )}
      </div>
    </Card>
  );
};
