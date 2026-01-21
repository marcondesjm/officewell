import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LockedFeature } from "@/components/LockedFeature";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { useGoals } from "@/hooks/useGoals";
import { ComplianceReport } from "@/components/ComplianceReport";

interface MetasSectionProps {
  onUpgrade: () => void;
}

export const MetasSection = ({ onUpgrade }: MetasSectionProps) => {
  const navigate = useNavigate();
  const { features, getRequiredPlan } = usePlanFeatures();
  const { getTotalProgress } = useGoals();
  const goalsProgress = getTotalProgress();

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Metas & Compliance</h2>
        <p className="text-muted-foreground mt-1">
          Defina objetivos e acompanhe seu progresso
        </p>
      </div>

      {/* Goals Card */}
      {features.customGoals ? (
        <Card className="p-4 glass-card overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <Target className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold">Minhas Metas</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe seu progresso diário
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-2xl font-bold text-amber-500">{goalsProgress.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Progresso hoje</p>
              </div>
              <Button 
                onClick={() => navigate("/metas")}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Target className="h-4 w-4 mr-2" />
                Ver Metas
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <LockedFeature
          featureName="Metas Personalizadas"
          requiredPlan={getRequiredPlan("customGoals")}
          description="Defina metas diárias personalizadas e acompanhe seu progresso em tempo real."
          onUpgrade={onUpgrade}
        />
      )}

      {/* Compliance Report */}
      {features.complianceReports ? (
        <ComplianceReport />
      ) : (
        <LockedFeature
          featureName="Relatórios de Compliance"
          requiredPlan={getRequiredPlan("complianceReports")}
          description="Acompanhe a conformidade da equipe com relatórios detalhados e métricas de adesão."
          onUpgrade={onUpgrade}
        />
      )}
    </section>
  );
};
