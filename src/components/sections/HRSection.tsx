import { HRPanel } from "@/components/HRPanel";
import { LockedFeature } from "@/components/LockedFeature";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";

interface HRSectionProps {
  onUpgrade: () => void;
}

export const HRSection = ({ onUpgrade }: HRSectionProps) => {
  const { features, getRequiredPlan } = usePlanFeatures();

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Painel RH</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie funcionários e comunicados
        </p>
      </div>

      {features.hrPanel ? (
        <HRPanel />
      ) : (
        <LockedFeature
          featureName="Painel Administrativo RH"
          requiredPlan={getRequiredPlan("hrPanel")}
          description="Gerencie funcionários, aniversários e comunicados internos para toda a empresa."
          onUpgrade={onUpgrade}
        />
      )}
    </section>
  );
};
