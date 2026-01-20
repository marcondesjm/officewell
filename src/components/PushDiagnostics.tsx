import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Bell, 
  BellOff, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  Send, 
  Smartphone,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { usePushNotificationsNew } from '@/hooks/usePushNotificationsNew';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DiagnosticsData {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  serviceWorkerActive: boolean;
  serviceWorkerUrl: string | null;
  pushManagerSupported: boolean;
  notificationApiSupported: boolean;
  hasLocalSubscription: boolean;
  hasDbSubscription: boolean;
  deviceToken: string | null;
  sessionId: string | null;
  lastPushReceived: string | null;
  lastBackendTelemetry: string | null;
}

export function PushDiagnostics() {
  const {
    isSubscribed,
    isLoading,
    permission,
    hasActiveDbSubscription,
    testLocalNotification,
    sendTestPushToDevice,
    forceSyncSubscription,
    resetAndResubscribe,
    getDiagnostics
  } = usePushNotificationsNew();

  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDiagnostics = async () => {
    setIsRefreshing(true);
    const data = await getDiagnostics();
    setDiagnostics(data);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadDiagnostics();
  }, [isSubscribed, hasActiveDbSubscription]);

  const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {ok ? (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
          <Check className="w-3 h-3 mr-1" />
          {label}
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
          <X className="w-3 h-3 mr-1" />
          {label}
        </Badge>
      )}
    </div>
  );

  const permissionColor = 
    permission === 'granted' ? 'text-green-600' :
    permission === 'denied' ? 'text-red-600' : 'text-yellow-600';

  const isSynced = diagnostics?.hasLocalSubscription === diagnostics?.hasDbSubscription;
  const hasIssues = !isSynced || permission === 'denied' || !diagnostics?.isSupported;

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Diagnóstico de Push Notifications
        </CardTitle>
        <CardDescription>
          Status detalhado do sistema de notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid de Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Permissão</p>
            <p className={`font-medium capitalize ${permissionColor}`}>
              {permission === 'granted' ? 'Concedida' : 
               permission === 'denied' ? 'Negada' : 
               permission === 'unsupported' ? 'N/A' : 'Pendente'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Service Worker</p>
            <p className={`font-medium ${diagnostics?.serviceWorkerActive ? 'text-green-600' : 'text-red-600'}`}>
              {diagnostics?.serviceWorkerActive ? 'Ativo' : 'Inativo'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Local</p>
            <p className={`font-medium ${diagnostics?.hasLocalSubscription ? 'text-green-600' : 'text-yellow-600'}`}>
              {diagnostics?.hasLocalSubscription ? 'Inscrito' : 'Não inscrito'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Banco</p>
            <p className={`font-medium ${diagnostics?.hasDbSubscription ? 'text-green-600' : 'text-yellow-600'}`}>
              {diagnostics?.hasDbSubscription ? 'Sincronizado' : 'Não sincronizado'}
            </p>
          </div>
        </div>

        {/* Alertas condicionais */}
        {!isSynced && diagnostics?.hasLocalSubscription && !diagnostics?.hasDbSubscription && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Dessincronizado</AlertTitle>
            <AlertDescription>
              Você tem uma inscrição local mas não está sincronizada com o servidor.
              Clique em "Sincronizar" para corrigir.
            </AlertDescription>
          </Alert>
        )}

        {permission === 'denied' && (
          <Alert variant="destructive">
            <BellOff className="h-4 w-4" />
            <AlertTitle>Permissão Bloqueada</AlertTitle>
            <AlertDescription>
              As notificações foram bloqueadas no navegador. 
              Acesse as configurações do navegador para permitir notificações deste site.
            </AlertDescription>
          </Alert>
        )}

        {!diagnostics?.isSupported && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Navegador Não Suportado</AlertTitle>
            <AlertDescription>
              Este navegador não suporta notificações push. 
              Tente usar Chrome, Firefox, Edge ou Safari atualizado.
            </AlertDescription>
          </Alert>
        )}

        {/* Telemetria */}
        {(diagnostics?.lastPushReceived || diagnostics?.lastBackendTelemetry) && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="text-sm font-medium">Telemetria</p>
            {diagnostics?.lastPushReceived && (
              <p className="text-xs text-muted-foreground">
                Último push recebido: {new Date(diagnostics.lastPushReceived).toLocaleString('pt-BR')}
              </p>
            )}
            {diagnostics?.lastBackendTelemetry && (
              <p className="text-xs text-muted-foreground">
                Última confirmação backend: {new Date(diagnostics.lastBackendTelemetry).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        )}

        {/* Detalhes técnicos expansíveis */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              Detalhes Técnicos
              {isDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            <div className="p-3 rounded-lg bg-muted/30 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Push Manager:</span>
                <StatusBadge ok={diagnostics?.pushManagerSupported || false} label={diagnostics?.pushManagerSupported ? 'Sim' : 'Não'} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notification API:</span>
                <StatusBadge ok={diagnostics?.notificationApiSupported || false} label={diagnostics?.notificationApiSupported ? 'Sim' : 'Não'} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Device Token:</span>
                <code className="text-xs bg-muted px-1 rounded truncate max-w-[150px]">
                  {diagnostics?.deviceToken?.slice(0, 20)}...
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Session ID:</span>
                <code className="text-xs bg-muted px-1 rounded truncate max-w-[150px]">
                  {diagnostics?.sessionId?.slice(0, 20)}...
                </code>
              </div>
              {diagnostics?.serviceWorkerUrl && (
                <div className="pt-1 border-t border-border/50">
                  <span className="text-muted-foreground block">SW URL:</span>
                  <code className="text-xs break-all">{diagnostics.serviceWorkerUrl}</code>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button 
            size="sm" 
            variant="outline"
            onClick={sendTestPushToDevice}
            disabled={!hasActiveDbSubscription || isLoading}
          >
            <Send className="w-4 h-4 mr-1" />
            Push Teste
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={forceSyncSubscription}
            disabled={isLoading}
          >
            <Wifi className="w-4 h-4 mr-1" />
            Sincronizar
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={testLocalNotification}
            disabled={permission !== 'granted' || isLoading}
          >
            <Bell className="w-4 h-4 mr-1" />
            Teste Local
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={resetAndResubscribe}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Reset
          </Button>

          <Button 
            size="sm" 
            variant="ghost"
            onClick={loadDiagnostics}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
