import { WaterTracker } from "@/components/WaterTracker";
import { HealthTips } from "@/components/HealthTips";

export const WaterSection = () => {
  return (
    <section className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Hidratação</h2>
        <p className="text-muted-foreground mt-1">
          Acompanhe seu consumo de água diário
        </p>
      </div>

      {/* Water Tracker */}
      <WaterTracker />

      {/* Health Tips */}
      <HealthTips />
    </section>
  );
};
