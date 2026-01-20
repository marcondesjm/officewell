import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown, Star, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  current_plan: string;
}

// Pre-configured avatars (same as UserHeaderCard)
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

const getRankIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-slate-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{position}</span>;
  }
};

const getRankBg = (position: number) => {
  switch (position) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-500/20 border-yellow-500/30';
    case 2:
      return 'bg-gradient-to-r from-slate-400/20 via-slate-300/10 to-slate-400/20 border-slate-400/30';
    case 3:
      return 'bg-gradient-to-r from-amber-600/20 via-orange-500/10 to-amber-600/20 border-amber-600/30';
    default:
      return 'bg-card/50 border-border/50';
  }
};

const renderAvatar = (avatarUrl: string | null, name: string, size: 'sm' | 'md' = 'sm') => {
  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-base';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  if (avatarUrl?.startsWith('default:')) {
    const avatarId = avatarUrl.replace('default:', '');
    const avatar = defaultAvatars[avatarId];
    if (avatar) {
      return (
        <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center border-2 border-white/20 shadow-sm`}>
          {avatar.emoji}
        </div>
      );
    }
  }
  
  return (
    <Avatar className={`${sizeClasses} border-2 border-white/20 shadow-sm`}>
      <AvatarImage src={avatarUrl || undefined} />
      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export const LeaderboardCard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('points', { ascending: false })
          .limit(10);

        if (error) throw error;
        setLeaderboard(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Find current user's position
  const currentUserPosition = leaderboard.findIndex(
    entry => entry.id === user?.id
  ) + 1;

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Ranking Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-orange-500/10">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Ranking de Líderes</span>
          </div>
          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
            <Users className="h-3 w-3 mr-1" />
            {leaderboard.length} participantes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-1.5">
        {leaderboard.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum participante ainda</p>
            <p className="text-xs">Seja o primeiro a conquistar pontos!</p>
          </div>
        ) : (
          <>
            {leaderboard.map((entry, index) => {
              const position = index + 1;
              const isCurrentUser = entry.id === user?.id;
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${getRankBg(position)} ${
                    isCurrentUser ? 'ring-2 ring-primary/50 ring-offset-1 ring-offset-background' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-6">
                    {getRankIcon(position)}
                  </div>

                  {/* Avatar */}
                  {renderAvatar(entry.avatar_url, entry.display_name)}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                        {entry.display_name}
                        {isCurrentUser && <span className="text-[10px] ml-1 text-primary/70">(você)</span>}
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {entry.points}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Current user position indicator if not in top 10 */}
            {user && currentUserPosition === 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Continue acumulando pontos para aparecer no ranking!</span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
