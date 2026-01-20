import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Smile, Meh, Frown, Heart, ThumbsDown, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "./Confetti";
import { useAuth } from "@/contexts/AuthContext";

type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  icon: typeof Smile;
}

const moodOptions: MoodOption[] = [
  { type: 'great', emoji: '😄', label: 'Ótimo', color: 'text-emerald-500', bgColor: 'bg-emerald-500/20 hover:bg-emerald-500/30', icon: Heart },
  { type: 'good', emoji: '🙂', label: 'Bem', color: 'text-green-500', bgColor: 'bg-green-500/20 hover:bg-green-500/30', icon: Smile },
  { type: 'okay', emoji: '😐', label: 'Neutro', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20 hover:bg-yellow-500/30', icon: Meh },
  { type: 'bad', emoji: '😕', label: 'Mal', color: 'text-orange-500', bgColor: 'bg-orange-500/20 hover:bg-orange-500/30', icon: Frown },
  { type: 'terrible', emoji: '😢', label: 'Péssimo', color: 'text-red-500', bgColor: 'bg-red-500/20 hover:bg-red-500/30', icon: ThumbsDown },
];

interface MoodLog {
  id: string;
  mood: MoodType;
  note: string | null;
  created_at: string;
}

const getSessionId = () => {
  let sessionId = localStorage.getItem('officewell_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('officewell_session_id', sessionId);
  }
  return sessionId;
};

export const MoodTracker = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [todayMood, setTodayMood] = useState<MoodLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<MoodLog[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const sessionId = getSessionId();
  // Use user_id if logged in, otherwise fallback to session_id
  const identifier = user?.id || sessionId;
  const identifierField = user?.id ? 'session_id' : 'session_id'; // mood_logs uses session_id column

  // Fetch today's mood and history
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Use user_id as session_id when logged in for per-user tracking
        const queryIdentifier = user?.id || sessionId;

        // Fetch today's mood
        const { data: todayData, error: todayError } = await supabase
          .from('mood_logs')
          .select('*')
          .eq('session_id', queryIdentifier)
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (todayError) throw todayError;

        if (todayData && todayData.length > 0) {
          setTodayMood(todayData[0] as MoodLog);
        } else {
          setTodayMood(null);
        }

        // Fetch history (last 7 days excluding today)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const { data: historyData, error: historyError } = await supabase
          .from('mood_logs')
          .select('*')
          .eq('session_id', queryIdentifier)
          .gte('created_at', weekAgo.toISOString())
          .lt('created_at', today.toISOString())
          .order('created_at', { ascending: false });

        if (historyError) throw historyError;

        setHistory((historyData || []) as MoodLog[]);
      } catch (error) {
        console.error('Error fetching moods:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoods();
  }, [user?.id, sessionId]);

  const handleSubmit = async () => {
    if (!selectedMood) return;

    try {
      // Use user_id as session_id when logged in for per-user tracking
      const queryIdentifier = user?.id || sessionId;
      
      const { data, error } = await supabase
        .from('mood_logs')
        .insert({
          session_id: queryIdentifier,
          mood: selectedMood,
          note: note.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setTodayMood(data as MoodLog);
      setSelectedMood(null);
      setNote('');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('moodUpdated', { 
        detail: { mood: data.mood } 
      }));
      
      // Show confetti for positive moods
      if (selectedMood === 'great' || selectedMood === 'good') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      toast.success('Humor registrado! 🎯', {
        description: 'Continue acompanhando seu bem-estar.',
      });
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Erro ao salvar humor');
    }
  };

  const getMoodOption = (mood: MoodType) => {
    return moodOptions.find(m => m.type === mood);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  if (isLoading) {
    return (
      <Card className="glass-card animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card overflow-hidden relative">
      {showConfetti && <Confetti />}
      
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">😊</span>
          Como você está se sentindo hoje?
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {todayMood ? (
            <motion.div
              key="recorded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-4"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className={`p-4 rounded-2xl ${getMoodOption(todayMood.mood)?.bgColor}`}>
                  <span className="text-4xl">{getMoodOption(todayMood.mood)?.emoji}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                Registrado: <span className="font-medium">{getMoodOption(todayMood.mood)?.label}</span>
              </p>
              {todayMood.note && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  "{todayMood.note}"
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-center gap-2 flex-wrap">
                {moodOptions.map((mood) => (
                  <motion.button
                    key={mood.type}
                    onClick={() => setSelectedMood(mood.type)}
                    className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 min-w-[64px] ${
                      selectedMood === mood.type
                        ? `${mood.bgColor} ring-2 ring-offset-2 ring-offset-background ${mood.color.replace('text-', 'ring-')}`
                        : 'hover:bg-muted'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className={`text-xs font-medium ${selectedMood === mood.type ? mood.color : 'text-muted-foreground'}`}>
                      {mood.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {selectedMood && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <Textarea
                      placeholder="Quer adicionar uma nota? (opcional)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                    <Button 
                      onClick={handleSubmit}
                      className="w-full gradient-primary"
                    >
                      Registrar Humor
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        {history.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Histórico dos últimos 7 dias</span>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2"
                >
                  {history.map((log) => {
                    const moodOption = getMoodOption(log.mood);
                    return (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-lg">{moodOption?.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${moodOption?.color}`}>
                            {moodOption?.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(log.created_at)}
                          </p>
                        </div>
                        {log.note && (
                          <p className="text-xs text-muted-foreground truncate max-w-[100px]" title={log.note}>
                            {log.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
