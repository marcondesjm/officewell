import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Crown, Rocket, Building2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    id: "basic",
    name: "Básico",
    price: "Grátis",
    priceValue: 0,
    description: "Para uso pessoal",
    icon: Check,
    features: [
      "Lembretes de água",
      "Lembretes de alongamento",
      "Lembretes de descanso visual",
      "Estatísticas básicas",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 9,90",
    priceValue: 9.90,
    period: "/mês",
    description: "Para profissionais",
    icon: Rocket,
    features: [
      "Tudo do plano Básico",
      "Relatórios detalhados",
      "Metas personalizadas",
      "Suporte prioritário",
      "Sem anúncios",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Empresarial",
    price: "R$ 49,90",
    priceValue: 49.90,
    period: "/mês",
    description: "Para equipes e empresas",
    icon: Building2,
    features: [
      "Tudo do plano Pro",
      "Painel administrativo RH",
      "Relatórios de compliance",
      "Comunicados internos",
      "Gestão de funcionários",
      "Suporte dedicado",
    ],
    popular: false,
  },
];

interface SubscriptionPlansProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedPlan?: string | null;
}

export const SubscriptionPlans = ({ open, onOpenChange, preSelectedPlan }: SubscriptionPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"plans" | "form">("plans");

  // Auto-select plan when dialog opens with preSelectedPlan
  useEffect(() => {
    if (open && preSelectedPlan && preSelectedPlan !== "basic") {
      setSelectedPlan(preSelectedPlan);
      setStep("form");
    } else if (!open) {
      // Reset when dialog closes
      setStep("plans");
      setSelectedPlan(null);
    }
  }, [open, preSelectedPlan]);

  const handleSelectPlan = (planId: string) => {
    if (planId === "basic") {
      toast.success("Você já está no plano gratuito!");
      return;
    }
    setSelectedPlan(planId);
    setStep("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    const message = encodeURIComponent(
      `Olá! Gostaria de assinar o plano *${plan.name}* do OfficeWell.\n\n` +
      `*Nome:* ${name}\n` +
      `*Telefone:* ${phone}\n` +
      `*Plano:* ${plan.name} - ${plan.price}${plan.period || ""}`
    );

    const whatsappUrl = `https://wa.me/5548996029392?text=${message}`;
    window.open(whatsappUrl, "_blank");

    toast.success("Redirecionando para WhatsApp...");
    
    // Reset form
    setName("");
    setPhone("");
    setSelectedPlan(null);
    setStep("plans");
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep("plans");
    setSelectedPlan(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            {step === "plans" ? "Escolha seu Plano" : "Finalizar Assinatura"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "plans" 
              ? "Selecione o plano ideal para você ou sua empresa"
              : `Preencha seus dados para assinar o plano ${plans.find(p => p.id === selectedPlan)?.name}`
            }
          </DialogDescription>
        </DialogHeader>

        {step === "plans" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all hover:shadow-lg ${
                    plan.popular ? "border-primary shadow-md scale-105" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Mais Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                    <ul className="space-y-2 text-sm text-left">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {plan.id === "basic" ? "Plano Atual" : "Escolher Plano"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {(() => {
                    const plan = plans.find(p => p.id === selectedPlan);
                    const Icon = plan?.icon || Check;
                    return <Icon className="h-5 w-5 text-primary" />;
                  })()}
                </div>
                <div>
                  <p className="font-semibold">{plans.find(p => p.id === selectedPlan)?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {plans.find(p => p.id === selectedPlan)?.price}
                    {plans.find(p => p.id === selectedPlan)?.period}
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (WhatsApp)</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
              <Button type="submit" className="flex-1 gap-2">
                <MessageCircle className="h-4 w-4" />
                Enviar via WhatsApp
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
