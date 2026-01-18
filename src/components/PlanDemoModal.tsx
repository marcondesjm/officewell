import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Rocket, Building2, Eye, Dumbbell, Droplets, BarChart3, Target, BellOff, Users, FileText, Headphones, Play, Gift } from "lucide-react";

interface PlanDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string | null;
  onSelectPlan: (planId: string) => void;
}

const planDemos = {
  basic: {
    name: "Básico",
    icon: Check,
    color: "text-success",
    bgColor: "bg-success-light",
    description: "Perfeito para começar a cuidar da sua saúde no trabalho",
    features: [
      {
        icon: Droplets,
        title: "Lembretes de Água",
        description: "Receba alertas para se manter hidratado durante o dia",
        demo: "💧 Intervalo configurável de 30min a 2h"
      },
      {
        icon: Dumbbell,
        title: "Alongamento",
        description: "Pausas guiadas para alongar e relaxar os músculos",
        demo: "🧘 Exercícios simples com imagens ilustrativas"
      },
      {
        icon: Eye,
        title: "Descanso Visual",
        description: "Proteja seus olhos com pausas regulares da tela",
        demo: "👀 Regra 20-20-20 para saúde ocular"
      },
    ],
    cta: "Você já está usando!",
    ctaDisabled: true,
  },
  pro: {
    name: "Pro",
    icon: Rocket,
    color: "text-primary",
    bgColor: "bg-primary-light",
    description: "Para profissionais que querem maximizar sua produtividade",
    trial: true,
    trialDays: 7,
    features: [
      {
        icon: BarChart3,
        title: "Relatórios Detalhados",
        description: "Acompanhe seu progresso com gráficos e estatísticas",
        demo: "📊 Veja quantas pausas você fez por dia/semana/mês"
      },
      {
        icon: Target,
        title: "Metas Personalizadas",
        description: "Defina objetivos de saúde personalizados",
        demo: "🎯 Configure metas diárias de hidratação e pausas"
      },
      {
        icon: BellOff,
        title: "Sem Anúncios",
        description: "Experiência limpa e sem interrupções",
        demo: "✨ Foco total na sua saúde e produtividade"
      },
    ],
    cta: "Iniciar 7 Dias Grátis",
    ctaDisabled: false,
  },
  enterprise: {
    name: "Empresarial",
    icon: Building2,
    color: "text-secondary",
    bgColor: "bg-secondary-light",
    description: "Solução completa para equipes e departamentos de RH",
    trial: true,
    trialDays: 7,
    features: [
      {
        icon: Users,
        title: "Painel RH Completo",
        description: "Gerencie a saúde de toda a equipe em um só lugar",
        demo: "👥 Cadastre funcionários, aniversários e departamentos"
      },
      {
        icon: FileText,
        title: "Relatórios de Compliance",
        description: "Relatórios para conformidade com normas de saúde ocupacional",
        demo: "📋 Exporte relatórios NR-17 e ergonomia"
      },
      {
        icon: Headphones,
        title: "Suporte Dedicado",
        description: "Atendimento prioritário via WhatsApp",
        demo: "🎧 Resposta em até 2h em horário comercial"
      },
    ],
    cta: "Iniciar 7 Dias Grátis",
    ctaDisabled: false,
  },
};

export const PlanDemoModal = ({ open, onOpenChange, planId, onSelectPlan }: PlanDemoModalProps) => {
  if (!planId) return null;
  
  const demo = planDemos[planId as keyof typeof planDemos];
  if (!demo) return null;

  const Icon = demo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-card via-card to-muted/30">
        <DialogHeader>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full ${demo.bgColor} flex items-center justify-center border border-current/10`}>
              <Icon className={`h-6 w-6 ${demo.color}`} />
            </div>
            <div className="text-left">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                Plano {demo.name}
                {planId === "pro" && (
                  <Badge className="bg-accent text-accent-foreground">Popular</Badge>
                )}
              </DialogTitle>
              <DialogDescription>{demo.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Trial Banner */}
        {'trial' in demo && demo.trial && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-success-light to-secondary-light border border-success/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <Gift className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-success">
                  {'trialDays' in demo ? demo.trialDays : 7} dias de teste grátis!
                </p>
                <p className="text-sm text-muted-foreground">
                  Experimente todas as funcionalidades sem compromisso
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Funcionalidades Incluídas
          </h3>

          <div className="grid gap-4">
            {demo.features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${demo.bgColor} flex items-center justify-center flex-shrink-0 border border-current/10`}>
                      <FeatureIcon className={`h-5 w-5 ${demo.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-sm font-medium">
                        {feature.demo}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {planId !== "basic" && (
            <div className="p-4 rounded-xl bg-primary-light border border-primary/20">
              <p className="text-sm text-center text-muted-foreground">
                ✅ Inclui todas as funcionalidades do plano {planId === "enterprise" ? "Pro" : "Básico"}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-muted hover:bg-muted"
            onClick={() => onOpenChange(false)}
          >
            Voltar
          </Button>
          <Button
            className={`flex-1 gap-2 ${
              planId === "basic" 
                ? "bg-success text-success-foreground" 
                : planId === "pro" 
                  ? "gradient-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
            }`}
            disabled={demo.ctaDisabled}
            onClick={() => {
              onOpenChange(false);
              if (!demo.ctaDisabled) {
                onSelectPlan(planId);
              }
            }}
          >
            <Crown className="h-4 w-4" />
            {demo.cta}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
