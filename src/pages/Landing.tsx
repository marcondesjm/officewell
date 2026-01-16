import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  Menu,
  Crown,
  Play,
  Cake,
  Megaphone,
  PartyPopper,
  AlertCircle,
  Gift,
  ChevronDown
} from 'lucide-react';

// Import real photos
import heroOfficeTeam from '@/assets/hero-office-team.jpg';
import teamStretching from '@/assets/team-stretching.jpg';
import testimonialWoman1 from '@/assets/testimonial-woman-1.jpg';
import testimonialMan1 from '@/assets/testimonial-man-1.jpg';
import testimonialWoman2 from '@/assets/testimonial-woman-2.jpg';
import officeWellness from '@/assets/office-wellness.jpg';
import logoOfficeWell from '@/assets/logo-officewell.png';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OnboardingTour } from '@/components/OnboardingTour';

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
      
      window.open(`https://wa.me/5548996029392?text=${message}`, '_blank');
      
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
      rating: 5,
      image: testimonialWoman1
    },
    {
      name: 'Carlos Santos',
      role: 'CEO',
      company: 'StartupXYZ',
      text: 'A equipe está mais saudável e produtiva. O investimento se pagou em 2 meses!',
      rating: 5,
      image: testimonialMan1
    },
    {
      name: 'Ana Oliveira',
      role: 'Coordenadora de Bem-estar',
      company: 'BigCompany',
      text: 'Os relatórios de compliance nos ajudam a demonstrar valor para a diretoria.',
      rating: 5,
      image: testimonialWoman2
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'Benefícios', href: '#beneficios' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'Planos', href: '#planos' },
    { label: 'FAQ', href: '#faq' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <img 
              src={logoOfficeWell} 
              alt="OfficeWell - Bem-Estar Home Office" 
              className="h-32 sm:h-40 md:h-48 w-auto object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.25))' }}
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/demo?tour=true" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                <Sparkles className="h-4 w-4 mr-1" />
                Ver Tour
              </Button>
            </Link>
            <Link to="/demo" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Acessar App
              </Button>
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="hidden sm:block">
              <Link to="/demo">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                  Começar Agora
                </Button>
              </Link>
            </motion.div>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-background border-t overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="border-t my-2" />
                <Link to="/demo?tour=true" className="py-3 px-4 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Ver Tour Guiado
                </Link>
                <Link to="/demo" className="py-3 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors block">
                  Acessar App
                </Link>
                <Link to="/demo">
                  <Button 
                    className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Começar Agora
                  </Button>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section - Compact & Impact-focused */}
      <section className="pt-24 pb-8 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          {/* Stats Banner - Above the fold highlight */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={scaleIn}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4"
          >
            <Badge variant="outline" className="px-4 py-2 border-primary/30 bg-primary/5 text-primary font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Teste grátis por 7 dias
            </Badge>
            <Link to="/demo?tour=true">
              <Badge 
                variant="outline" 
                className="px-4 py-2 border-accent/30 bg-accent/5 text-accent font-medium cursor-pointer hover:bg-accent/10 transition-colors"
              >
                <Play className="h-3.5 w-3.5 mr-2" />
                Ver Tour
              </Badge>
            </Link>
          </motion.div>
          
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight"
          >
            Cuide da saúde da sua equipe no trabalho
          </motion.h1>
          
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto"
          >
            Lembretes inteligentes de hidratação, alongamento e descanso visual. 
            Reduza afastamentos e aumente a produtividade.
          </motion.p>
          
          {/* CTAs - Prominent and accessible */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-4 justify-center items-center"
          >
            {/* Primary CTA - Consultoria Gratuita */}
            <motion.a
              href="https://wa.me/5548996029392?text=Olá! Gostaria de agendar uma consultoria gratuita sobre o OfficeWell"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-primary-foreground rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 border border-primary/20"
            >
              <MessageCircle className="h-4 w-4" />
              Consultoria Gratuita
              <ArrowRight className="h-4 w-4" />
            </motion.a>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md" onClick={() => setPlansOpen(true)}>
                  Começar Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
              <Link to="/demo">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="outline" className="px-6">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Ver Demo
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof - Quick testimonials preview */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 rounded-xl bg-muted/30"
          >
            <div className="flex -space-x-3">
              {testimonials.slice(0, 3).map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                >
                  <Avatar className="border-2 border-background h-10 w-10">
                    <img src={t.image} alt={t.name} className="object-cover" />
                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                  </Avatar>
                </motion.div>
              ))}
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">+200 empresas</span> já cuidam de suas equipes com OfficeWell
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll Indicator - After Social Proof */}
      <motion.div 
        className="flex flex-col items-center justify-center py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={() => scrollToSection('#funcionalidades')}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-sm font-medium">Descubra mais</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="p-2 rounded-full border border-muted-foreground/30 group-hover:border-primary/50 transition-colors"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 px-4 bg-muted/30">
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
      <section id="beneficios" className="py-20 px-4">
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
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={teamStretching} 
                  alt="Equipe praticando alongamento no escritório"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <Card className="absolute bottom-4 left-4 right-4 border-none shadow-xl bg-background/95 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <motion.div 
                        className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Clock className="h-5 w-5 text-primary" />
                      </motion.div>
                      <div>
                        <div className="font-semibold text-sm">Próximo lembrete</div>
                        <div className="text-xs text-muted-foreground">em 15 minutos</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: Droplets, label: 'Água', color: 'text-blue-500' },
                        { icon: Activity, label: 'Alongar', color: 'text-green-500' },
                        { icon: Eye, label: 'Visão', color: 'text-purple-500' }
                      ].map((item, index) => (
                        <motion.div 
                          key={index}
                          className="flex flex-col items-center p-2 bg-muted/50 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                          <span className="text-xs font-medium mt-1">{item.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              Escolha seu Plano
              <Sparkles className="h-6 w-6 text-yellow-500" />
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
                  className={`relative border transition-all h-full bg-card backdrop-blur ${
                    plan.popular 
                      ? 'border-primary/50 shadow-lg shadow-primary/20' 
                      : 'border-border hover:border-primary/30'
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
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <p className="text-muted-foreground text-sm">{plan.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
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
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
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
              onClick={() => setPlansOpen(true)}
            >
              <Crown className="h-5 w-5 mr-2 text-yellow-500" />
              Ver Todos os Planos
            </Button>
          </motion.div>
        </div>
      </section>

      {/* HR Panel Demo Section */}
      <section id="como-funciona" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Exclusivo Plano Empresarial
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Painel de RH Completo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gerencie aniversariantes, avisos e comunicados internos para toda a empresa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Birthday Panel Demo */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-none shadow-xl h-full overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      <Cake className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Aniversariantes</CardTitle>
                      <p className="text-sm text-muted-foreground">Janeiro 2026</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {[
                    { name: 'Maria Silva', dept: 'Marketing', day: 15, isToday: true },
                    { name: 'João Santos', dept: 'TI', day: 18, isToday: false },
                    { name: 'Ana Costa', dept: 'RH', day: 20, isToday: false },
                    { name: 'Pedro Oliveira', dept: 'Financeiro', day: 25, isToday: false },
                  ].map((emp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        emp.isToday 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={emp.isToday ? 'bg-primary text-primary-foreground' : ''}>
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{emp.name}</p>
                          {emp.isToday && (
                            <PartyPopper className="h-4 w-4 text-primary animate-bounce" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{emp.dept}</p>
                      </div>
                      <Badge variant={emp.isToday ? 'default' : 'secondary'} className="text-xs">
                        {emp.isToday ? 'Hoje! 🎉' : `Dia ${emp.day}`}
                      </Badge>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Announcements Panel Demo */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-none shadow-xl h-full overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Comunicados</CardTitle>
                      <p className="text-sm text-muted-foreground">Avisos da empresa</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {[
                    { title: 'Reunião Geral', content: 'Reunião da empresa na sexta-feira às 15h no auditório.', priority: 'high', color: 'orange' },
                    { title: 'Novo Benefício', content: 'A partir de fevereiro, todos terão acesso ao Gympass.', priority: 'normal', color: 'blue' },
                    { title: 'Manutenção Programada', content: 'Sistemas ficarão offline no sábado das 22h às 02h.', priority: 'normal', color: 'blue' },
                  ].map((ann, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-md ${
                          ann.priority === 'high' 
                            ? 'bg-orange-500/10 text-orange-500' 
                            : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm">{ann.title}</h4>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {ann.priority === 'high' ? 'Alta' : 'Normal'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {ann.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Birthday Celebration Preview */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <Card className="border-none shadow-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                  <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                  <PartyPopper className="h-10 w-10 text-primary animate-bounce" />
                  <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  🎂 Celebração Automática de Aniversário 🎂
                </h3>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Modal personalizado com confetti aparece automaticamente no horário configurado para celebrar os aniversariantes do dia
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm">
                    <Gift className="h-4 w-4 text-primary" />
                    <span>Imagem personalizada</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span>Mensagem customizada</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Horário agendado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => setPlansOpen(true)}
            >
              <Crown className="h-5 w-5" />
              Quero o Plano Empresarial
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-20 px-4">
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
                        className="h-12 w-12 rounded-full overflow-hidden"
                        whileHover={{ scale: 1.1 }}
                      >
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="h-full w-full object-cover"
                        />
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

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <MessageCircle className="h-4 w-4 mr-2" />
              Dúvidas Frequentes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa saber sobre o OfficeWell
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "O OfficeWell é gratuito?",
                  answer: "Sim! Oferecemos um plano Básico gratuito com lembretes de água, alongamento e descanso visual. Para recursos avançados como relatórios detalhados e painel de RH, temos planos Pro e Empresarial com 7 dias de teste grátis."
                },
                {
                  question: "Como funciona o sistema de lembretes?",
                  answer: "O OfficeWell envia notificações personalizadas no intervalo que você configurar. Você pode definir lembretes para beber água, fazer pausas para alongamento e descansar os olhos. O sistema funciona mesmo quando o navegador está minimizado."
                },
                {
                  question: "Posso usar no celular?",
                  answer: "Sim! O OfficeWell é um PWA (Progressive Web App) que pode ser instalado no seu celular como um aplicativo nativo. Funciona offline e envia notificações push. Basta acessar pelo navegador e clicar em 'Instalar App'."
                },
                {
                  question: "O que é a técnica 20-20-20 para os olhos?",
                  answer: "A técnica 20-20-20 é recomendada por oftalmologistas: a cada 20 minutos, olhe para algo a 20 pés (6 metros) de distância por 20 segundos. Isso ajuda a reduzir a fadiga ocular causada pelo uso prolongado de telas."
                },
                {
                  question: "Como funciona o Painel de RH?",
                  answer: "O Painel de RH (disponível no plano Empresarial) permite gerenciar funcionários, aniversários e comunicados internos. Você pode configurar celebrações automáticas de aniversário com mensagens e imagens personalizadas que aparecem para toda a equipe."
                },
                {
                  question: "Os dados são seguros?",
                  answer: "Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados são armazenados de forma segura e nunca são compartilhados com terceiros. Estamos em conformidade com a LGPD."
                },
                {
                  question: "Posso cancelar a qualquer momento?",
                  answer: "Claro! Você pode cancelar sua assinatura a qualquer momento, sem taxas de cancelamento. Seu acesso continua até o final do período já pago."
                },
                {
                  question: "Como o OfficeWell ajuda na conformidade com NR-17?",
                  answer: "O OfficeWell ajuda empresas a cumprirem requisitos ergonômicos da NR-17 através de pausas regulares, exercícios de alongamento guiados e relatórios de compliance que documentam a adesão da equipe às práticas de saúde ocupacional."
                }
              ].map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-background rounded-xl border-none shadow-md px-6"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-muted-foreground mb-4">
              Ainda tem dúvidas?
            </p>
            <Button 
              size="lg"
              className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg shadow-green-500/25"
              onClick={() => window.open('https://wa.me/5548996029392?text=Olá! Tenho uma dúvida sobre o OfficeWell', '_blank')}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Fale Conosco
            </Button>
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
        href="https://wa.me/5548996029392?text=Olá! Gostaria de saber mais sobre o OfficeWell"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 h-14 w-14 bg-[#25D366] hover:bg-[#128C7E] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 z-50 transition-colors"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 300 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Contato via WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </motion.a>

      <SubscriptionPlans 
        open={plansOpen} 
        onOpenChange={setPlansOpen}
        preSelectedPlan={selectedPlan}
      />

      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
};

export default Landing;
