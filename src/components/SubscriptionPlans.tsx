import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Crown, Rocket, Building2, MessageCircle, Tag, X, Percent, BadgePercent } from "lucide-react";
import { toast } from "sonner";
import { useTrialStatus } from "@/hooks/useTrialStatus";

// Cupons disponíveis
const AVAILABLE_COUPONS: Record<string, { discount: number; description: string; applicablePlans: string[] }> = {
  "BEMVINDO10": { discount: 10, description: "10% de desconto - Boas-vindas!", applicablePlans: ["pro", "enterprise"] },
  "PROMO20": { discount: 20, description: "20% de desconto - Promoção especial!", applicablePlans: ["pro", "enterprise"] },
  "EMPRESA30": { discount: 30, description: "30% de desconto - Empresarial!", applicablePlans: ["enterprise"] },
  "SAUDE15": { discount: 15, description: "15% de desconto - Mês da Saúde!", applicablePlans: ["pro", "enterprise"] },
  "VIP50": { discount: 50, description: "50% de desconto - Cliente VIP!", applicablePlans: ["pro", "enterprise"] },
};

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
    trial: false,
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
    trial: true,
    trialDays: 7,
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
    trial: true,
    trialDays: 7,
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
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [step, setStep] = useState<"plans" | "form">("plans");
  const { startTrial, isOnTrial, planId: currentTrialPlanId } = useTrialStatus();

  // Auto-select plan when dialog opens with preSelectedPlan
  useEffect(() => {
    if (open && preSelectedPlan && preSelectedPlan !== "basic") {
      setSelectedPlan(preSelectedPlan);
      setStep("form");
    } else if (!open) {
      // Reset when dialog closes
      setStep("plans");
      setSelectedPlan(null);
      setCouponCode("");
      setAppliedCoupon(null);
    }
  }, [open, preSelectedPlan]);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    
    if (!code) {
      toast.error("Digite um código de cupom");
      return;
    }
    
    const coupon = AVAILABLE_COUPONS[code];
    
    if (!coupon) {
      toast.error("Cupom inválido", {
        description: "Verifique o código e tente novamente",
      });
      return;
    }
    
    if (!selectedPlan || !coupon.applicablePlans.includes(selectedPlan)) {
      toast.error("Cupom não aplicável", {
        description: "Este cupom não é válido para o plano selecionado",
      });
      return;
    }
    
    setAppliedCoupon({ code, discount: coupon.discount, description: coupon.description });
    toast.success(`🎉 Cupom aplicado! ${coupon.discount}% de desconto`, {
      description: coupon.description,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Cupom removido");
  };

  const getDiscountedPrice = (originalPrice: number) => {
    if (!appliedCoupon) return originalPrice;
    return originalPrice * (1 - appliedCoupon.discount / 100);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === "basic") {
      toast.success("Você já está no plano gratuito!");
      return;
    }
    setSelectedPlan(planId);
    setStep("form");
    // Reset coupon when changing plans
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    const trialText = plan.trial 
      ? `\n\n🎁 *Período de teste:* ${plan.trialDays} dias grátis` 
      : "";

    const discountedPrice = getDiscountedPrice(plan.priceValue);
    const couponText = appliedCoupon 
      ? `\n🏷️ *Cupom aplicado:* ${appliedCoupon.code} (${appliedCoupon.discount}% off)\n*Preço original:* ${plan.price}\n*Preço com desconto:* ${formatPrice(discountedPrice)}` 
      : "";

    const message = encodeURIComponent(
      `Olá! Gostaria de ${plan.trial ? "iniciar o teste grátis" : "assinar"} o plano *${plan.name}* do OfficeWell.\n\n` +
      `*Nome:* ${name}\n` +
      `*Telefone:* ${phone}\n` +
      `*Plano:* ${plan.name} - ${appliedCoupon ? formatPrice(discountedPrice) : plan.price}${plan.period || ""}${couponText}${trialText}`
    );

    const whatsappUrl = `https://wa.me/5548996029392?text=${message}`;
    window.open(whatsappUrl, "_blank");

    // Start trial if plan has trial
    if (plan.trial && plan.trialDays) {
      startTrial(plan.id, plan.name, plan.trialDays);
      toast.success(`🎉 Teste grátis de ${plan.trialDays} dias iniciado!`, {
        description: `Aproveite todos os recursos do plano ${plan.name}`,
      });
    } else {
      toast.success("Redirecionando para WhatsApp...");
    }
    
    // Reset form
    setName("");
    setPhone("");
    setSelectedPlan(null);
    setCouponCode("");
    setAppliedCoupon(null);
    setStep("plans");
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep("plans");
    setSelectedPlan(null);
    setCouponCode("");
    setAppliedCoupon(null);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-card via-card to-muted/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-accent" />
            {step === "plans" ? "Escolha seu Plano" : "Finalizar Assinatura"}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
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
              const planColors = {
                basic: {
                  bg: "bg-success-light",
                  border: "border-success/30",
                  iconBg: "bg-success/20",
                  iconColor: "text-success",
                  badge: "bg-success text-success-foreground",
                },
                pro: {
                  bg: "bg-primary-light",
                  border: "border-primary/30",
                  iconBg: "bg-primary/20",
                  iconColor: "text-primary",
                  badge: "bg-accent text-accent-foreground",
                },
                enterprise: {
                  bg: "bg-secondary-light",
                  border: "border-secondary/30",
                  iconBg: "bg-secondary/20",
                  iconColor: "text-secondary",
                  badge: "bg-secondary text-secondary-foreground",
                },
              };
              const colors = planColors[plan.id as keyof typeof planColors];
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all hover:shadow-lg hover:-translate-y-1 ${colors.border} ${
                    plan.popular ? "ring-2 ring-primary shadow-md scale-105" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                        Mais Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={`mx-auto w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center mb-2`}>
                      <Icon className={`h-6 w-6 ${colors.iconColor}`} />
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
                      {plan.trial && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-light text-success text-xs font-medium border border-success/20">
                          🎁 {plan.trialDays} dias grátis
                        </div>
                      )}
                    </div>
                    <ul className="space-y-2 text-sm text-left">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    {plan.id === "basic" ? (
                      <Button 
                        className="w-full bg-success hover:bg-success/90 text-success-foreground"
                        disabled
                      >
                        Plano Atual
                      </Button>
                    ) : (
                      <>
                        {/* Testar Grátis button */}
                        {plan.trial && (
                          <Button 
                            className={`w-full ${
                              plan.popular 
                                ? "gradient-primary text-primary-foreground" 
                                : plan.id === "enterprise"
                                  ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                                  : ""
                            }`}
                            onClick={() => handleSelectPlan(plan.id)}
                            disabled={isOnTrial && currentTrialPlanId === plan.id}
                          >
                            {isOnTrial && currentTrialPlanId === plan.id 
                              ? "✓ Em Teste" 
                              : "Testar Grátis"}
                          </Button>
                        )}
                        
                        {/* Contratar button */}
                        <Button 
                          variant="outline"
                          className={`w-full border-2 ${
                            plan.popular 
                              ? "border-primary/50 text-primary hover:bg-primary/10" 
                              : plan.id === "enterprise"
                                ? "border-secondary/50 text-secondary hover:bg-secondary/10"
                                : "border-muted-foreground/30 hover:bg-muted"
                          }`}
                          onClick={() => handleSelectPlan(plan.id)}
                        >
                          Contratar Agora
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Card className="p-4 bg-primary-light border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  {(() => {
                    const Icon = selectedPlanData?.icon || Check;
                    return <Icon className="h-5 w-5 text-primary" />;
                  })()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedPlanData?.name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    {appliedCoupon ? (
                      <>
                        <span className="text-muted-foreground line-through">{selectedPlanData?.price}</span>
                        <span className="text-success font-bold">
                          {formatPrice(getDiscountedPrice(selectedPlanData?.priceValue || 0))}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-success-light text-success text-xs font-medium border border-success/20">
                          -{appliedCoupon.discount}%
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        {selectedPlanData?.price}
                        {selectedPlanData?.period}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Cupom de desconto */}
            <div className="space-y-2">
              <Label htmlFor="coupon" className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-accent" />
                Cupom de Desconto
              </Label>
              {appliedCoupon ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success-light border border-success/30">
                  <BadgePercent className="h-5 w-5 text-success" />
                  <div className="flex-1">
                    <p className="font-semibold text-success">{appliedCoupon.code}</p>
                    <p className="text-xs text-muted-foreground">{appliedCoupon.description}</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive-light"
                    onClick={handleRemoveCoupon}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    placeholder="Digite o código do cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="uppercase border-muted focus:border-primary"
                  />
                  <Button type="button" variant="outline" onClick={handleApplyCoupon} className="border-accent text-accent hover:bg-accent-light">
                    <Percent className="h-4 w-4 mr-1" />
                    Aplicar
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                💡 Experimente: BEMVINDO10, PROMO20, SAUDE15
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-muted focus:border-primary"
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
                className="border-muted focus:border-primary"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1 border-muted hover:bg-muted">
                Voltar
              </Button>
              <Button type="submit" className="flex-1 gap-2 gradient-success text-success-foreground">
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
