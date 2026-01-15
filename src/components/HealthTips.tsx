import { Clock, BookOpen, TreePine, Coffee, Eye, Heart, Activity, Droplet, Brain, Dumbbell, Sun, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Static tips - no AI credits consumed
const staticTips = [
  {
    id: "1",
    iconType: "eye",
    title: "Regra 20-20-20 para os olhos",
    description: "A cada 20 minutos, olhe para algo a 20 metros de distância por 20 segundos. Isso reduz a fadiga ocular e previne a síndrome do olho seco causada pelo uso prolongado de telas.",
  },
  {
    id: "2",
    iconType: "activity",
    title: "Micro-pausas de mobilidade",
    description: "Levante-se a cada 30-45 minutos para uma caminhada curta. Mesmo 2 minutos de movimento ajudam a ativar a circulação, reduzir dores nas costas e aumentar a concentração.",
  },
  {
    id: "3",
    iconType: "droplet",
    title: "Hidratação constante",
    description: "Beba água regularmente ao longo do dia, não apenas quando sentir sede. A desidratação afeta a concentração e pode causar dores de cabeça. Tenha sempre uma garrafa por perto.",
  },
  {
    id: "4",
    iconType: "dumbbell",
    title: "Alongamentos no trabalho",
    description: "Alongue pescoço, ombros e pulsos a cada hora. Gire os ombros para trás, incline a cabeça suavemente para cada lado e estenda os braços. Previne tensão muscular e lesões.",
  },
  {
    id: "5",
    iconType: "brain",
    title: "Pausas mentais focadas",
    description: "Pratique a técnica Pomodoro: 25 minutos de foco intenso seguidos de 5 minutos de descanso. Isso melhora a produtividade e reduz o esgotamento mental ao longo do dia.",
  },
  {
    id: "6",
    iconType: "sun",
    title: "Iluminação adequada",
    description: "Posicione sua tela perpendicular às janelas para evitar reflexos. A luz natural é ideal, mas evite que incida diretamente na tela ou nos seus olhos. Ajuste o brilho conforme o ambiente.",
  },
  {
    id: "7",
    iconType: "heart",
    title: "Respiração consciente",
    description: "Faça 3 respirações profundas quando sentir tensão. Inspire pelo nariz por 4 segundos, segure por 4, expire pela boca por 4. Reduz o estresse e oxigena o cérebro.",
  },
  {
    id: "8",
    iconType: "coffee",
    title: "Pausas estratégicas",
    description: "Use as pausas para sair do ambiente de trabalho. Tome um café na cozinha, vá até a janela, ou converse brevemente com alguém. A mudança de cenário renova a mente.",
  },
  {
    id: "9",
    iconType: "tree",
    title: "Contato com natureza",
    description: "Se possível, mantenha plantas no ambiente de trabalho ou próximo a janelas com vista para áreas verdes. O contato visual com natureza reduz estresse e melhora o humor.",
  },
  {
    id: "10",
    iconType: "book",
    title: "Desconexão ao fim do dia",
    description: "Defina um horário para encerrar o trabalho e desligue notificações. Leia um livro físico ou faça atividades offline. Isso ajuda a separar trabalho e vida pessoal.",
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
  dumbbell: Dumbbell,
};

const colorVariants = [
  { color: "text-primary", bgColor: "bg-primary/10" },
  { color: "text-secondary", bgColor: "bg-secondary/10" },
  { color: "text-accent", bgColor: "bg-accent/10" },
];

export const HealthTips = () => {
  // Show 5 random tips
  const displayTips = staticTips.slice(0, 5);

  return (
    <Card className="p-5 md:p-6 glass-strong shadow-card border-0 animate-fade-in">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gradient">Dicas de Saúde</h2>
          <p className="text-muted-foreground text-sm">
            Cuide da sua saúde enquanto trabalha
          </p>
        </div>

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
      </div>
    </Card>
  );
};
