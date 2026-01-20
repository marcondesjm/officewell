import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Crown, Medal, Star, Plus, Pencil, Trash2, Gift, Calendar, Users, Sparkles, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthlyAward {
  id: string;
  month_year: string;
  position: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  prize_title: string;
  prize_description: string | null;
}

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
}

const positionConfig = {
  1: { emoji: '🥇', label: '1º Lugar', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  2: { emoji: '🥈', label: '2º Lugar', color: 'text-slate-400', bg: 'bg-slate-400/20' },
  3: { emoji: '🥉', label: '3º Lugar', color: 'text-amber-600', bg: 'bg-amber-600/20' },
};

const defaultPrizes = [
  { position: 1, title: 'Dia de Folga', description: 'Um dia de folga remunerado' },
  { position: 2, title: 'Vale-Presente R$100', description: 'Vale para usar em lojas parceiras' },
  { position: 3, title: 'Vale-Refeição Extra', description: 'Um vale-refeição adicional' },
];

// Pre-configured avatars
const defaultAvatars: Record<string, { emoji: string; bg: string }> = {
  'avatar-1': { emoji: '👤', bg: 'from-blue-500 to-cyan-500' },
  'avatar-2': { emoji: '👨‍💼', bg: 'from-violet-500 to-purple-500' },
  'avatar-3': { emoji: '👩‍💼', bg: 'from-pink-500 to-rose-500' },
  'avatar-4': { emoji: '🧑‍💻', bg: 'from-green-500 to-emerald-500' },
  'avatar-5': { emoji: '👨‍🔬', bg: 'from-amber-500 to-orange-500' },
  'avatar-6': { emoji: '👩‍🔬', bg: 'from-red-500 to-pink-500' },
  'avatar-7': { emoji: '🦸', bg: 'from-indigo-500 to-blue-500' },
  'avatar-8': { emoji: '🧘', bg: 'from-teal-500 to-cyan-500' },
};

const renderAvatar = (avatarUrl: string | null, name: string) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  if (avatarUrl?.startsWith('default:')) {
    const avatarId = avatarUrl.replace('default:', '');
    const avatar = defaultAvatars[avatarId];
    if (avatar) {
      return (
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center border-2 border-white/20 shadow-sm text-lg`}>
          {avatar.emoji}
        </div>
      );
    }
  }
  
  return (
    <Avatar className="h-10 w-10 border-2 border-white/20 shadow-sm">
      <AvatarImage src={avatarUrl || undefined} />
      <AvatarFallback className="text-sm font-bold bg-primary/20 text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

// Generate month options (last 12 months)
const getMonthOptions = () => {
  const options = [];
  for (let i = 0; i < 12; i++) {
    const date = subMonths(new Date(), i);
    options.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: ptBR }),
    });
  }
  return options;
};

export const MonthlyAwardsAdmin = () => {
  const [awards, setAwards] = useState<MonthlyAward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(subMonths(new Date(), 1), 'yyyy-MM'));
  
  // Form state
  const [formPosition, setFormPosition] = useState<number>(1);
  const [formUserId, setFormUserId] = useState('');
  const [formPrizeTitle, setFormPrizeTitle] = useState('');
  const [formPrizeDescription, setFormPrizeDescription] = useState('');
  const [editingAward, setEditingAward] = useState<MonthlyAward | null>(null);

  const monthOptions = getMonthOptions();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch awards for selected month
      const { data: awardsData, error: awardsError } = await supabase
        .from('monthly_awards')
        .select('*')
        .eq('month_year', selectedMonth)
        .order('position', { ascending: true });

      if (awardsError) throw awardsError;
      setAwards(awardsData || []);

      // Fetch leaderboard for user selection
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('points', { ascending: false })
        .limit(50);

      if (leaderboardError) throw leaderboardError;
      setLeaderboard(leaderboardData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const openDialog = (position: number, award?: MonthlyAward) => {
    const defaultPrize = defaultPrizes.find(p => p.position === position);
    
    if (award) {
      setEditingAward(award);
      setFormPosition(award.position);
      setFormUserId(award.user_id);
      setFormPrizeTitle(award.prize_title);
      setFormPrizeDescription(award.prize_description || '');
    } else {
      setEditingAward(null);
      setFormPosition(position);
      setFormUserId('');
      setFormPrizeTitle(defaultPrize?.title || '');
      setFormPrizeDescription(defaultPrize?.description || '');
    }
    setDialogOpen(true);
  };

  const saveAward = async () => {
    if (!formUserId) {
      toast.error('Selecione um vencedor');
      return;
    }
    if (!formPrizeTitle.trim()) {
      toast.error('Informe o título do prêmio');
      return;
    }

    const selectedUser = leaderboard.find(u => u.id === formUserId);
    if (!selectedUser) {
      toast.error('Usuário não encontrado');
      return;
    }

    try {
      const awardData = {
        month_year: selectedMonth,
        position: formPosition,
        user_id: formUserId,
        display_name: selectedUser.display_name,
        avatar_url: selectedUser.avatar_url,
        points: selectedUser.points,
        prize_title: formPrizeTitle.trim(),
        prize_description: formPrizeDescription.trim() || null,
      };

      if (editingAward) {
        const { error } = await supabase
          .from('monthly_awards')
          .update(awardData)
          .eq('id', editingAward.id);

        if (error) throw error;
        toast.success('Premiação atualizada!');
      } else {
        const { error } = await supabase
          .from('monthly_awards')
          .insert(awardData);

        if (error) {
          if (error.code === '23505') {
            toast.error('Já existe um vencedor para esta posição neste mês');
          } else {
            throw error;
          }
          return;
        }
        toast.success('Premiação registrada!');
      }

      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving award:', error);
      toast.error('Erro ao salvar premiação');
    }
  };

  const deleteAward = async (awardId: string) => {
    try {
      const { error } = await supabase
        .from('monthly_awards')
        .delete()
        .eq('id', awardId);

      if (error) throw error;
      toast.success('Premiação removida');
      fetchData();
    } catch (error) {
      console.error('Error deleting award:', error);
      toast.error('Erro ao remover premiação');
    }
  };

  const autoFillFromLeaderboard = async () => {
    if (awards.length > 0) {
      toast.error('Já existem premiações para este mês. Remova-as primeiro.');
      return;
    }

    if (leaderboard.length < 3) {
      toast.error('Não há participantes suficientes no ranking');
      return;
    }

    try {
      const top3 = leaderboard.slice(0, 3);
      const awardsToInsert = top3.map((user, index) => ({
        month_year: selectedMonth,
        position: index + 1,
        user_id: user.id,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        points: user.points,
        prize_title: defaultPrizes[index].title,
        prize_description: defaultPrizes[index].description,
      }));

      const { error } = await supabase
        .from('monthly_awards')
        .insert(awardsToInsert);

      if (error) throw error;
      toast.success('Top 3 preenchido automaticamente!');
      fetchData();
    } catch (error) {
      console.error('Error auto-filling awards:', error);
      toast.error('Erro ao preencher automaticamente');
    }
  };

  const selectedMonthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Premiação Mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-amber-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Premiação Mensal
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              onClick={autoFillFromLeaderboard}
              variant="outline"
              className="gap-2"
              disabled={awards.length > 0}
            >
              <Sparkles className="h-4 w-4" />
              Preencher Top 3 Automaticamente
            </Button>
          </div>

          {/* Positions */}
          <div className="space-y-3">
            {[1, 2, 3].map(position => {
              const award = awards.find(a => a.position === position);
              const config = positionConfig[position as 1 | 2 | 3];

              return (
                <motion.div
                  key={position}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: position * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    award ? config.bg : 'bg-muted/30 border-dashed border-muted-foreground/30'
                  }`}
                >
                  {/* Position */}
                  <div className="text-2xl">{config.emoji}</div>

                  {award ? (
                    <>
                      {/* Winner Info */}
                      {renderAvatar(award.avatar_url, award.display_name)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{award.display_name}</span>
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {award.points} pts
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Gift className="h-3 w-3" />
                          <span>{award.prize_title}</span>
                          {award.prize_description && (
                            <span className="text-xs">- {award.prize_description}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(position, award)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover premiação?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação irá remover a premiação de {config.label} para {award.display_name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAward(award.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Empty State */}
                      <div className="flex-1">
                        <p className="text-muted-foreground">{config.label} - Não definido</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(position)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Definir Vencedor
                      </Button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Summary */}
          {awards.length > 0 && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>
                  {awards.length} de 3 posições definidas para {selectedMonthLabel}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Award Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {positionConfig[formPosition as 1 | 2 | 3]?.emoji}
              {editingAward ? 'Editar' : 'Definir'} {positionConfig[formPosition as 1 | 2 | 3]?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Vencedor</Label>
              <Select value={formUserId} onValueChange={setFormUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vencedor..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {leaderboard.map((user, index) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs w-4">#{index + 1}</span>
                        <span>{user.display_name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {user.points} pts
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizeTitle">Título do Prêmio</Label>
              <Input
                id="prizeTitle"
                value={formPrizeTitle}
                onChange={(e) => setFormPrizeTitle(e.target.value)}
                placeholder="Ex: Dia de Folga"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizeDescription">Descrição (opcional)</Label>
              <Input
                id="prizeDescription"
                value={formPrizeDescription}
                onChange={(e) => setFormPrizeDescription(e.target.value)}
                placeholder="Ex: Um dia de folga remunerado"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveAward} className="gap-2">
                <Trophy className="h-4 w-4" />
                {editingAward ? 'Salvar' : 'Definir Vencedor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
