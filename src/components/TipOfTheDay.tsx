import { Lightbulb, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";

const dailyTips = [
  {
    title: "☕ Menos cafeína, mais energia",
    content: "Limite o café a 2 xícaras antes das 14h. Prefira descafeinado à tarde para manter o sono saudável e energia estável.",
    category: "Alimentação",
  },
  {
    title: "👀 Regra 20-20-20",
    content: "A cada 20 minutos, olhe para algo a 20 metros por 20 segundos. Seus olhos agradecem!",
    category: "Visão",
  },
  {
    title: "🧘 Respire fundo",
    content: "Inspire 4s, segure 4s, expire 4s. Três ciclos reduzem o estresse imediatamente.",
    category: "Mental",
  },
  {
    title: "💧 Hidratação constante",
    content: "Não espere sentir sede. Beba água a cada hora para manter o foco e evitar dores de cabeça.",
    category: "Hidratação",
  },
  {
    title: "🪑 Postura correta",
    content: "Pés no chão, costas retas, tela na altura dos olhos. Previna dores crônicas com pequenos ajustes.",
    category: "Postura",
  },
  {
    title: "🚶 Levante-se!",
    content: "A cada 45 minutos, caminhe por 2 minutos. Ativa a circulação e aumenta a produtividade.",
    category: "Movimento",
  },
  {
    title: "🌿 Contato com a natureza",
    content: "Plantas no ambiente de trabalho reduzem estresse e melhoram a qualidade do ar.",
    category: "Ambiente",
  },
  {
    title: "🍎 Lanches inteligentes",
    content: "Troque doces por frutas e castanhas. Energia estável o dia todo sem picos de açúcar.",
    category: "Alimentação",
  },
  {
    title: "😴 Durma bem",
    content: "7-8 horas de sono. Evite telas 1h antes de dormir. Seu desempenho amanhã depende disso.",
    category: "Sono",
  },
  {
    title: "🎯 Uma tarefa por vez",
    content: "Multitarefa reduz produtividade em 40%. Foque em uma coisa, termine, depois passe para a próxima.",
    category: "Produtividade",
  },
];

export const TipOfTheDay = () => {
  const [tip, setTip] = useState(dailyTips[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const getTodaysTip = useCallback(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return dailyTips[dayOfYear % dailyTips.length];
  }, []);

  useEffect(() => {
    setTip(getTodaysTip());
  }, [getTodaysTip]);

  const handleRefresh = () => {
    setIsAnimating(true);
    const randomIndex = Math.floor(Math.random() * dailyTips.length);
    setTimeout(() => {
      setTip(dailyTips[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 shadow-lg animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 p-3 rounded-2xl bg-primary/20 shadow-inner">
              <Lightbulb className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            
            <div className={`space-y-2 flex-1 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                  💡 Dica do Dia
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary font-medium">
                  {tip.category}
                </span>
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-foreground">
                {tip.title}
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
            className="flex-shrink-0 rounded-full hover:bg-primary/10 hover:text-primary"
            title="Nova dica"
          >
            <RefreshCw className={`h-4 w-4 ${isAnimating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
};
