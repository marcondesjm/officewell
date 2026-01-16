import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  Eye, 
  Activity, 
  Users, 
  BarChart3, 
  Shield, 
  Smartphone,
  Check,
  ArrowRight,
  Clock,
  Heart,
  Sparkles,
  Star,
  MessageCircle,
  Loader2,
  X,
  Crown,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 }
};

const Landing = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullName = `${firstName} ${lastName}`.trim();
    
    if (!email || !firstName) {
      toast.error('Por favor, preencha nome e email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    
    try {
      // Save lead to database
      const { error } = await supabase
        .from('leads')
        .insert({
          name: fullName.slice(0, 100),
          email: email.trim().toLowerCase().slice(0, 255),
          company: objective?.trim().slice(0, 100) || null,
          source: 'landing'
        });

      if (error) {
        console.error('Error saving lead:', error);
        toast.error('Erro ao enviar. Tente novamente.');
        setLoading(false);
        return;
      }

      // Open WhatsApp with the lead info
      const message = encodeURIComponent(
        `🎯 *Novo Lead - OfficeWell*\n\n` +
        `👤 Nome: ${fullName}\n` +
        `📧 Email: ${email}\n` +
        `📱 WhatsApp: ${phone || 'Não informado'}\n` +
        `🎯 Objetivo: ${objective || 'Não informado'}\n\n` +
        `Tenho interesse em conhecer mais sobre o OfficeWell!`
      );
      
      window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
      
      toast.success('Obrigado pelo interesse! Entraremos em contato em breve.');
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setObjective('');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Droplets className="h-8 w-8" />,
      title: 'Lembretes de Água',
      description: 'Mantenha sua equipe hidratada com lembretes inteligentes e personalizáveis'
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: 'Pausas para Alongamento',
      description: 'Exercícios guiados para prevenir lesões e melhorar a postura'
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: 'Descanso Visual',
      description: 'Lembretes para proteger a visão com a técnica 20-20-20'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Painel RH',
      description: 'Gestão completa de funcionários, aniversários e comunicados'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Relatórios de Compliance',
      description: 'Acompanhe a adesão da equipe às práticas de saúde'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Segurança de Dados',
      description: 'Seus dados protegidos com criptografia de ponta a ponta'
    }
  ];

  const painPoints = [
    'Fadiga visual e dores de cabeça constantes',
    'Problemas posturais e dores lombares',
    'Baixa energia e desidratação',
    'Queda na produtividade ao longo do dia',
    'Afastamentos frequentes por problemas de saúde'
  ];

  const benefits = [
    'Redução de até 40% em afastamentos por LER/DORT',
    'Aumento de 25% na produtividade dos colaboradores',
    'Melhoria no clima organizacional',
    'Conformidade com NR-17 e programas de ergonomia',
    'Instalação como app (PWA) - funciona offline'
  ];

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      subtitle: 'Para uso pessoal',
      price: 'Grátis',
      period: '',
      trial: null,
      features: [
        'Lembretes de água',
        'Alongamento',
        'Descanso visual'
      ],
      popular: false,
      cta: 'Atual',
      ctaVariant: 'default' as const
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'Para profissionais',
      price: 'R$ 9,90',
      period: '/mês',
      trial: '7 dias grátis',
      features: [
        'Relatórios detalhados',
        'Metas personalizadas',
        'Sem anúncios'
      ],
      popular: true,
      cta: 'Testar Grátis',
      ctaVariant: 'default' as const
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      subtitle: 'Para equipes',
      price: 'R$ 49,90',
      period: '/mês',
      trial: '7 dias grátis',
      features: [
        'Painel RH completo',
        'Relatórios compliance',
        'Suporte dedicado'
      ],
      popular: false,
      cta: 'Testar Grátis',
      ctaVariant: 'default' as const
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Gerente de RH',
      company: 'TechCorp',
      text: 'Reduzimos em 35% os afastamentos por problemas de saúde após implementar o OfficeWell.',
      rating: 5
    },
    {
      name: 'Carlos Santos',
      role: 'CEO',
      company: 'StartupXYZ',
      text: 'A equipe está mais saudável e produtiva. O investimento se pagou em 2 meses!',
      rating: 5
    },
    {
      name: 'Ana Oliveira',
      role: 'Coordenadora de Bem-estar',
      company: 'BigCompany',
      text: 'Os relatórios de compliance nos ajudam a demonstrar valor para a diretoria.',
      rating: 5
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setPlansOpen(true);
  };

  const stats = [
    { value: '+5.000', label: 'Usuários ativos' },
    { value: '98%', label: 'Satisfação' },
    { value: '-40%', label: 'Afastamentos' },
    { value: '+200', label: 'Empresas' }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">OfficeWell</span>
          </motion.div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link to="/">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Acessar App</Button>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Smartphone className="h-5 w-5" />
              </Button>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setPlansOpen(true)} size="sm">
                Começar Agora
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Teste grátis por 7 dias
            </Badge>
          </motion.div>
          
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
          >
            Cuide da saúde da sua equipe no trabalho
          </motion.h1>
          
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Lembretes inteligentes de hidratação, alongamento e descanso visual. 
            Reduza afastamentos e aumente a produtividade.
          </motion.p>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="text-lg px-8" onClick={() => setPlansOpen(true)}>
                Começar Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <Link to="/">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Ver Demo
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={scaleIn}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="p-4"
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para cuidar da sua equipe
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades pensadas para empresas que valorizam a saúde dos colaboradores
            </p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow h-full">
                  <CardHeader>
                    <motion.div 
                      className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pain Points & Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideInLeft}
              transition={{ duration: 0.6 }}
            >
              {/* Pain Points */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4 text-muted-foreground">
                  Sem cuidados adequados, sua equipe enfrenta:
                </h3>
                <motion.ul 
                  className="space-y-3"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  {painPoints.map((point, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-start gap-3"
                      variants={fadeInUp}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.div 
                        className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 500 }}
                      >
                        <X className="h-4 w-4 text-red-500 dark:text-red-400" />
                      </motion.div>
                      <span className="text-muted-foreground">{point}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Com o OfficeWell, você conquista:
                </h3>
                <motion.ul 
                  className="space-y-3"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  {benefits.map((benefit, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-start gap-3"
                      variants={fadeInUp}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.div 
                        className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 500 }}
                      >
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </motion.div>
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
            <motion.div 
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideInRight}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-3xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <Card className="relative border-none shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div 
                      className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Clock className="h-6 w-6 text-primary" />
                    </motion.div>
                    <div>
                      <div className="font-semibold">Próximo lembrete</div>
                      <div className="text-sm text-muted-foreground">em 15 minutos</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { icon: Droplets, label: 'Beber Água', time: '30 min', color: 'blue' },
                      { icon: Activity, label: 'Alongamento', time: '1h', color: 'green' },
                      { icon: Eye, label: 'Descanso Visual', time: '20 min', color: 'purple' }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className={`flex items-center justify-between p-3 bg-${item.color}-50 dark:bg-${item.color}-950 rounded-lg`}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.15 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`h-5 w-5 text-${item.color}-500`} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <Badge variant="secondary">{item.time}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-slate-900 dark:bg-slate-950">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white flex items-center justify-center gap-2">
              <Crown className="h-8 w-8 text-yellow-400" />
              Escolha seu Plano
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </h2>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                variants={scaleIn}
                transition={{ duration: 0.5 }}
                whileHover={{ 
                  y: -10, 
                  transition: { duration: 0.2 } 
                }}
              >
                <Card 
                  className={`relative border transition-all h-full bg-slate-800/50 dark:bg-slate-900/50 backdrop-blur ${
                    plan.popular 
                      ? 'border-primary/50 shadow-lg shadow-primary/20' 
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {plan.popular && (
                    <motion.div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <Badge className="bg-orange-500 text-white px-4 py-1 text-xs">
                        Popular
                      </Badge>
                    </motion.div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        plan.id === 'basic' ? 'bg-green-500/20' :
                        plan.id === 'pro' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                      }`}>
                        {plan.id === 'basic' && <Check className="h-5 w-5 text-green-400" />}
                        {plan.id === 'pro' && <Sparkles className="h-5 w-5 text-blue-400" />}
                        {plan.id === 'enterprise' && <Crown className="h-5 w-5 text-purple-400" />}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                        <p className="text-slate-400 text-sm">{plan.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mt-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      {plan.period && <span className="text-slate-400">{plan.period}</span>}
                      {plan.trial && (
                        <Badge variant="outline" className="ml-2 border-green-500/50 text-green-400 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {plan.trial}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * featureIndex }}
                        >
                          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Demo
                      </Button>
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          className={`w-full ${
                            plan.id === 'basic' ? 'bg-green-600 hover:bg-green-700' :
                            plan.id === 'pro' ? 'bg-primary hover:bg-primary/90' : 
                            'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          }`}
                          onClick={() => handleSelectPlan(plan.id)}
                        >
                          {plan.cta}
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="outline" 
              size="lg"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => setPlansOpen(true)}
            >
              <Crown className="h-5 w-5 mr-2 text-yellow-400" />
              Ver Todos os Planos
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-none shadow-lg h-full">
                  <CardContent className="pt-6">
                    <motion.div 
                      className="flex gap-1 mb-4"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={staggerContainer}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          variants={scaleIn}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="font-bold text-primary">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </motion.div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {testimonial.role} - {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            className="grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            {/* Left Side - Dark */}
            <div className="bg-primary text-primary-foreground p-8 md:p-12 flex flex-col justify-center">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                variants={fadeInUp}
              >
                Comece a cuidar de você hoje mesmo.
              </motion.h2>
              <motion.p 
                className="text-lg opacity-80 mb-8"
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
              >
                Junte-se a milhares de profissionais que transformaram sua rotina de trabalho.
              </motion.p>
              
              <motion.ul 
                className="space-y-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {[
                  'Plano Básico Gratuito',
                  'Configuração em 2 minutos',
                  'Relatórios semanais'
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center gap-3"
                    variants={fadeInUp}
                  >
                    <Check className="h-5 w-5 text-primary-foreground/80" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            {/* Right Side - Form */}
            <div className="bg-background p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nome</label>
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-muted/50 border-muted"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Sobrenome</label>
                    <Input
                      type="text"
                      placeholder="Sobrenome"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-muted/50 border-muted"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">E-mail Profissional</label>
                  <Input
                    type="email"
                    placeholder="voce@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted/50 border-muted"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">WhatsApp</label>
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-muted/50 border-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Objetivo Principal</label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-muted bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="saude">Melhorar a saúde da equipe</option>
                    <option value="produtividade">Aumentar produtividade</option>
                    <option value="ergonomia">Programa de ergonomia</option>
                    <option value="compliance">Compliance e NR-17</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80" 
                    size="lg" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Quero Acesso Antecipado'
                    )}
                  </Button>
                </motion.div>
                
                <p className="text-xs text-center text-muted-foreground">
                  Seus dados estão seguros. Respeitamos sua privacidade e não enviamos spam.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="py-12 px-4 border-t"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold">OfficeWell</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Cuidando da saúde no ambiente de trabalho.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">App</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} OfficeWell. Todos os direitos reservados.
          </div>
        </div>
      </motion.footer>

      {/* WhatsApp Float Button */}
      <motion.a
        href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o OfficeWell"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 h-14 w-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 300 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </motion.a>

      <SubscriptionPlans 
        open={plansOpen} 
        onOpenChange={setPlansOpen}
        preSelectedPlan={selectedPlan}
      />
    </div>
  );
};

export default Landing;
