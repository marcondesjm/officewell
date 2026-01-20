import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Medal, Star, Gift, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Confetti from '@/components/Confetti';
import { useAuth } from '@/contexts/AuthContext';

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

const positionConfig = {
  1: {
    icon: <Crown className="h-6 w-6" />,
    emoji: '🥇',
    color: 'text-yellow-500',
    bgColor: 'from-yellow-500/30 via-amber-400/20 to-yellow-500/30',
    borderColor: 'border-yellow-500/50',
    glowColor: 'shadow-yellow-500/30',
    label: '1º Lugar',
  },
  2: {
    icon: <Medal className="h-5 w-5" />,
    emoji: '🥈',
    color: 'text-slate-400',
    bgColor: 'from-slate-400/30 via-slate-300/20 to-slate-400/30',
    borderColor: 'border-slate-400/50',
    glowColor: 'shadow-slate-400/20',
    label: '2º Lugar',
  },
  3: {
    icon: <Medal className="h-5 w-5" />,
    emoji: '🥉',
    color: 'text-amber-600',
    bgColor: 'from-amber-600/30 via-orange-500/20 to-amber-600/30',
    borderColor: 'border-amber-600/50',
    glowColor: 'shadow-amber-600/20',
    label: '3º Lugar',
  },
};

const renderAvatar = (avatarUrl: string | null, name: string) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  if (avatarUrl?.startsWith('default:')) {
    const avatarId = avatarUrl.replace('default:', '');
    const avatar = defaultAvatars[avatarId];
    if (avatar) {
      return (
        <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center border-3 border-white/30 shadow-lg text-2xl`}>
          {avatar.emoji}
        </div>
      );
    }
  }
  
  return (
    <Avatar className="h-14 w-14 border-3 border-white/30 shadow-lg">
      <AvatarImage src={avatarUrl || undefined} />
      <AvatarFallback className="text-lg font-bold bg-primary/20 text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export const MonthlyAwardsCard = () => {
  const [awards, setAwards] = useState<MonthlyAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { user } = useAuth();

  // Get last month in YYYY-MM format
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM');
  const lastMonthDisplay = format(subMonths(new Date(), 1), 'MMMM yyyy', { locale: ptBR });

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const { data, error } = await supabase
          .from('monthly_awards')
          .select('*')
          .eq('month_year', lastMonth)
          .order('position', { ascending: true });

        if (error) throw error;
        setAwards(data || []);
        
        // Show confetti if current user is a winner
        if (data && user) {
          const isWinner = data.some(award => award.user_id === user.id);
          if (isWinner) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        }
      } catch (error) {
        console.error('Error fetching monthly awards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, [lastMonth, user]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-amber-500/10 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Premiação do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (awards.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-amber-500/10 border-purple-500/20 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Premiação Mensal</span>
            <Badge variant="secondary" className="text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Calendar className="h-3 w-3 mr-1" />
              {lastMonthDisplay}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Gift className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Nenhuma premiação registrada para {lastMonthDisplay}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Os vencedores serão anunciados em breve!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Reorder to show 2nd, 1st, 3rd for podium effect
  const podiumOrder = [
    awards.find(a => a.position === 2),
    awards.find(a => a.position === 1),
    awards.find(a => a.position === 3),
  ].filter(Boolean) as MonthlyAward[];

  return (
    <>
      {showConfetti && <Confetti />}
      
      <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-amber-500/10 border-purple-500/20 overflow-hidden relative">
        {/* Sparkle effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-4 left-8 text-yellow-400/60"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
          <motion.div
            className="absolute top-6 right-12 text-pink-400/60"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles className="h-3 w-3" />
          </motion.div>
          <motion.div
            className="absolute bottom-8 left-16 text-purple-400/60"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 1 }}
          >
            <Sparkles className="h-3 w-3" />
          </motion.div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="h-5 w-5 text-yellow-500" />
              </motion.div>
              <span>🏆 Premiação Mensal</span>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Calendar className="h-3 w-3 mr-1" />
              {lastMonthDisplay}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-2 pb-4">
          <div className="flex justify-center items-end gap-3 sm:gap-6">
            <AnimatePresence>
              {podiumOrder.map((award, index) => {
                const config = positionConfig[award.position as 1 | 2 | 3];
                const isCurrentUser = award.user_id === user?.id;
                const isFirst = award.position === 1;
                
                return (
                  <motion.div
                    key={award.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                    className={`flex flex-col items-center ${isFirst ? 'order-2' : award.position === 2 ? 'order-1' : 'order-3'}`}
                  >
                    {/* Position badge */}
                    <motion.div
                      className={`mb-2 ${config.color}`}
                      animate={isFirst ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="text-2xl">{config.emoji}</span>
                    </motion.div>

                    {/* Avatar with glow effect */}
                    <motion.div
                      className={`relative ${isFirst ? 'scale-110' : ''}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {isFirst && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-yellow-400/30 blur-md"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <div className={`relative ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full' : ''}`}>
                        {renderAvatar(award.avatar_url, award.display_name)}
                      </div>
                    </motion.div>

                    {/* Name */}
                    <div className="mt-2 text-center max-w-[80px] sm:max-w-[100px]">
                      <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                        {award.display_name}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-[8px] mt-0.5 bg-primary/10 border-primary/30">
                          Você!
                        </Badge>
                      )}
                    </div>

                    {/* Points */}
                    <div className="flex items-center gap-0.5 mt-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {award.points}
                      </span>
                    </div>

                    {/* Prize */}
                    <motion.div 
                      className={`mt-2 px-2 py-1 rounded-lg bg-gradient-to-r ${config.bgColor} border ${config.borderColor}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center gap-1">
                        <Gift className={`h-3 w-3 ${config.color}`} />
                        <span className={`text-[10px] font-medium ${config.color}`}>
                          {award.prize_title}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
