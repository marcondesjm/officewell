import { GamificationCard } from "@/components/GamificationCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { MonthlyAwardsCard } from "@/components/MonthlyAwardsCard";

export const GamificationSection = () => {
  return (
    <section className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Ranking & Conquistas</h2>
        <p className="text-muted-foreground mt-1">
          Acompanhe seu progresso e compare com outros usuários
        </p>
      </div>

      {/* Gamification Stats */}
      <GamificationCard />

      {/* Monthly Awards */}
      <MonthlyAwardsCard />

      {/* Leaderboard */}
      <LeaderboardCard />
    </section>
  );
};
