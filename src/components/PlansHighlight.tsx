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
    bgColor: "bg-emerald-900/80",
    borderColor: "border-emerald-700/50",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    textColor: "text-emerald-50",
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
    bgColor: "bg-slate-800/90",
    borderColor: "border-primary/50",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    textColor: "text-slate-50",
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
    bgColor: "bg-slate-800/90",
    borderColor: "border-purple-500/50",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    textColor: "text-slate-50",
  },
];

interface PlansHighlightProps {
  onSelectPlan: (planId?: string) => void;
  onShowDemo: (planId: string) => void;
}

export const PlansHighlight = ({ onSelectPlan, onShowDemo }: PlansHighlightProps) => {
  return (
    <Card className="bg-slate-900/95 border-slate-700/50 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-white">Escolha seu Plano</h2>
          <Sparkles className="h-5 w-5 text-yellow-500" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl p-5 ${plan.bgColor} border ${plan.borderColor} ${
                  plan.popular ? "ring-2 ring-primary/30" : ""
                } transition-all hover:scale-[1.02] animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-amber-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
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
                    <p className="text-xs text-slate-400">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`text-2xl font-bold ${plan.textColor}`}>{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  )}
                  {plan.trial && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                      <Gift className="h-3 w-3" />
                      {plan.trialDays} dias grátis
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
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
                    className={`flex-1 ${plan.id === "basic" ? "bg-emerald-600 hover:bg-emerald-700" : plan.id === "pro" ? "bg-primary hover:bg-primary/90" : "bg-purple-600 hover:bg-purple-700"}`}
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
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Crown className="h-4 w-4" />
            Ver Todos os Planos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
