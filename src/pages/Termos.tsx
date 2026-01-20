import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, FileText, Shield, Users, AlertTriangle, Ban, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Termos = () => {
  // SEO: Dynamic meta tags and JSON-LD
  useEffect(() => {
    // Update document title
    document.title = 'Termos de Uso | OfficeWell - Aplicativo de Bem-estar Corporativo';
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = 'Termos de Uso do OfficeWell. Conheça as regras, direitos e responsabilidades ao utilizar nosso aplicativo de bem-estar corporativo.';
    if (metaDescription) {
      metaDescription.setAttribute('content', descriptionContent);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = descriptionContent;
      document.head.appendChild(meta);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = 'https://officewell.lovable.app/termos';
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = 'https://officewell.lovable.app/termos';
      document.head.appendChild(canonical);
    }

    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'Termos de Uso | OfficeWell' },
      { property: 'og:description', content: descriptionContent },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://officewell.lovable.app/termos' },
    ];

    ogTags.forEach(({ property, content }) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

    // JSON-LD Structured Data for Terms of Use
    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'terms-of-use-jsonld';
    jsonLdScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Termos de Uso",
      "description": descriptionContent,
      "url": "https://officewell.lovable.app/termos",
      "inLanguage": "pt-BR",
      "isPartOf": {
        "@type": "WebSite",
        "name": "OfficeWell",
        "url": "https://officewell.lovable.app"
      },
      "about": {
        "@type": "Thing",
        "name": "Termos e Condições de Uso",
        "description": "Regras e condições para utilização do aplicativo OfficeWell"
      },
      "mainEntity": {
        "@type": "Article",
        "@id": "https://officewell.lovable.app/termos#article",
        "headline": "Termos de Uso do OfficeWell",
        "description": "Conheça as regras, direitos e responsabilidades ao utilizar o aplicativo OfficeWell de bem-estar corporativo.",
        "author": {
          "@type": "Organization",
          "name": "OfficeWell",
          "url": "https://officewell.lovable.app"
        },
        "publisher": {
          "@type": "Organization",
          "name": "OfficeWell",
          "url": "https://officewell.lovable.app"
        },
        "datePublished": "2024-01-01",
        "dateModified": new Date().toISOString().split('T')[0],
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://officewell.lovable.app/termos"
        }
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": "https://officewell.lovable.app"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Termos de Uso",
            "item": "https://officewell.lovable.app/termos"
          }
        ]
      }
    });
    document.head.appendChild(jsonLdScript);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById('terms-of-use-jsonld');
      if (existingScript) {
        existingScript.remove();
      }
      // Restore original title
      document.title = 'OfficeWell | Bem-estar e Produtividade no Home Office';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">OfficeWell</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Termos de Uso</h1>
            <p className="text-muted-foreground text-lg">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="prose prose-gray dark:prose-invert max-w-none">
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <p className="text-lg leading-relaxed">
                Ao acessar e utilizar o aplicativo OfficeWell ("Aplicativo"), você concorda expressamente 
                com estes Termos de Uso. O OfficeWell é um aplicativo de bem-estar corporativo desenvolvido 
                em conformidade com a NR-17 (Norma Regulamentadora de Ergonomia) do Ministério do Trabalho.
              </p>
            </div>
          </section>

          {/* Sections */}
          <div className="space-y-6">
            {/* Section 1 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Ao acessar e utilizar o aplicativo OfficeWell, você concorda expressamente 
                  com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, 
                  por favor, não utilize o Aplicativo.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">2. Descrição do Serviço</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>O OfficeWell oferece os seguintes recursos:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Lembretes de Descanso Visual:</strong> Notificações baseadas na regra 20-20-20 para proteção ocular</li>
                  <li><strong>Lembretes de Alongamento:</strong> Pausas ergonômicas conforme NR-17</li>
                  <li><strong>Lembretes de Hidratação:</strong> Alertas para manutenção da hidratação adequada</li>
                  <li><strong>Gamificação:</strong> Sistema de pontos e conquistas para engajamento</li>
                  <li><strong>Painel RH:</strong> Gestão de funcionários e comunicados (planos empresariais)</li>
                  <li><strong>Relatórios de Compliance:</strong> Acompanhamento de adesão às práticas de saúde</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">3. Requisitos e Elegibilidade</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Você deve ter pelo menos 18 anos ou ter autorização de um responsável legal</li>
                  <li>Você deve fornecer informações precisas e verdadeiras durante o cadastro</li>
                  <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso</li>
                  <li>O uso do Aplicativo é pessoal e intransferível, exceto em planos empresariais</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold">4. Responsabilidades do Usuário</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>Ao utilizar o OfficeWell, você concorda em:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Utilizar o Aplicativo apenas para fins legais e autorizados</li>
                  <li>Não tentar acessar áreas restritas ou sistemas não autorizados</li>
                  <li>Não interferir no funcionamento do Aplicativo ou de outros usuários</li>
                  <li>Não reproduzir, copiar, vender ou revender qualquer parte do serviço</li>
                  <li>Manter suas informações de conta atualizadas</li>
                  <li>Reportar imediatamente qualquer uso não autorizado de sua conta</li>
                </ul>
              </div>
            </section>

            {/* Section 5 - Warning Box */}
            <section className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Ban className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold">5. Limitações de Responsabilidade</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-medium text-foreground">IMPORTANTE: Leia atentamente esta seção.</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>O OfficeWell <strong>não substitui orientação médica profissional</strong>. Consulte sempre um profissional de saúde para questões específicas.</li>
                  <li>Os lembretes são sugestões baseadas em diretrizes gerais de ergonomia e podem não ser adequados para todas as condições de saúde.</li>
                  <li>Não garantimos que o uso do Aplicativo prevenirá lesões ou problemas de saúde.</li>
                  <li>O serviço é fornecido "como está", sem garantias expressas ou implícitas de qualquer natureza.</li>
                  <li>Não nos responsabilizamos por danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso do Aplicativo.</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">6. Propriedade Intelectual</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Todo o conteúdo do OfficeWell, incluindo mas não limitado a textos, gráficos, 
                  logotipos, ícones, imagens, clipes de áudio, downloads digitais e compilações 
                  de dados, é de propriedade exclusiva do OfficeWell ou de seus licenciadores e 
                  está protegido pelas leis brasileiras e internacionais de direitos autorais.
                </p>
                <p>
                  O uso não autorizado de qualquer material pode violar leis de direitos autorais, 
                  marcas registradas e outras legislações aplicáveis.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">7. Planos, Pagamentos e Cancelamentos</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">7.1 Plano Gratuito</h4>
                  <p>Oferece funcionalidades básicas sem custo, com acesso limitado a recursos premium.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">7.2 Planos Pagos</h4>
                  <p>Planos Pro e Empresarial são cobrados conforme período selecionado (mensal ou anual). O período de teste gratuito de 7 dias está disponível para novos usuários.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">7.3 Cancelamento</h4>
                  <p>Você pode cancelar sua assinatura a qualquer momento. O acesso aos recursos premium continuará até o final do período de cobrança atual. Não há reembolsos parciais.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">7.4 Alterações de Preço</h4>
                  <p>Reservamo-nos o direito de alterar os preços dos planos. Você será notificado com pelo menos 30 dias de antecedência sobre qualquer alteração.</p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">8. Privacidade e Proteção de Dados</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  O tratamento de seus dados pessoais é regido por nossa{' '}
                  <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>, 
                  que está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). 
                  Ao utilizar o OfficeWell, você também concorda com nossa Política de Privacidade.
                </p>
                <p>
                  Seus dados são armazenados de forma segura e utilizados apenas para os fins 
                  descritos em nossa Política de Privacidade.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">9. Modificações dos Termos</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                  As modificações entrarão em vigor imediatamente após a publicação no Aplicativo. 
                  O uso continuado do serviço após as modificações constitui aceitação dos novos termos.
                </p>
                <p>
                  Para alterações significativas, notificaremos você por e-mail ou através de 
                  um aviso proeminente no Aplicativo.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Ban className="h-5 w-5 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">10. Rescisão</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Podemos suspender ou encerrar seu acesso ao Aplicativo imediatamente, 
                  sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, 
                  sem limitação, se você violar estes Termos de Uso.
                </p>
                <p>
                  Você pode encerrar sua conta a qualquer momento, excluindo seus dados 
                  através das configurações do Aplicativo ou entrando em contato conosco.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">11. Lei Aplicável e Foro</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Estes Termos de Uso são regidos e interpretados de acordo com as leis da 
                  República Federativa do Brasil. Fica eleito o foro da comarca de Florianópolis, 
                  Estado de Santa Catarina, para dirimir quaisquer controvérsias decorrentes 
                  destes termos, com exclusão de qualquer outro, por mais privilegiado que seja.
                </p>
              </div>
            </section>

            {/* Section 12 - Contact */}
            <section className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">12. Contato</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Para dúvidas, sugestões ou reclamações sobre estes Termos de Uso, 
                  entre em contato conosco:
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p><strong>E-mail:</strong> <a href="mailto:contato@officewell.com.br" className="text-primary hover:underline">contato@officewell.com.br</a></p>
                  <p><strong>WhatsApp:</strong> <a href="https://wa.me/5548996029392" className="text-primary hover:underline">+55 (48) 99602-9392</a></p>
                </div>
              </div>
            </section>

            {/* Section 13 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">13. Disposições Finais</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Se qualquer disposição destes Termos for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.</li>
                  <li>A falha em exercer ou fazer cumprir qualquer direito ou disposição destes Termos não constituirá renúncia a tal direito ou disposição.</li>
                  <li>Estes Termos constituem o acordo integral entre você e o OfficeWell em relação ao uso do Aplicativo.</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Version Info */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>Versão dos Termos: 1.0.0</p>
            <p>Data de vigência: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          {/* Footer CTA */}
          <div className="text-center pt-8 space-y-4">
            <p className="text-muted-foreground">
              Ao utilizar o OfficeWell, você concorda com estes Termos de Uso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/landing">Voltar para o Início</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/privacidade">Ver Política de Privacidade</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} OfficeWell. Todos os direitos reservados.</p>
          <p className="mt-2">
            Em conformidade com a legislação brasileira
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Termos;
