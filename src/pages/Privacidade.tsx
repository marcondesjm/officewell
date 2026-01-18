import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Privacidade = () => {
  // SEO: Dynamic meta tags and JSON-LD
  useEffect(() => {
    // Update document title
    document.title = 'Política de Privacidade | OfficeWell - LGPD Compliance';
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = 'Política de Privacidade do OfficeWell em conformidade com a LGPD (Lei 13.709/2018). Saiba como coletamos, usamos e protegemos seus dados pessoais.';
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
      canonical.href = 'https://officewell.lovable.app/privacidade';
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = 'https://officewell.lovable.app/privacidade';
      document.head.appendChild(canonical);
    }

    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'Política de Privacidade | OfficeWell' },
      { property: 'og:description', content: descriptionContent },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://officewell.lovable.app/privacidade' },
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

    // JSON-LD Structured Data for Privacy Policy
    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'privacy-policy-jsonld';
    jsonLdScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Política de Privacidade",
      "description": descriptionContent,
      "url": "https://officewell.lovable.app/privacidade",
      "inLanguage": "pt-BR",
      "isPartOf": {
        "@type": "WebSite",
        "name": "OfficeWell",
        "url": "https://officewell.lovable.app"
      },
      "about": {
        "@type": "Thing",
        "name": "Proteção de Dados Pessoais",
        "description": "Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)"
      },
      "mainEntity": {
        "@type": "Article",
        "@id": "https://officewell.lovable.app/privacidade#article",
        "headline": "Política de Privacidade do OfficeWell",
        "description": "Como o OfficeWell coleta, usa, armazena e protege suas informações pessoais em conformidade com a LGPD.",
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
          "@id": "https://officewell.lovable.app/privacidade"
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
            "name": "Política de Privacidade",
            "item": "https://officewell.lovable.app/privacidade"
          }
        ]
      }
    });
    document.head.appendChild(jsonLdScript);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById('privacy-policy-jsonld');
      if (existingScript) {
        existingScript.remove();
      }
      // Restore original title
      document.title = 'OfficeWell | Bem-estar e Produtividade no Home Office';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
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
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Política de Privacidade</h1>
            <p className="text-muted-foreground text-lg">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="prose prose-gray dark:prose-invert max-w-none">
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <p className="text-lg leading-relaxed">
                A OfficeWell está comprometida com a proteção da sua privacidade. Esta Política de Privacidade 
                explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade 
                com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </div>
          </section>

          {/* Sections */}
          <div className="space-y-6">
            {/* Section 1 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">1. Dados que Coletamos</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>Coletamos os seguintes tipos de informações:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Dados de identificação:</strong> nome, e-mail corporativo, cargo e departamento</li>
                  <li><strong>Dados de uso:</strong> histórico de pausas realizadas, preferências de configuração e metas atingidas</li>
                  <li><strong>Dados técnicos:</strong> tipo de navegador, sistema operacional, endereço IP e cookies</li>
                  <li><strong>Dados de saúde ocupacional:</strong> frequência de pausas, tempo de trabalho contínuo (quando autorizado)</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">2. Como Utilizamos seus Dados</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>Utilizamos seus dados para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Personalizar sua experiência e lembretes de bem-estar</li>
                  <li>Gerar relatórios de conformidade para o setor de RH (dados anonimizados)</li>
                  <li>Melhorar nossos serviços e funcionalidades</li>
                  <li>Enviar comunicações relevantes sobre o serviço</li>
                  <li>Cumprir obrigações legais e regulatórias</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">3. Base Legal para Tratamento</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>O tratamento de dados pessoais é realizado com base nas seguintes hipóteses legais (Art. 7º da LGPD):</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Consentimento:</strong> quando você aceita expressamente o uso de cookies e funcionalidades opcionais</li>
                  <li><strong>Execução de contrato:</strong> para fornecer os serviços contratados pela sua empresa</li>
                  <li><strong>Legítimo interesse:</strong> para melhorar nossos serviços e garantir a segurança da plataforma</li>
                  <li><strong>Cumprimento de obrigação legal:</strong> para atender requisitos de saúde ocupacional (NR-17)</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">4. Seus Direitos (LGPD)</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>Conforme a LGPD, você tem direito a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
                  <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li><strong>Anonimização ou eliminação:</strong> solicitar a anonimização ou exclusão de dados desnecessários</li>
                  <li><strong>Portabilidade:</strong> transferir seus dados para outro fornecedor</li>
                  <li><strong>Revogação do consentimento:</strong> retirar seu consentimento a qualquer momento</li>
                  <li><strong>Informação:</strong> saber com quem compartilhamos seus dados</li>
                  <li><strong>Oposição:</strong> se opor ao tratamento em determinadas situações</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">5. Segurança dos Dados</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Criptografia de dados em trânsito (SSL/TLS) e em repouso</li>
                  <li>Controle de acesso baseado em funções (RBAC)</li>
                  <li>Monitoramento contínuo e detecção de ameaças</li>
                  <li>Backups regulares e plano de recuperação de desastres</li>
                  <li>Treinamento de equipe em proteção de dados</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">6. Compartilhamento de Dados</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>Seus dados podem ser compartilhados com:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Setor de RH da sua empresa:</strong> relatórios agregados e anonimizados de conformidade</li>
                  <li><strong>Prestadores de serviços:</strong> empresas que nos auxiliam na operação (hospedagem, análise)</li>
                  <li><strong>Autoridades:</strong> quando exigido por lei ou ordem judicial</li>
                </ul>
                <p className="mt-4">
                  <strong>Não vendemos</strong> seus dados pessoais a terceiros para fins de marketing.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">7. Cookies e Tecnologias</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>Utilizamos cookies e tecnologias similares para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Cookies essenciais:</strong> necessários para o funcionamento básico do serviço</li>
                  <li><strong>Cookies de preferências:</strong> salvam suas configurações e preferências</li>
                  <li><strong>Cookies analíticos:</strong> nos ajudam a entender como você usa a plataforma</li>
                </ul>
                <p className="mt-4">
                  Você pode gerenciar suas preferências de cookies através do banner de consentimento ou nas configurações do navegador.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">8. Retenção de Dados</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>Mantemos seus dados pelo tempo necessário para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Prestar os serviços contratados</li>
                  <li>Cumprir obrigações legais e regulatórias</li>
                  <li>Exercer direitos em processos judiciais</li>
                </ul>
                <p className="mt-4">
                  Após o encerramento do contrato, os dados são anonimizados ou excluídos em até 90 dias, 
                  salvo obrigação legal de retenção.
                </p>
              </div>
            </section>

            {/* Section 9 - Contact */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">9. Contato e Encarregado (DPO)</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política:</p>
                <div className="bg-muted/50 rounded-lg p-4 mt-4 space-y-2">
                  <p><strong>Encarregado de Proteção de Dados (DPO):</strong></p>
                  <p>E-mail: <a href="mailto:privacidade@officewell.app" className="text-primary hover:underline">privacidade@officewell.app</a></p>
                  <p>Responderemos sua solicitação em até 15 dias úteis.</p>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">10. Alterações nesta Política</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Esta política pode ser atualizada periodicamente. Notificaremos você sobre mudanças 
                  significativas através do e-mail cadastrado ou aviso na plataforma. Recomendamos 
                  revisar esta página regularmente.
                </p>
              </div>
            </section>
          </div>

          {/* Footer CTA */}
          <div className="text-center pt-8 space-y-4">
            <p className="text-muted-foreground">
              Ao utilizar o OfficeWell, você concorda com esta Política de Privacidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/landing">Voltar para o Início</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:privacidade@officewell.app">Falar com o DPO</a>
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
            Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Privacidade;
