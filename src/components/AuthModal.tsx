import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  Phone, 
  Eye, 
  EyeOff, 
  Check,
  Crown,
  Building2,
  Zap,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SubscriptionPlan = 'demo' | 'free' | 'pro' | 'enterprise';

const planOptions: {
  id: SubscriptionPlan;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  features: string[];
  recommended?: boolean;
}[] = [
  {
    id: 'demo',
    name: 'Demo',
    description: 'Experimente gratuitamente',
    icon: Sparkles,
    color: 'text-muted-foreground',
    gradient: 'from-slate-500/20 to-slate-600/10',
    features: ['Acesso básico', 'Funcionalidades limitadas', 'Ideal para testar'],
  },
  {
    id: 'free',
    name: 'Free',
    description: 'Para uso pessoal',
    icon: Zap,
    color: 'text-blue-500',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    features: ['Lembretes básicos', 'Dicas de saúde', 'Dashboard pessoal'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para profissionais',
    icon: Crown,
    color: 'text-amber-500',
    gradient: 'from-amber-500/20 to-orange-500/10',
    features: ['Todos recursos Free', 'Estatísticas avançadas', 'Metas personalizadas', 'Suporte prioritário'],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para empresas',
    icon: Building2,
    color: 'text-violet-500',
    gradient: 'from-violet-500/20 to-purple-500/10',
    features: ['Todos recursos Pro', 'Painel RH', 'Relatórios corporativos', 'Gestão de equipes'],
  },
];

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState<'plan' | 'form'>('plan');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupWhatsapp, setSignupWhatsapp] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('demo');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    
    if (error) {
      toast.error('Email ou senha incorretos');
    } else {
      toast.success('Login realizado com sucesso!');
      onOpenChange(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail.trim() || !signupPassword.trim() || !signupName.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    if (signupPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupWhatsapp, selectedPlan);
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }
    } else {
      toast.success(`Conta criada com sucesso no plano ${planOptions.find(p => p.id === selectedPlan)?.name}!`);
      onOpenChange(false);
      // Reset state
      setSignupStep('plan');
      setSelectedPlan('demo');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'login' | 'signup');
    if (value === 'signup') {
      setSignupStep('plan');
    }
  };

  const handleSkipPlanSelection = () => {
    setSelectedPlan('demo');
    setSignupStep('form');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-gradient-to-b from-background to-muted/20 max-h-[90vh]">
        <ScrollArea className="max-h-[85vh]">
        <div className="relative">
          {/* Header decorativo */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent h-32 pointer-events-none" />
          
          <DialogHeader className="relative pt-6 pb-4 px-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              {activeTab === 'login' 
                ? 'Bem-vindo de volta!' 
                : signupStep === 'plan' 
                  ? 'Escolha seu plano' 
                  : 'Crie sua conta'}
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground mt-1">
              {activeTab === 'login' 
                ? 'Entre para acessar seus recursos' 
                : signupStep === 'plan'
                  ? 'Selecione o plano ideal para você'
                  : `Plano selecionado: ${planOptions.find(p => p.id === selectedPlan)?.name}`}
            </p>
          </DialogHeader>

          <div className="px-6 pb-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="wait">
                <TabsContent value="login" asChild>
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleLogin}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button
                      type="submit" 
                      className="w-full gradient-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">ou</span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/10"
                      disabled={isLoading}
                      onClick={() => {
                        onOpenChange(false);
                        window.location.href = '/demo?tour=true';
                      }}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Acessar Conta Demo
                    </Button>
                  </motion.form>
                </TabsContent>
                
                <TabsContent value="signup" asChild>
                  <AnimatePresence mode="wait">
                    {signupStep === 'plan' ? (
                      <motion.div
                        key="plan-selection"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          {planOptions.map((plan) => {
                            const Icon = plan.icon;
                            const isSelected = selectedPlan === plan.id;
                            
                            return (
                              <motion.button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlan(plan.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                  "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                                  "bg-gradient-to-br",
                                  plan.gradient,
                                  isSelected 
                                    ? "border-primary shadow-lg shadow-primary/20" 
                                    : "border-border/50 hover:border-primary/50"
                                )}
                              >
                                {plan.recommended && (
                                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                                    Recomendado
                                  </span>
                                )}
                                
                                {isSelected && (
                                  <div className="absolute top-2 right-2">
                                    <Check className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                                
                                <div className={cn("p-2 rounded-lg w-fit mb-2", `bg-gradient-to-br ${plan.gradient}`)}>
                                  <Icon className={cn("h-5 w-5", plan.color)} />
                                </div>
                                
                                <h3 className="font-bold text-foreground">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{plan.description}</p>
                                
                                <ul className="space-y-1">
                                  {plan.features.slice(0, 2).map((feature, idx) => (
                                    <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Check className="h-3 w-3 text-primary" />
                                      {feature}
                                    </li>
                                  ))}
                                  {plan.features.length > 2 && (
                                    <li className="text-xs text-muted-foreground">
                                      +{plan.features.length - 2} mais...
                                    </li>
                                  )}
                                </ul>
                              </motion.button>
                            );
                          })}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="flex-1"
                            onClick={handleSkipPlanSelection}
                          >
                            Pular (Demo)
                          </Button>
                          <Button
                            type="button"
                            className="flex-1 gradient-primary"
                            onClick={() => setSignupStep('form')}
                          >
                            Continuar
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="signup-form"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleSignup}
                        className="space-y-4"
                      >
                        {/* Plan indicator */}
                        <button
                          type="button"
                          onClick={() => setSignupStep('plan')}
                          className="w-full flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                        >
                          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Plano selecionado</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              {(() => {
                                const plan = planOptions.find(p => p.id === selectedPlan);
                                const Icon = plan?.icon || Sparkles;
                                return (
                                  <>
                                    <Icon className={cn("h-4 w-4", plan?.color)} />
                                    {plan?.name}
                                  </>
                                );
                              })()}
                            </p>
                          </div>
                          <span className="text-xs text-primary">Alterar</span>
                        </button>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-name" className="text-sm font-medium">
                            Nome
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-name"
                              type="text"
                              placeholder="Seu nome"
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                              className="pl-10"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-sm font-medium">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="seu@email.com"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              className="pl-10"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-whatsapp" className="text-sm font-medium">
                            WhatsApp
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-whatsapp"
                              type="tel"
                              placeholder="(00) 00000-0000"
                              value={signupWhatsapp}
                              onChange={(e) => setSignupWhatsapp(e.target.value)}
                              className="pl-10"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-sm font-medium">
                            Senha
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-password"
                              type={showSignupPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              className="pl-10 pr-10"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Mínimo de 6 caracteres
                          </p>
                        </div>
                        
                        <Button
                          type="submit" 
                          className="w-full gradient-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Criando conta...
                            </>
                          ) : (
                            'Criar Conta'
                          )}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
