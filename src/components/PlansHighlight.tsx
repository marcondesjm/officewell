import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Crown, Rocket, Building2, Sparkles } from "lucide-react";

const plans = [
  {
    id: "basic",
    name: "Básico",
    price: "Grátis",
    description: "Para uso pessoal",
    icon: Check,
    features: ["Lembretes de água", "Alongamento", "Descanso visual"],
    popular: false,
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-500",
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
    color: "from-primary/20 to-blue-500/20",
    iconColor: "text-primary",
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
    color: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-500",
  },
];

interface PlansHighlightProps {
  onSelectPlan: () => void;
}

export const PlansHighlight = ({ onSelectPlan }: PlansHighlightProps) => {
  return (
    <Card className="glass overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold">Escolha seu Plano</h2>
          <Sparkles className="h-5 w-5 text-yellow-500" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl p-4 bg-gradient-to-br ${plan.color} border ${
                  plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border/50"
                } transition-all hover:scale-[1.02] cursor-pointer`}
                onClick={onSelectPlan}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-background/80 flex items-center justify-center ${plan.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-1.5">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button onClick={onSelectPlan} size="lg" className="gap-2">
            <Crown className="h-4 w-4" />
            Ver Todos os Planos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
