import { Lock, Crown, Rocket, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlanType } from "@/hooks/usePlanFeatures";

interface LockedFeatureProps {
  featureName: string;
  requiredPlan: PlanType;
  description?: string;
  onUpgrade: () => void;
  variant?: "card" | "overlay" | "inline";
}

const planInfo = {
  pro: {
    name: "Pro",
    icon: Rocket,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  enterprise: {
    name: "Empresarial",
    icon: Building2,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  basic: {
    name: "Básico",
    icon: Crown,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
  },
};

export const LockedFeature = ({ 
  featureName, 
  requiredPlan, 
  description,
  onUpgrade,
  variant = "card" 
}: LockedFeatureProps) => {
  const plan = planInfo[requiredPlan];
  const Icon = plan.icon;

  if (variant === "overlay") {
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
        <div className="text-center p-4 max-w-xs">
          <div className={`w-12 h-12 rounded-full ${plan.bgColor} flex items-center justify-center mx-auto mb-3`}>
            <Lock className={`h-6 w-6 ${plan.color}`} />
          </div>
          <h3 className="font-semibold mb-1">{featureName}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {description || `Disponível no plano ${plan.name}`}
          </p>
          <Button onClick={onUpgrade} size="sm" className="gap-1.5">
            <Icon className="h-4 w-4" />
            Desbloquear
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg ${plan.bgColor} border ${plan.borderColor}`}>
        <div className="flex items-center gap-2">
          <Lock className={`h-4 w-4 ${plan.color}`} />
          <span className="text-sm font-medium">{featureName}</span>
        </div>
        <Button onClick={onUpgrade} size="sm" variant="ghost" className="h-7 text-xs gap-1">
          <Icon className="h-3 w-3" />
          Plano {plan.name}
        </Button>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`border-2 ${plan.borderColor} ${plan.bgColor}`}>
      <CardContent className="p-6 text-center">
        <div className={`w-16 h-16 rounded-full ${plan.bgColor} flex items-center justify-center mx-auto mb-4`}>
          <Lock className={`h-8 w-8 ${plan.color}`} />
        </div>
        <h3 className="text-lg font-semibold mb-2">{featureName}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {description || `Este recurso está disponível no plano ${plan.name}. Faça upgrade para desbloquear.`}
        </p>
        <Button onClick={onUpgrade} className="gap-2">
          <Icon className="h-4 w-4" />
          Fazer Upgrade para {plan.name}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          🎁 Teste grátis por 7 dias
        </p>
      </CardContent>
    </Card>
  );
};
