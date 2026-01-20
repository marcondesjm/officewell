import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
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
import { LogIn, LogOut, User, Crown, Sparkles, Building2, Star, ChevronDown, Settings, Shield, Cake, Quote, Pencil, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

type SubscriptionPlan = 'free' | 'pro' | 'enterprise' | 'demo';

interface Employee {
  id: string;
  name: string;
  department: string | null;
  birthday: string | null;
  avatar_url: string | null;
}

const planLabels: Record<SubscriptionPlan, { label: string; icon: React.ReactNode; color: string }> = {
  demo: {
    label: 'Demo (7 dias)',
    icon: <Sparkles className="h-3 w-3" />,
    color: 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-600 dark:text-violet-400',
  },
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

// Pre-configured avatars (same as ProfileEditDialog)
const defaultAvatars: Record<string, { emoji: string; bg: string }> = {
  'avatar-1': { emoji: '👤', bg: 'from-blue-500 to-cyan-500' },
  'avatar-2': { emoji: '👨‍💼', bg: 'from-violet-500 to-purple-500' },
  'avatar-3': { emoji: '👩‍💼', bg: 'from-pink-500 to-rose-500' },
  'avatar-4': { emoji: '🧑‍💻', bg: 'from-green-500 to-emerald-500' },
  'avatar-5': { emoji: '👨‍🔬', bg: 'from-amber-500 to-orange-500' },
  'avatar-6': { emoji: '👩‍🔬', bg: 'from-red-500 to-pink-500' },
  'avatar-7': { emoji: '🦸', bg: 'from-indigo-500 to-blue-500' },
  'avatar-8': { emoji: '🧘', bg: 'from-teal-500 to-cyan-500' },
};

// Helper to render avatar (supports both URLs and default avatars)
const renderAvatar = (avatarUrl: string | null, fallbackInitials: string, size: 'sm' | 'md' = 'md') => {
  const sizeClasses = size === 'sm' ? 'h-7 w-7 text-sm' : 'h-10 w-10 text-lg';
  
  if (avatarUrl?.startsWith('default:')) {
    const avatarId = avatarUrl.replace('default:', '');
    const avatar = defaultAvatars[avatarId];
    if (avatar) {
      return (
        <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center border-2 border-primary/20`}>
          {avatar.emoji}
        </div>
      );
    }
  }
  
  return (
    <Avatar className={`${sizeClasses} border-2 border-primary/20`}>
      <AvatarImage src={avatarUrl || undefined} />
      <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
        {fallbackInitials}
      </AvatarFallback>
    </Avatar>
  );
};

// Helper function to parse date without timezone issues
const parseDateLocal = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const isBirthdayToday = (birthday: string | null): boolean => {
  if (!birthday) return false;
  const today = new Date();
  const bday = parseDateLocal(birthday);
  if (!bday) return false;
  return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth();
};

// Fallback messages if no tips in database
const fallbackMessages = [
  { text: "Cuide de você! Seu corpo é seu maior patrimônio.", emoji: "💪" },
  { text: "Pequenas pausas fazem grandes diferenças na sua saúde.", emoji: "✨" },
  { text: "Hidrate-se! A água é essencial para sua produtividade.", emoji: "💧" },
];

interface DailyTip {
  id: string;
  title: string;
  content: string;
  emoji: string | null;
}

export function UserHeaderCard() {
  const { user, profile, isLoading, signOut, isAdmin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [isRequestingUpgrade, setIsRequestingUpgrade] = useState(false);
  const [birthdayPeople, setBirthdayPeople] = useState<Employee[]>([]);
  const [dailyTip, setDailyTip] = useState<{ text: string; emoji: string } | null>(null);
  const navigate = useNavigate();

  // Fetch daily tip from database
  const fetchDailyTip = useCallback(async () => {
    try {
      const { data: tips, error } = await supabase
        .from("daily_tips")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      if (tips && tips.length > 0) {
        // Rotate based on day of year
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
        const tipIndex = dayOfYear % tips.length;
        const selectedTip = tips[tipIndex];
        setDailyTip({
          text: selectedTip.content,
          emoji: selectedTip.emoji || "💡"
        });
      } else {
        // Use fallback if no tips in database
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
        const fallbackTip = fallbackMessages[dayOfYear % fallbackMessages.length];
        setDailyTip(fallbackTip);
      }
    } catch (error) {
      console.error("Error fetching daily tip:", error);
      // Use fallback on error
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      const fallbackTip = fallbackMessages[dayOfYear % fallbackMessages.length];
      setDailyTip(fallbackTip);
    }
  }, []);

  useEffect(() => {
    fetchDailyTip();
  }, [fetchDailyTip]);

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

  // Fetch birthdays
  const checkBirthdays = useCallback(async () => {
    try {
      const { data: empData, error: empError } = await supabase
        .from("employees")
        .select("*");

      if (empError) throw empError;

      const todayBirthdays = (empData || []).filter((emp) => 
        isBirthdayToday(emp.birthday)
      );

      setBirthdayPeople(todayBirthdays);
    } catch (error) {
      console.error("Error checking birthdays:", error);
    }
  }, []);

  useEffect(() => {
    checkBirthdays();
  }, [checkBirthdays]);

  if (isLoading) {
    return (
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
        <div className="h-12 bg-muted animate-pulse rounded-lg" />
      </Card>
    );
  }

  if (!user || !profile) {
    return (
      <>
        <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Faça login para acessar sua conta</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                💡 Use a conta demo para testar: <span className="font-medium text-primary">demo@officewell.app</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuthModalOpen(true)}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
          </div>
        </Card>
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
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
        <div className="flex flex-col gap-3">
          {/* HR Report Reminder Marquee */}
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-md py-1.5 px-2 border border-amber-500/20">
            <div className="flex items-center gap-2 animate-marquee whitespace-nowrap">
              <span className="text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5">
                ⚠️ <strong>IMPORTANTE:</strong> Lembre-se de enviar o relatório ao RH ao final do dia!
              </span>
              <span className="text-amber-500/50 mx-4">•</span>
              <span className="text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5">
                📋 Relatório de pausas e bem-estar deve ser enviado antes das 18h.
              </span>
              <span className="text-amber-500/50 mx-4">•</span>
              <span className="text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5">
                ⚠️ <strong>IMPORTANTE:</strong> Lembre-se de enviar o relatório ao RH ao final do dia!
              </span>
              <span className="text-amber-500/50 mx-4">•</span>
              <span className="text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5">
                📋 Relatório de pausas e bem-estar deve ser enviado antes das 18h.
              </span>
            </div>
          </div>

          {/* User Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {renderAvatar(profile.avatar_url, initials, 'md')}
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold leading-tight truncate max-w-[120px]">
                    {profile.display_name}
                  </span>
                  {/* Report Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate('/ergonomia')}
                          className="h-6 w-6 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="z-[100]">
                        <p>Gerar Relatório de Bem-estar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${currentPlanInfo.color}`}>
                    {currentPlanInfo.icon}
                    <span className="ml-1">{currentPlanInfo.label}</span>
                  </Badge>
                  <span className="flex items-center gap-0.5 text-[11px] text-amber-500 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-bold">{profile.points}</span>
                    <span className="text-[9px] text-amber-400/70 ml-0.5">pts</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Admin Button */}
              {isAdmin && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/plans-admin')}
                        className="gap-2 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      >
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Admin</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="z-[100]">
                      <p>Painel de Administração de Planos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-64 z-[9999]">
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
                  
                  <DropdownMenuItem onClick={() => setProfileEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </DropdownMenuItem>
                  
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
                  
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Birthday & Motivational Message Section */}
          <div className="pt-3 border-t border-border/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Birthday Section */}
              {birthdayPeople.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20"
                >
                  <div className="flex items-center justify-center gap-2 mb-2 text-sm text-muted-foreground">
                    <Cake className="h-4 w-4 text-pink-500" />
                    <span>🎉 Aniversariantes 🎉</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {birthdayPeople.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-background/50"
                      >
                        <Avatar className="h-7 w-7 border-2 border-pink-500/30">
                          <AvatarImage src={person.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px] font-medium bg-pink-500/20 text-pink-600 dark:text-pink-400">
                            {person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{person.name}</span>
                          {person.department && (
                            <span className="text-[9px] text-muted-foreground">{person.department}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Motivational Message */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 ${birthdayPeople.length === 0 ? 'sm:col-span-2' : ''}`}
              >
                <div className="flex items-center justify-center gap-2 mb-2 text-sm text-muted-foreground">
                  <Quote className="h-4 w-4 text-primary" />
                  <span>💡 Dica do Dia</span>
                </div>
                {dailyTip ? (
                  <p className="text-center text-sm font-medium">
                    <span className="mr-1">{dailyTip.emoji}</span>
                    {dailyTip.text}
                  </p>
                ) : (
                  <p className="text-center text-sm font-medium text-muted-foreground">
                    Carregando dica...
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </Card>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <ProfileEditDialog open={profileEditOpen} onOpenChange={setProfileEditOpen} />
    </>
  );
}
