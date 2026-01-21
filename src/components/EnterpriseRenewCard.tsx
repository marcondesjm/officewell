import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Crown, Building2, CheckCircle } from "lucide-react";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { useAuth } from "@/contexts/AuthContext";

interface EnterpriseRenewCardProps {
  onRenew: () => void;
}

export const EnterpriseRenewCard = ({ onRenew }: EnterpriseRenewCardProps) => {
  const { profile } = useAuth();
  
  return (
    <Card className="bg-gradient-to-br from-secondary/10 via-card to-card border-secondary/30 overflow-hidden shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">Plano Empresarial</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-semibold">
                  <CheckCircle className="h-3 w-3" />
                  Ativo
                </span>
              </div>
              <p className="text-muted-foreground">
                Acesso completo a todas as funcionalidades premium
              </p>
              <ul className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  Painel RH completo
                </li>
                <li className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  Relatórios compliance
                </li>
                <li className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  Suporte dedicado
                </li>
              </ul>
            </div>
          </div>
          
          <Button
            onClick={onRenew}
            size="lg"
            className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md hover:shadow-lg transition-all min-h-14 px-8 rounded-xl"
          >
            <RefreshCw className="h-5 w-5" />
            Renovar Assinatura
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
