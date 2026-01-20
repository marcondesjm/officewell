import { Lightbulb, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DailyTip {
  id: string;
  title: string;
  content: string;
  category: string;
  emoji: string;
}

// Fallback tips in case database is empty
const fallbackTips: DailyTip[] = [
  {
    id: "1",
    title: "Menos cafeína, mais energia",
    content: "Limite o café a 2 xícaras antes das 14h. Prefira descafeinado à tarde para manter o sono saudável e energia estável.",
    category: "Alimentação",
    emoji: "☕",
  },
  {
    id: "2",
    title: "Regra 20-20-20",
    content: "A cada 20 minutos, olhe para algo a 20 metros por 20 segundos. Seus olhos agradecem!",
    category: "Visão",
    emoji: "👀",
  },
  {
    id: "3",
    title: "Respire fundo",
    content: "Inspire 4s, segure 4s, expire 4s. Três ciclos reduzem o estresse imediatamente.",
    category: "Mental",
    emoji: "🧘",
  },
];

export const TipOfTheDay = () => {
  const [tips, setTips] = useState<DailyTip[]>(fallbackTips);
  const [tip, setTip] = useState<DailyTip>(fallbackTips[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchTips = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("daily_tips")
        .select("id, title, content, category, emoji")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;

      if (data && data.length > 0) {
        setTips(data);
        // Set today's tip based on day of year
        const today = new Date();
        const dayOfYear = Math.floor(
          (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
        );
        setTip(data[dayOfYear % data.length]);
      }
    } catch (error) {
      console.error("Error fetching tips:", error);
      // Use fallback tips
      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
      );
      setTip(fallbackTips[dayOfYear % fallbackTips.length]);
    }
  }, []);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const handleRefresh = () => {
    setIsAnimating(true);
    const randomIndex = Math.floor(Math.random() * tips.length);
    setTimeout(() => {
      setTip(tips[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary-light via-card to-secondary-light shadow-card animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br from-primary to-info text-primary-foreground shadow-lg">
              <Lightbulb className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            
            <div className={`space-y-2 flex-1 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  💡 Dica do Dia
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-secondary-light text-secondary font-medium border border-secondary/20">
                  {tip.category}
                </span>
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-foreground">
                {tip.emoji} {tip.title}
              </h3>
              
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {tip.content}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="flex-shrink-0 rounded-full hover:bg-primary-light hover:text-primary border border-transparent hover:border-primary/20"
            title="Nova dica"
          >
            <RefreshCw className={`h-4 w-4 ${isAnimating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
};
