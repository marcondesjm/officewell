import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Cookie, FileText, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  functionality: boolean;
  acceptedAt: string | null;
  version: string;
}

const CONSENT_VERSION = "1.0.0";
const CONSENT_KEY = "officewell_lgpd_consent";

const getStoredConsent = (): ConsentPreferences | null => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Verificar se a versão é a mesma
      if (parsed.version === CONSENT_VERSION) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar consentimento:", e);
  }
  return null;
};

export const useLGPDConsent = () => {
  const [consent, setConsent] = useState<ConsentPreferences | null>(getStoredConsent);

  const hasConsent = consent !== null && consent.acceptedAt !== null;
  const hasAnalyticsConsent = consent?.analytics ?? false;
  const hasFunctionalityConsent = consent?.functionality ?? false;

  const saveConsent = (preferences: Partial<ConsentPreferences>) => {
    const newConsent: ConsentPreferences = {
      essential: true, // Sempre obrigatório
      analytics: preferences.analytics ?? false,
      functionality: preferences.functionality ?? false,
      acceptedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
    setConsent(newConsent);
  };

  const revokeConsent = () => {
    localStorage.removeItem(CONSENT_KEY);
    setConsent(null);
  };

  return {
    consent,
    hasConsent,
    hasAnalyticsConsent,
    hasFunctionalityConsent,
    saveConsent,
    revokeConsent,
  };
};

export const LGPDConsentBanner = () => {
  const { consent, hasConsent, saveConsent } = useLGPDConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: true,
    functionality: true,
  });

  useEffect(() => {
    // Mostrar banner apenas se não houver consentimento
    if (!hasConsent) {
      // Pequeno delay para não aparecer imediatamente
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasConsent]);

  const handleAcceptAll = () => {
    saveConsent({
      analytics: true,
      functionality: true,
    });
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    saveConsent({
      analytics: false,
      functionality: false,
    });
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-card/95 backdrop-blur-lg border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    🔒 Sua Privacidade é Importante
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    O OfficeWell utiliza cookies e tecnologias similares para melhorar sua experiência, 
                    personalizar conteúdo e analisar nosso tráfego. Em conformidade com a{" "}
                    <strong>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong>, 
                    solicitamos seu consentimento para processar seus dados.
                  </p>
                </div>
              </div>

              {/* Detalhes expansíveis */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showDetails ? "Ocultar detalhes" : "Personalizar preferências"}
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-4 border-t border-border">
                      {/* Cookies Essenciais */}
                      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                        <Checkbox id="essential" checked disabled className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="essential" className="font-semibold text-foreground">
                            🍪 Cookies Essenciais (Obrigatório)
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Necessários para o funcionamento básico do aplicativo, como salvar suas 
                            configurações de expediente e preferências de tema.
                          </p>
                        </div>
                      </div>

                      {/* Cookies de Funcionalidade */}
                      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                        <Checkbox
                          id="functionality"
                          checked={preferences.functionality}
                          onCheckedChange={(checked) =>
                            setPreferences((p) => ({ ...p, functionality: checked as boolean }))
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor="functionality" className="font-semibold text-foreground cursor-pointer">
                            ⚡ Cookies de Funcionalidade
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Permitem recursos avançados como gamificação, metas pessoais, 
                            histórico de atividades e sincronização entre dispositivos.
                          </p>
                        </div>
                      </div>

                      {/* Cookies de Analytics */}
                      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                        <Checkbox
                          id="analytics"
                          checked={preferences.analytics}
                          onCheckedChange={(checked) =>
                            setPreferences((p) => ({ ...p, analytics: checked as boolean }))
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor="analytics" className="font-semibold text-foreground cursor-pointer">
                            📊 Cookies de Análise
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Nos ajudam a entender como você usa o aplicativo para que possamos 
                            melhorar continuamente a experiência.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {showDetails ? (
                  <Button
                    onClick={handleSavePreferences}
                    className="min-h-12 px-6 gradient-primary font-semibold rounded-xl flex-1 touch-manipulation active:scale-95 transition-transform"
                  >
                    Salvar Preferências
                  </Button>
                ) : (
                  <Button
                    onClick={handleAcceptAll}
                    className="min-h-12 px-6 gradient-primary font-semibold rounded-xl flex-1 touch-manipulation active:scale-95 transition-transform"
                  >
                    ✓ Aceitar Todos
                  </Button>
                )}
                <Button
                  onClick={handleAcceptEssential}
                  variant="outline"
                  className="min-h-12 px-6 font-semibold rounded-xl border-2 touch-manipulation active:scale-95 transition-transform"
                >
                  Apenas Essenciais
                </Button>
              </div>

              {/* Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                <button
                  onClick={() => setShowPrivacyPolicy(true)}
                  className="flex items-center gap-1 hover:text-primary transition-colors underline underline-offset-2"
                >
                  <FileText size={12} />
                  Política de Privacidade
                </button>
                <span>•</span>
                <button
                  onClick={() => setShowPrivacyPolicy(true)}
                  className="flex items-center gap-1 hover:text-primary transition-colors underline underline-offset-2"
                >
                  <Cookie size={12} />
                  Política de Cookies
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modal de Política de Privacidade */}
      <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-primary" />
              Política de Privacidade e Proteção de Dados
            </DialogTitle>
            <DialogDescription>
              Em conformidade com a LGPD (Lei 13.709/2018)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4 text-sm text-muted-foreground">
            <section className="space-y-2">
              <h4 className="font-bold text-foreground">1. Controlador dos Dados</h4>
              <p>
                O OfficeWell é responsável pelo tratamento dos seus dados pessoais conforme 
                descrito nesta política.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-foreground">2. Dados Coletados</h4>
              <p>Coletamos e processamos os seguintes dados:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Dados de configuração:</strong> Horário de expediente, preferências de notificação</li>
                <li><strong>Dados de uso:</strong> Interações com lembretes, metas cumpridas, pontuação</li>
                <li><strong>Dados técnicos:</strong> Informações do dispositivo para funcionamento do PWA</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-foreground">3. Finalidade do Tratamento</h4>
              <p>Seus dados são utilizados para:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Personalizar lembretes de saúde conforme seu expediente</li>
                <li>Salvar seu progresso e configurações</li>
                <li>Melhorar a experiência do usuário</li>
                <li>Gerar estatísticas anônimas de uso</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-foreground">4. Base Legal (Art. 7º LGPD)</h4>
              <p>O tratamento é baseado em:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Consentimento (Art. 7º, I):</strong> Para cookies de funcionalidade e análise</li>
                <li><strong>Execução de contrato (Art. 7º, V):</strong> Para funcionamento básico do serviço</li>
                <li><strong>Legítimo interesse (Art. 7º, IX):</strong> Para melhorias e segurança</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-foreground">5. Armazenamento</h4>
              <p>
                Seus dados são armazenados localmente no seu dispositivo (localStorage) e, 
                quando aplicável, em servidores seguros com criptografia.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-foreground">6. Seus Direitos (Art. 18 LGPD)</h4>
              <p>Você tem direito a:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Confirmar a existência de tratamento</li>
                <li>Acessar seus dados</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar anonimização, bloqueio ou eliminação</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Portabilidade dos dados</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-foreground">7. Retenção de Dados</h4>
              <p>
                Os dados são mantidos enquanto você utilizar o aplicativo ou até que solicite 
                sua exclusão. Dados locais podem ser excluídos limpando o cache do navegador.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-foreground">8. Contato</h4>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados, 
                entre em contato através do botão "Apoiar" no rodapé do aplicativo.
              </p>
            </section>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground/70">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
                <br />
                Versão da política: {CONSENT_VERSION}
              </p>
            </div>
          </div>

          <Button onClick={() => setShowPrivacyPolicy(false)} className="w-full gradient-primary">
            Entendi
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Componente para gerenciar consentimento nas configurações
export const LGPDSettingsSection = () => {
  const { consent, hasConsent, saveConsent, revokeConsent } = useLGPDConsent();
  const [showConfirmRevoke, setShowConfirmRevoke] = useState(false);

  if (!hasConsent) return null;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" />
        <div>
          <h4 className="font-semibold">Privacidade e LGPD</h4>
          <p className="text-xs text-muted-foreground">
            Gerencie suas preferências de dados
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Cookies de Funcionalidade</span>
          <span className={consent?.functionality ? "text-green-500" : "text-muted-foreground"}>
            {consent?.functionality ? "✓ Ativo" : "✗ Inativo"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Cookies de Análise</span>
          <span className={consent?.analytics ? "text-green-500" : "text-muted-foreground"}>
            {consent?.analytics ? "✓ Ativo" : "✗ Inativo"}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Consentimento dado em: {consent?.acceptedAt ? new Date(consent.acceptedAt).toLocaleString('pt-BR') : 'N/A'}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirmRevoke(true)}
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          Revogar Consentimento
        </Button>
      </div>

      <Dialog open={showConfirmRevoke} onOpenChange={setShowConfirmRevoke}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar Consentimento?</DialogTitle>
            <DialogDescription>
              Ao revogar seu consentimento, o banner de cookies será exibido novamente 
              e algumas funcionalidades podem ser desativadas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmRevoke(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                revokeConsent();
                setShowConfirmRevoke(false);
              }}
              className="flex-1"
            >
              Revogar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
