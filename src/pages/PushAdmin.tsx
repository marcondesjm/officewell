import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Send, 
  Clock, 
  History, 
  Settings, 
  ArrowLeft,
  Users,
  Smartphone,
  Calendar,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Play,
  Pause
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PushDiagnostics } from '@/components/PushDiagnostics';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { usePushNotificationsNew } from '@/hooks/usePushNotificationsNew';

interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  scheduled_for: string;
  status: string;
  recurrence_type: string | null;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  target_type: string;
  sent_count: number;
  failed_count: number;
  sent_at: string;
}

interface Stats {
  activeDevices: number;
  totalSessions: number;
  pendingScheduled: number;
}

export default function PushAdmin() {
  const navigate = useNavigate();
  const { isSubscribed, subscribe, isLoading: hookLoading } = usePushNotificationsNew();
  
  // Estados do formulário
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<string>('none');
  const [isSending, setIsSending] = useState(false);
  
  // Estados das listas
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [stats, setStats] = useState<Stats>({ activeDevices: 0, totalSessions: 0, pendingScheduled: 0 });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      // Carregar estatísticas
      const [subsResult, scheduledResult, historyResult] = await Promise.all([
        supabase.from('push_subscriptions').select('*').eq('is_active', true),
        supabase.from('scheduled_push_notifications').select('*').eq('status', 'pending').order('scheduled_for', { ascending: true }),
        supabase.from('push_notification_history').select('*').order('sent_at', { ascending: false }).limit(50)
      ]);

      if (subsResult.data) {
        const uniqueSessions = new Set(subsResult.data.map(s => s.session_id));
        setStats({
          activeDevices: subsResult.data.length,
          totalSessions: uniqueSessions.size,
          pendingScheduled: scheduledResult.data?.length || 0
        });
      }

      if (scheduledResult.data) {
        setScheduledNotifications(scheduledResult.data);
      }

      if (historyResult.data) {
        setHistory(historyResult.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Enviar notificação
  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    setIsSending(true);

    try {
      if (isScheduled) {
        if (!scheduledFor) {
          toast.error('Selecione uma data/hora para agendar');
          setIsSending(false);
          return;
        }

        // Salvar notificação agendada
        const { error } = await supabase.from('scheduled_push_notifications').insert({
          title,
          message,
          click_url: clickUrl || '/',
          scheduled_for: new Date(scheduledFor).toISOString(),
          recurrence_type: recurrenceType !== 'none' ? recurrenceType : null,
          target_type: 'all',
          created_by: 'admin',
          status: 'pending'
        });

        if (error) throw error;

        toast.success('Notificação agendada com sucesso!');
        resetForm();
        loadData();
      } else {
        // Enviar imediatamente para todos
        const { data: subscriptions, error: fetchError } = await supabase
          .from('push_subscriptions')
          .select('session_id')
          .eq('is_active', true);

        if (fetchError) throw fetchError;

        if (!subscriptions || subscriptions.length === 0) {
          toast.error('Nenhum dispositivo inscrito');
          setIsSending(false);
          return;
        }

        let sentCount = 0;
        let failedCount = 0;

        // Enviar para cada subscription
        for (const sub of subscriptions) {
          try {
            const { error } = await supabase.functions.invoke('send-push-to-device', {
              body: {
                session_id: sub.session_id,
                title,
                body: message,
                url: clickUrl || '/'
              }
            });

            if (error) {
              failedCount++;
            } else {
              sentCount++;
            }
          } catch {
            failedCount++;
          }
        }

        // Registrar no histórico
        await supabase.from('push_notification_history').insert({
          title,
          message,
          click_url: clickUrl || '/',
          target_type: 'all',
          sent_count: sentCount,
          failed_count: failedCount,
          sent_by: 'admin'
        });

        if (sentCount > 0) {
          toast.success(`Notificação enviada para ${sentCount} dispositivo(s)!`);
        }
        if (failedCount > 0) {
          toast.error(`Falha em ${failedCount} dispositivo(s)`);
        }

        resetForm();
        loadData();
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast.error('Erro ao enviar notificação');
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setClickUrl('');
    setIsScheduled(false);
    setScheduledFor('');
    setRecurrenceType('none');
  };

  // Cancelar notificação agendada
  const cancelScheduled = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_push_notifications')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Notificação cancelada');
      loadData();
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      toast.error('Erro ao cancelar notificação');
    }
  };

  // Formatar data
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      pending: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', label: 'Pendente', icon: <Clock className="w-3 h-3" /> },
      sent: { color: 'bg-green-500/10 text-green-600 border-green-500/30', label: 'Enviada', icon: <CheckCircle className="w-3 h-3" /> },
      error: { color: 'bg-red-500/10 text-red-600 border-red-500/30', label: 'Erro', icon: <XCircle className="w-3 h-3" /> },
      cancelled: { color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', label: 'Cancelada', icon: <XCircle className="w-3 h-3" /> },
      completed: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', label: 'Concluída', icon: <CheckCircle className="w-3 h-3" /> }
    };

    const v = variants[status] || variants.pending;

    return (
      <Badge variant="outline" className={`${v.color} flex items-center gap-1`}>
        {v.icon}
        {v.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Push Notifications
              </h1>
              <p className="text-sm text-muted-foreground">Gerenciamento de notificações</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoadingData}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeDevices}</p>
                  <p className="text-sm text-muted-foreground">Dispositivos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Sessões Únicas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Calendar className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingScheduled}</p>
                  <p className="text-sm text-muted-foreground">Agendadas Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status do usuário atual */}
        {!isSubscribed && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Você não está inscrito para notificações</p>
                    <p className="text-sm text-muted-foreground">Ative para receber notificações neste dispositivo</p>
                  </div>
                </div>
                <Button onClick={subscribe} disabled={hookLoading}>
                  {hookLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
                  Ativar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="send" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Agendadas</span>
              {stats.pendingScheduled > 0 && (
                <Badge variant="secondary" className="ml-1">{stats.pendingScheduled}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Enviar */}
          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Notificação</CardTitle>
                <CardDescription>Envie uma notificação push para todos os dispositivos inscritos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Hora do alongamento!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground text-right">{title.length}/50</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    placeholder="Ex: Levante-se e faça um alongamento rápido para manter a saúde!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right">{message.length}/200</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL ao clicar (opcional)</Label>
                  <Input
                    id="url"
                    placeholder="/"
                    value={clickUrl}
                    onChange={(e) => setClickUrl(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="schedule">Agendar para depois</Label>
                  </div>
                  <Switch
                    id="schedule"
                    checked={isScheduled}
                    onCheckedChange={setIsScheduled}
                  />
                </div>

                {isScheduled && (
                  <div className="space-y-4 p-4 rounded-lg border border-dashed">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledFor">Data e Hora</Label>
                      <Input
                        id="scheduledFor"
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recurrence">Recorrência</Label>
                      <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Apenas uma vez</SelectItem>
                          <SelectItem value="daily">Diariamente</SelectItem>
                          <SelectItem value="weekly">Semanalmente</SelectItem>
                          <SelectItem value="monthly">Mensalmente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSend} 
                  disabled={isSending || !title.trim() || !message.trim()}
                  className="w-full"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isScheduled ? 'Agendando...' : 'Enviando...'}
                    </>
                  ) : (
                    <>
                      {isScheduled ? <Calendar className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      {isScheduled ? 'Agendar Notificação' : `Enviar para ${stats.activeDevices} dispositivo(s)`}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Agendadas */}
          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notificações Agendadas</CardTitle>
                <CardDescription>Notificações pendentes de envio</CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma notificação agendada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledNotifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            <StatusBadge status={notification.status} />
                            {notification.recurrence_type && (
                              <Badge variant="outline" className="text-xs">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                {notification.recurrence_type === 'daily' ? 'Diária' :
                                 notification.recurrence_type === 'weekly' ? 'Semanal' : 'Mensal'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Agendada para: {formatDate(notification.scheduled_for)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => cancelScheduled(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Histórico */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Envios</CardTitle>
                <CardDescription>Últimas 50 notificações enviadas</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma notificação enviada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div 
                        key={item.id}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.message}</p>
                          </div>
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              {item.sent_count}
                            </div>
                            {item.failed_count > 0 && (
                              <div className="flex items-center gap-1 text-red-600">
                                <XCircle className="w-3 h-3" />
                                {item.failed_count}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Enviada em: {formatDate(item.sent_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="settings" className="space-y-4">
            <NotificationPreferences />
            <PushDiagnostics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
