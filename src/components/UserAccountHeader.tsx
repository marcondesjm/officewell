import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, User, Crown, Sparkles, Building2, Star, ChevronDown, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

const planLabels: Record<SubscriptionPlan, { label: string; icon: React.ReactNode; color: string }> = {
  free: {
    label: 'Grátis',
    icon: <User className="h-3 w-3" />,
    color: 'bg-muted text-muted-foreground',
  },
  pro: {
    label: 'Pro',
    icon: <Crown className="h-3 w-3" />,
    color: 'bg-primary/20 text-primary',
  },
  enterprise: {
    label: 'Empresarial',
    icon: <Building2 className="h-3 w-3" />,
    color: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400',
  },
};

export function UserAccountHeader() {
  const { user, profile, isLoading, signOut, isAdmin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isRequestingUpgrade, setIsRequestingUpgrade] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
  };

  const handleRequestUpgrade = async (targetPlan: SubscriptionPlan) => {
    if (!user || !profile) return;
    
    if (profile.current_plan === targetPlan) {
      toast.info('Você já está neste plano');
      return;
    }

    setIsRequestingUpgrade(true);
    
    try {
      const { error } = await supabase
        .from('plan_upgrade_requests')
        .insert({
          user_id: user.id,
          current_plan: profile.current_plan,
          requested_plan: targetPlan,
        });

      if (error) throw error;
      
      toast.success('Solicitação de upgrade enviada!', {
        description: 'Um administrador irá analisar seu pedido em breve.',
      });
    } catch (error) {
      console.error('Error requesting upgrade:', error);
      toast.error('Erro ao solicitar upgrade');
    } finally {
      setIsRequestingUpgrade(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-24 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAuthModalOpen(true)}
          className="gap-2"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Entrar</span>
        </Button>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </>
    );
  }

  const currentPlanInfo = planLabels[profile.current_plan];
  const initials = profile.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all shadow-sm"
          >
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium leading-tight truncate max-w-[120px]">
                {profile.display_name}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${currentPlanInfo.color}`}>
                  {currentPlanInfo.icon}
                  <span className="ml-1">{currentPlanInfo.label}</span>
                </Badge>
                <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                  <Star className="h-3 w-3 fill-current" />
                  {profile.points}
                </span>
              </div>
            </div>
            
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </motion.button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile.display_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={currentPlanInfo.color}>
                  {currentPlanInfo.icon}
                  <span className="ml-1">Plano {currentPlanInfo.label}</span>
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Trocar Plano
          </DropdownMenuLabel>
          
          {profile.current_plan !== 'free' && (
            <DropdownMenuItem 
              onClick={() => handleRequestUpgrade('free')}
              disabled={isRequestingUpgrade}
            >
              <User className="h-4 w-4 mr-2" />
              Plano Grátis
            </DropdownMenuItem>
          )}
          
          {profile.current_plan !== 'pro' && (
            <DropdownMenuItem 
              onClick={() => handleRequestUpgrade('pro')}
              disabled={isRequestingUpgrade}
            >
              <Crown className="h-4 w-4 mr-2 text-primary" />
              Plano Pro
              <Sparkles className="h-3 w-3 ml-auto text-primary" />
            </DropdownMenuItem>
          )}
          
          {profile.current_plan !== 'enterprise' && (
            <DropdownMenuItem 
              onClick={() => handleRequestUpgrade('enterprise')}
              disabled={isRequestingUpgrade}
            >
              <Building2 className="h-4 w-4 mr-2 text-amber-500" />
              Plano Empresarial
              <Sparkles className="h-3 w-3 ml-auto text-amber-500" />
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {isAdmin && (
            <DropdownMenuItem onClick={() => window.location.href = '/hr-admin'}>
              <Settings className="h-4 w-4 mr-2" />
              Painel Admin
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
