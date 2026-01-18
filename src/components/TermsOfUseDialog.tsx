import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Shield, Scale, AlertTriangle, Users, Ban, RefreshCw, Mail } from "lucide-react";

interface TermsOfUseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsOfUseDialog = ({ open, onOpenChange }: TermsOfUseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Scale className="h-6 w-6 text-primary" />
            Termos de Uso
          </DialogTitle>
          <DialogDescription>
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] px-6 pb-6">
          <div className="space-y-8 py-4 text-sm text-muted-foreground">
            {/* Introdução */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">1. Aceitação dos Termos</h3>
              </div>
              <p className="leading-relaxed">
                Ao acessar e utilizar o aplicativo OfficeWell ("Aplicativo"), você concorda expressamente 
                com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, 
                por favor, não utilize o Aplicativo.
              </p>
              <p className="leading-relaxed">
                O OfficeWell é um aplicativo de bem-estar corporativo que oferece lembretes para 
                pausas ergonômicas, hidratação e descanso visual, desenvolvido em conformidade com 
                a NR-17 (Norma Regulamentadora de Ergonomia) do Ministério do Trabalho.
              </p>
            </section>

            {/* Descrição do Serviço */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">2. Descrição do Serviço</h3>
              </div>
              <p className="leading-relaxed">O OfficeWell oferece os seguintes recursos:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Lembretes de Descanso Visual:</strong> Notificações baseadas na regra 20-20-20 para proteção ocular</li>
                <li><strong>Lembretes de Alongamento:</strong> Pausas ergonômicas conforme NR-17</li>
                <li><strong>Lembretes de Hidratação:</strong> Alertas para manutenção da hidratação adequada</li>
                <li><strong>Gamificação:</strong> Sistema de pontos e conquistas para engajamento</li>
                <li><strong>Painel RH:</strong> Gestão de funcionários e comunicados (planos empresariais)</li>
                <li><strong>Relatórios de Compliance:</strong> Acompanhamento de adesão às práticas de saúde</li>
              </ul>
            </section>

            {/* Requisitos */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">3. Requisitos e Elegibilidade</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Você deve ter pelo menos 18 anos ou ter autorização de um responsável legal</li>
                <li>Você deve fornecer informações precisas e verdadeiras durante o cadastro</li>
                <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso</li>
                <li>O uso do Aplicativo é pessoal e intransferível, exceto em planos empresariais</li>
              </ul>
            </section>

            {/* Responsabilidades do Usuário */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-lg text-foreground">4. Responsabilidades do Usuário</h3>
              </div>
              <p className="leading-relaxed">Ao utilizar o OfficeWell, você concorda em:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utilizar o Aplicativo apenas para fins legais e autorizados</li>
                <li>Não tentar acessar áreas restritas ou sistemas não autorizados</li>
                <li>Não interferir no funcionamento do Aplicativo ou de outros usuários</li>
                <li>Não reproduzir, copiar, vender ou revender qualquer parte do serviço</li>
                <li>Manter suas informações de conta atualizadas</li>
                <li>Reportar imediatamente qualquer uso não autorizado de sua conta</li>
              </ul>
            </section>

            {/* Limitações de Responsabilidade */}
            <section className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-lg text-foreground">5. Limitações de Responsabilidade</h3>
              </div>
              <p className="leading-relaxed font-medium text-foreground">
                IMPORTANTE: Leia atentamente esta seção.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  O OfficeWell <strong>não substitui orientação médica profissional</strong>. 
                  Consulte sempre um profissional de saúde para questões específicas.
                </li>
                <li>
                  Os lembretes são sugestões baseadas em diretrizes gerais de ergonomia e 
                  podem não ser adequados para todas as condições de saúde.
                </li>
                <li>
                  Não garantimos que o uso do Aplicativo prevenirá lesões ou problemas de saúde.
                </li>
                <li>
                  O serviço é fornecido "como está", sem garantias expressas ou implícitas 
                  de qualquer natureza.
                </li>
                <li>
                  Não nos responsabilizamos por danos diretos, indiretos, incidentais ou 
                  consequenciais decorrentes do uso do Aplicativo.
                </li>
              </ul>
            </section>

            {/* Propriedade Intelectual */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">6. Propriedade Intelectual</h3>
              </div>
              <p className="leading-relaxed">
                Todo o conteúdo do OfficeWell, incluindo mas não limitado a textos, gráficos, 
                logotipos, ícones, imagens, clipes de áudio, downloads digitais e compilações 
                de dados, é de propriedade exclusiva do OfficeWell ou de seus licenciadores e 
                está protegido pelas leis brasileiras e internacionais de direitos autorais.
              </p>
              <p className="leading-relaxed">
                O uso não autorizado de qualquer material pode violar leis de direitos autorais, 
                marcas registradas e outras legislações aplicáveis.
              </p>
            </section>

            {/* Planos e Pagamentos */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">7. Planos, Pagamentos e Cancelamentos</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">7.1 Plano Gratuito</h4>
                  <p>Oferece funcionalidades básicas sem custo, com acesso limitado a recursos premium.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">7.2 Planos Pagos</h4>
                  <p>
                    Planos Pro e Empresarial são cobrados conforme período selecionado (mensal ou anual). 
                    O período de teste gratuito de 7 dias está disponível para novos usuários.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">7.3 Cancelamento</h4>
                  <p>
                    Você pode cancelar sua assinatura a qualquer momento. O acesso aos recursos premium 
                    continuará até o final do período de cobrança atual. Não há reembolsos parciais.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">7.4 Alterações de Preço</h4>
                  <p>
                    Reservamo-nos o direito de alterar os preços dos planos. Você será notificado 
                    com pelo menos 30 dias de antecedência sobre qualquer alteração.
                  </p>
                </div>
              </div>
            </section>

            {/* Privacidade */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">8. Privacidade e Proteção de Dados</h3>
              </div>
              <p className="leading-relaxed">
                O tratamento de seus dados pessoais é regido por nossa Política de Privacidade, 
                que está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). 
                Ao utilizar o OfficeWell, você também concorda com nossa Política de Privacidade.
              </p>
              <p className="leading-relaxed">
                Seus dados são armazenados de forma segura e utilizados apenas para os fins 
                descritos em nossa Política de Privacidade.
              </p>
            </section>

            {/* Modificações */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">9. Modificações dos Termos</h3>
              </div>
              <p className="leading-relaxed">
                Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                As modificações entrarão em vigor imediatamente após a publicação no Aplicativo. 
                O uso continuado do serviço após as modificações constitui aceitação dos novos termos.
              </p>
              <p className="leading-relaxed">
                Para alterações significativas, notificaremos você por e-mail ou através de 
                um aviso proeminente no Aplicativo.
              </p>
            </section>

            {/* Rescisão */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                <h3 className="font-bold text-lg text-foreground">10. Rescisão</h3>
              </div>
              <p className="leading-relaxed">
                Podemos suspender ou encerrar seu acesso ao Aplicativo imediatamente, 
                sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, 
                sem limitação, se você violar estes Termos de Uso.
              </p>
              <p className="leading-relaxed">
                Você pode encerrar sua conta a qualquer momento, excluindo seus dados 
                através das configurações do Aplicativo ou entrando em contato conosco.
              </p>
            </section>

            {/* Lei Aplicável */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">11. Lei Aplicável e Foro</h3>
              </div>
              <p className="leading-relaxed">
                Estes Termos de Uso são regidos e interpretados de acordo com as leis da 
                República Federativa do Brasil. Fica eleito o foro da comarca de Florianópolis, 
                Estado de Santa Catarina, para dirimir quaisquer controvérsias decorrentes 
                destes termos, com exclusão de qualquer outro, por mais privilegiado que seja.
              </p>
            </section>

            {/* Contato */}
            <section className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">12. Contato</h3>
              </div>
              <p className="leading-relaxed">
                Para dúvidas, sugestões ou reclamações sobre estes Termos de Uso, 
                entre em contato conosco:
              </p>
              <ul className="list-none space-y-1 ml-4">
                <li><strong>E-mail:</strong> contato@officewell.com.br</li>
                <li><strong>WhatsApp:</strong> +55 (48) 99602-9392</li>
              </ul>
            </section>

            {/* Disposições Finais */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">13. Disposições Finais</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Se qualquer disposição destes Termos for considerada inválida ou inexequível, 
                  as demais disposições permanecerão em pleno vigor e efeito.
                </li>
                <li>
                  A falha em exercer ou fazer cumprir qualquer direito ou disposição destes 
                  Termos não constituirá renúncia a tal direito ou disposição.
                </li>
                <li>
                  Estes Termos constituem o acordo integral entre você e o OfficeWell 
                  em relação ao uso do Aplicativo.
                </li>
              </ul>
            </section>

            {/* Versão */}
            <div className="pt-4 border-t border-border text-xs text-muted-foreground/70">
              <p>Versão dos Termos: 1.0.0</p>
              <p>Data de vigência: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-0">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Entendi e Aceito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook para controlar o dialog
export const useTermsOfUse = () => {
  const [open, setOpen] = useState(false);
  return { open, setOpen, openTerms: () => setOpen(true) };
};
