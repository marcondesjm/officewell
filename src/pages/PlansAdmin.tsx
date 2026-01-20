import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { ArrowLeft, Check, X, Crown, Building2, User, Clock, Users, TrendingUp, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

interface UpgradeRequest {
  id: string;
  user_id: string;
  requested_plan: SubscriptionPlan;
  current_plan: SubscriptionPlan;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  profile?: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  current_plan: SubscriptionPlan;
  points: number;
  whatsapp: string | null;
  created_at: string;
}

const planLabels: Record<SubscriptionPlan, { label: string; icon: React.ReactNode; color: string }> = {
  free: { label: 'Grátis', icon: <User className="h-4 w-4" />, color: 'bg-muted' },
  pro: { label: 'Pro', icon: <Crown className="h-4 w-4" />, color: 'bg-primary/20 text-primary' },
  enterprise: { label: 'Empresarial', icon: <Building2 className="h-4 w-4" />, color: 'bg-amber-500/20 text-amber-600' },
};

export default function PlansAdmin() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error('Acesso não autorizado');
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch upgrade requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('plan_upgrade_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Match profiles to requests
      const requestsWithProfiles = (requestsData || []).map(req => ({
        ...req,
        profile: profilesData?.find(p => p.user_id === req.user_id),
      }));

      setRequests(requestsWithProfiles as UpgradeRequest[]);
      setUsers(profilesData as UserProfile[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: UpgradeRequest) => {
    setProcessingId(request.id);
    try {
      // Update request status
      const { error: requestError } = await supabase
        .from('plan_upgrade_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

      // Update user's plan
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ current_plan: request.requested_plan })
        .eq('user_id', request.user_id);

      if (profileError) throw profileError;

      toast.success('Upgrade aprovado com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Erro ao aprovar solicitação');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: UpgradeRequest) => {
    setProcessingId(request.id);
    try {
      const { error } = await supabase
        .from('plan_upgrade_requests')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Solicitação rejeitada');
      fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Erro ao rejeitar solicitação');
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangePlan = async (userId: string, newPlan: SubscriptionPlan) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ current_plan: newPlan })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Plano alterado com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Erro ao alterar plano');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  const stats = {
    totalUsers: users.length,
    freeUsers: users.filter(u => u.current_plan === 'free').length,
    proUsers: users.filter(u => u.current_plan === 'pro').length,
    enterpriseUsers: users.filter(u => u.current_plan === 'enterprise').length,
    pendingRequests: pendingRequests.length,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Planos</h1>
            <p className="text-muted-foreground">Aprove solicitações e gerencie planos de usuários</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.totalUsers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.freeUsers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Plano Grátis</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.proUsers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Plano Pro</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold">{stats.enterpriseUsers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Empresarial</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">{stats.pendingRequests}</span>
              </div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Solicitações
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4 mt-4">
            {pendingRequests.length === 0 && processedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma solicitação de upgrade encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Pendentes</h3>
                    {pendingRequests.map(request => (
                      <Card key={request.id} className="border-orange-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={request.profile?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {request.profile?.display_name?.slice(0, 2).toUpperCase() || '??'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.profile?.display_name || 'Usuário'}</p>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge className={planLabels[request.current_plan].color}>
                                    {planLabels[request.current_plan].icon}
                                    <span className="ml-1">{planLabels[request.current_plan].label}</span>
                                  </Badge>
                                  <span>→</span>
                                  <Badge className={planLabels[request.requested_plan].color}>
                                    {planLabels[request.requested_plan].icon}
                                    <span className="ml-1">{planLabels[request.requested_plan].label}</span>
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(request.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(request)}
                                disabled={processingId === request.id}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(request)}
                                disabled={processingId === request.id}
                                className="gap-1"
                              >
                                <Check className="h-4 w-4" />
                                Aprovar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {processedRequests.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <h3 className="font-semibold text-lg text-muted-foreground">Histórico</h3>
                    {processedRequests.slice(0, 10).map(request => (
                      <Card key={request.id} className="opacity-60">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={request.profile?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {request.profile?.display_name?.slice(0, 2).toUpperCase() || '??'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{request.profile?.display_name || 'Usuário'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {planLabels[request.current_plan].label} → {planLabels[request.requested_plan].label}
                                </p>
                              </div>
                            </div>
                            <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                              {request.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-4">
            {users.map(userProfile => (
              <Card key={userProfile.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={userProfile.avatar_url || undefined} />
                        <AvatarFallback>
                          {userProfile.display_name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{userProfile.display_name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={planLabels[userProfile.current_plan].color}>
                            {planLabels[userProfile.current_plan].icon}
                            <span className="ml-1">{planLabels[userProfile.current_plan].label}</span>
                          </Badge>
                          {userProfile.whatsapp && (
                            <a 
                              href={`https://wa.me/55${userProfile.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition-colors"
                            >
                              <Phone className="h-3 w-3" />
                              {userProfile.whatsapp}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(['free', 'pro', 'enterprise'] as SubscriptionPlan[]).map(plan => (
                        <Button
                          key={plan}
                          size="sm"
                          variant={userProfile.current_plan === plan ? 'default' : 'outline'}
                          onClick={() => handleChangePlan(userProfile.user_id, plan)}
                          disabled={userProfile.current_plan === plan}
                        >
                          {planLabels[plan].label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
