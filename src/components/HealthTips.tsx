import { Clock, BookOpen, TreePine, Coffee, Sun, Eye, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const tips = [
  {
    id: "1",
    icon: Clock,
    title: "Estabeleça horários fixos de trabalho",
    description: "Planejamento e organização tornam o dia mais produtivo e satisfatório, então determine um tempo para cada atividade e pare quando atingir o limite estabelecido.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "2",
    icon: BookOpen,
    title: "Leia livros físicos",
    description: "Antes de dormir é um bom horário para ler um livro físico (não digital). Assim você evita a luz azul das telas dos eletrônicos e usufrui dos benefícios da leitura.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "3",
    icon: TreePine,
    title: "Faça atividades ao ar livre",
    description: "Busque lazer no mundo offline. Existe uma infinidade de opções muito prazerosas e que ainda farão bem para sua saúde, como aliviar o estresse.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "4",
    icon: Coffee,
    title: "Faça pausas regulares",
    description: "Em alguns momentos, tire os olhos das telas para dar um descanso à visão. Nas pausas, olhe para objetos em distâncias diferentes da tela, de preferência mais longe. Assim você relaxa os músculos dos olhos.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "5",
    icon: Sun,
    title: "Deixe entrar luz natural no ambiente",
    description: "A luz mais confortável e acessível para os olhos é a luz natural. Sempre que puder, prefira deixar as janelas abertas para evitar luzes artificiais.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "6",
    icon: Eye,
    title: "Não esqueça de piscar os olhos",
    description: "Quando estamos olhando para as telas, é normal que a gente pisque menos. Esse hábito pode levar ao ressecamento dos olhos. Tente se policiar para manter a frequência das piscadas e considere usar um lubrificante ocular.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "7",
    icon: Stethoscope,
    title: "Consultas regulares ao oftalmologista",
    description: "É fundamental manter visitas ao oftalmologista pelo menos uma vez por ano. Os problemas de visão, quando descobertos precocemente, são muito mais fáceis e rápidos de tratar.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export const HealthTips = () => {
  return (
    <Card className="p-5 md:p-6 glass-strong shadow-card border-0 animate-fade-in">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gradient">Dicas de Saúde</h2>
          <p className="text-muted-foreground text-sm">
            Cuide da sua saúde enquanto trabalha em casa
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {tips.map((tip) => (
            <AccordionItem
              key={tip.id}
              value={tip.id}
              className="border rounded-xl px-4 bg-card/50 hover:bg-card/80 transition-colors"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <div className={`p-2 rounded-lg ${tip.bgColor}`}>
                    <tip.icon size={20} className={tip.color} />
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
          ))}
        </Accordion>
      </div>
    </Card>
  );
};
