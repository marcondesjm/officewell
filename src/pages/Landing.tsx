import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  Eye, 
  Activity, 
  Bell, 
  Users, 
  BarChart3, 
  Shield, 
  Smartphone,
  Check,
  ArrowRight,
  Clock,
  Heart,
  Building2,
  Sparkles,
  Star,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error('Por favor, preencha nome e email');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Open WhatsApp with the lead info
    const message = encodeURIComponent(
      `🎯 *Novo Lead - OfficeWell*\n\n` +
      `📧 Nome: ${name}\n` +
      `📧 Email: ${email}\n` +
      `🏢 Empresa: ${company || 'Não informada'}\n\n` +
      `Tenho interesse em conhecer mais sobre o OfficeWell!`
    );
    
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
    
    toast.success('Obrigado pelo interesse! Entraremos em contato em breve.');
    setEmail('');
    setName('');
    setCompany('');
    setLoading(false);
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
      price: 'Grátis',
      period: '',
      description: 'Para experimentar o app',
      features: [
        'Lembretes de água, alongamento e visão',
        'Estatísticas básicas',
        'Até 3 funcionários',
        'Com anúncios'
      ],
      popular: false,
      cta: 'Começar Grátis'
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 'R$ 29,90',
      period: '/mês',
      description: 'Para pequenas equipes',
      features: [
        'Tudo do plano Básico',
        'Sem anúncios',
        'Relatórios detalhados',
        'Metas personalizadas',
        'Funcionários ilimitados',
        'Suporte por email'
      ],
      popular: true,
      cta: 'Testar 7 dias grátis'
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 'R$ 99,90',
      period: '/mês',
      description: 'Para grandes empresas',
      features: [
        'Tudo do plano Pro',
        'Painel RH completo',
        'Relatórios de compliance',
        'Gestão de aniversários',
        'Comunicados internos',
        'Suporte dedicado',
        'API de integração'
      ],
      popular: false,
      cta: 'Testar 7 dias grátis'
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">OfficeWell</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost">Acessar App</Button>
            </Link>
            <Button onClick={() => setPlansOpen(true)}>
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Teste grátis por 7 dias
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Cuide da saúde da sua equipe no trabalho
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lembretes inteligentes de hidratação, alongamento e descanso visual. 
            Reduza afastamentos e aumente a produtividade.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8" onClick={() => setPlansOpen(true)}>
              Começar Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Smartphone className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">+5.000</div>
              <div className="text-sm text-muted-foreground">Usuários ativos</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfação</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">-40%</div>
              <div className="text-sm text-muted-foreground">Afastamentos</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">+200</div>
              <div className="text-sm text-muted-foreground">Empresas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para cuidar da sua equipe
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades pensadas para empresas que valorizam a saúde dos colaboradores
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Por que escolher o OfficeWell?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Empresas que investem em bem-estar têm colaboradores mais engajados, 
                produtivos e saudáveis.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-3xl" />
              <Card className="relative border-none shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Próximo lembrete</div>
                      <div className="text-sm text-muted-foreground">em 15 minutos</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Beber Água</span>
                      </div>
                      <Badge variant="secondary">30 min</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Alongamento</span>
                      </div>
                      <Badge variant="secondary">1h</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Descanso Visual</span>
                      </div>
                      <Badge variant="secondary">20 min</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos para todos os tamanhos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comece grátis e faça upgrade quando precisar de mais recursos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative border-2 transition-all hover:shadow-xl ${
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  <div className="py-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} - {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comece a cuidar da sua equipe hoje
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Cadastre-se e receba acesso imediato. Teste grátis por 7 dias.
          </p>
          
          <Card className="bg-background text-foreground max-w-md mx-auto">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="Nome da empresa (opcional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Enviando...' : 'Quero Testar Grátis'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
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
                <li><Link to="/" className="hover:text-foreground">App</Link></li>
                <li><a href="#" className="hover:text-foreground">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-foreground">Preços</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} OfficeWell. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o OfficeWell"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 h-14 w-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-50"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </a>

      <SubscriptionPlans 
        open={plansOpen} 
        onOpenChange={setPlansOpen}
        preSelectedPlan={selectedPlan}
      />
    </div>
  );
};

export default Landing;
