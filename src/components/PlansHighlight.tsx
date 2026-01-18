import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Crown, Rocket, Building2, Sparkles, Play, Gift } from "lucide-react";

const plans = [
  {
    id: "basic",
    name: "Básico",
    price: "Grátis",
    description: "Para uso pessoal",
    icon: Check,
    features: ["Lembretes de água", "Alongamento", "Descanso visual"],
    popular: false,
    trial: false,
    bgColor: "bg-success-light dark:bg-success/10",
    borderColor: "border-success/30",
    iconBg: "bg-success/20",
    iconColor: "text-success",
    textColor: "text-foreground",
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 9,90",
    period: "/mês",
    description: "Para profissionais",
    icon: Rocket,
    features: ["Relatórios detalhados", "Metas personalizadas", "Sem anúncios"],
    popular: true,
    trial: true,
    trialDays: 7,
    bgColor: "bg-primary-light dark:bg-primary/10",
    borderColor: "border-primary/50",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    textColor: "text-foreground",
  },
  {
    id: "enterprise",
    name: "Empresarial",
    price: "R$ 49,90",
    period: "/mês",
    description: "Para equipes",
    icon: Building2,
    features: ["Painel RH completo", "Relatórios compliance", "Suporte dedicado"],
    popular: false,
    trial: true,
    trialDays: 7,
    bgColor: "bg-secondary-light dark:bg-secondary/10",
    borderColor: "border-secondary/50",
    iconBg: "bg-secondary/20",
    iconColor: "text-secondary",
    textColor: "text-foreground",
  },
];

interface PlansHighlightProps {
  onSelectPlan: (planId?: string) => void;
  onShowDemo: (planId: string) => void;
}

export const PlansHighlight = ({ onSelectPlan, onShowDemo }: PlansHighlightProps) => {
  return (
    <Card className="bg-gradient-to-br from-card via-card to-muted/50 border-border/50 overflow-hidden shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown className="h-6 w-6 text-accent" />
          <h2 className="text-xl font-bold text-foreground">Escolha seu Plano</h2>
          <Sparkles className="h-5 w-5 text-accent" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl p-5 ${plan.bgColor} border ${plan.borderColor} ${
                  plan.popular ? "ring-2 ring-primary/50 shadow-lg" : ""
                } transition-all hover:scale-[1.02] hover:shadow-md animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${plan.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${plan.textColor}`}>{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`text-2xl font-bold ${plan.textColor}`}>{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                  {plan.trial && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-light text-success text-xs font-medium border border-success/20">
                      <Gift className="h-3 w-3" />
                      {plan.trialDays} dias grátis
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 border-muted-foreground/30 hover:bg-muted hover:border-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowDemo(plan.id);
                    }}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Demo
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 ${
                      plan.id === "basic" 
                        ? "bg-success hover:bg-success/90 text-success-foreground" 
                        : plan.id === "pro" 
                          ? "gradient-primary text-primary-foreground" 
                          : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlan(plan.id);
                    }}
                  >
                    {plan.id === "basic" ? "Atual" : plan.trial ? "Testar Grátis" : "Assinar"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button 
            onClick={() => onSelectPlan()} 
            size="lg" 
            className="gap-2 gradient-primary text-primary-foreground shadow-md hover:shadow-lg transition-shadow"
          >
            <Crown className="h-4 w-4" />
            Ver Todos os Planos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
