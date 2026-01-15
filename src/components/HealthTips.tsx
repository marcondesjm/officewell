import { Clock, BookOpen, TreePine, Coffee, Sun, Eye, Heart, Activity, Droplet, Brain, RefreshCw, Sparkles, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDynamicTips } from "@/hooks/useDynamicTips";
import { Skeleton } from "@/components/ui/skeleton";

// Static fallback tips
const fallbackTips = [
  {
    id: "1",
    iconType: "clock",
    title: "Estabeleça horários fixos de trabalho",
    description: "Planejamento e organização tornam o dia mais produtivo e satisfatório, então determine um tempo para cada atividade e pare quando atingir o limite estabelecido.",
  },
  {
    id: "2",
    iconType: "book",
    title: "Leia livros físicos",
    description: "Antes de dormir é um bom horário para ler um livro físico (não digital). Assim você evita a luz azul das telas dos eletrônicos e usufrui dos benefícios da leitura.",
  },
  {
    id: "3",
    iconType: "tree",
    title: "Faça atividades ao ar livre",
    description: "Busque lazer no mundo offline. Existe uma infinidade de opções muito prazerosas e que ainda farão bem para sua saúde, como aliviar o estresse.",
  },
  {
    id: "4",
    iconType: "coffee",
    title: "Faça pausas regulares",
    description: "Em alguns momentos, tire os olhos das telas para dar um descanso à visão. Nas pausas, olhe para objetos em distâncias diferentes da tela, de preferência mais longe.",
  },
  {
    id: "5",
    iconType: "eye",
    title: "Não esqueça de piscar os olhos",
    description: "Quando estamos olhando para as telas, é normal que a gente pisque menos. Esse hábito pode levar ao ressecamento dos olhos.",
  },
];

const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  book: BookOpen,
  tree: TreePine,
  coffee: Coffee,
  sun: Sun,
  eye: Eye,
  heart: Heart,
  activity: Activity,
  droplet: Droplet,
  brain: Brain,
};

const colorVariants = [
  { color: "text-primary", bgColor: "bg-primary/10" },
  { color: "text-secondary", bgColor: "bg-secondary/10" },
  { color: "text-accent", bgColor: "bg-accent/10" },
];

export const HealthTips = () => {
  const { tips, isLoading, error, lastUpdated, refreshTips } = useDynamicTips();

  const displayTips = tips || fallbackTips;
  const isUsingAI = !!tips;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="p-5 md:p-6 glass-strong shadow-card border-0 animate-fade-in">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold text-gradient">Dicas de Saúde</h2>
            {isUsingAI && (
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {isUsingAI 
              ? "Dicas atualizadas diariamente por IA" 
              : "Cuide da sua saúde enquanto trabalha em casa"}
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground/70">
              Atualizado: {formatDate(lastUpdated)}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 border rounded-xl bg-card/50">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {displayTips.map((tip, index) => {
                const IconComponent = iconMap[tip.iconType] || Eye;
                const colorVariant = colorVariants[index % colorVariants.length];

                return (
                  <AccordionItem
                    key={tip.id}
                    value={tip.id}
                    className="border rounded-xl px-4 bg-card/50 hover:bg-card/80 transition-colors"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className={`p-2 rounded-lg ${colorVariant.bgColor}`}>
                          <IconComponent size={20} className={colorVariant.color} />
                        </div>
                        <span className="font-medium text-sm md:text-base">
                          {tip.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-0">
                      <p className="text-muted-foreground text-sm leading-relaxed pl-12">
                        {tip.description}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshTips}
                disabled={isLoading}
                className="text-muted-foreground hover:text-primary gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar dicas
              </Button>
            </div>

            {error && !tips && (
              <p className="text-xs text-center text-muted-foreground">
                Usando dicas offline. Erro: {error}
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
