import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Droplets, Eye, Activity, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

const moodEmojis: Record<MoodType, string> = {
  great: '😄',
  good: '🙂',
  okay: '😐',
  bad: '😕',
  terrible: '😢',
};

const getSessionId = () => {
  let sessionId = localStorage.getItem('officewell_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('officewell_session_id', sessionId);
  }
  return sessionId;
};

const FAQ: Record<string, string> = {
  "água": "💧 Recomendamos beber água a cada 30-45 minutos. O OfficeWell te lembra automaticamente! Mantenha uma garrafa de água na sua mesa para facilitar.",
  "pausa": "🧘 Pausas regulares são essenciais! Recomendamos uma pausa para alongamento a cada 45-60 minutos e uma pausa para os olhos a cada 20 minutos.",
  "alongamento": "🤸 Alongamentos ajudam a prevenir LER/DORT. Foque em pescoço, ombros, punhos e costas. O app mostra exercícios guiados durante as pausas.",
  "olhos": "👁️ A regra 20-20-20: a cada 20 minutos, olhe para algo a 20 pés (6 metros) por 20 segundos. Isso reduz a fadiga ocular.",
  "ergonomia": "🪑 Postura correta: pés apoiados no chão, costas retas, monitor na altura dos olhos, braços em 90°. Use o checklist ergonômico do app!",
  "pontos": "⭐ Você ganha pontos completando pausas e metas. Use-os para subir no ranking e desbloquear conquistas!",
  "ler": "⚠️ LER (Lesão por Esforço Repetitivo) pode ser prevenida com pausas regulares, postura correta e exercícios. O app monitora seu risco.",
  "notificação": "🔔 Configure suas notificações em Configurações. Você pode escolher quais lembretes receber e em quais horários.",
  "meta": "🎯 Defina metas diárias de hidratação e pausas. Metas alcançadas rendem pontos extras e melhoram sua saúde!",
  "ajuda": "❓ Posso ajudar com: água, pausas, alongamento, olhos, ergonomia, pontos, LER, notificações e metas. Digite uma palavra-chave!",
};

const findAnswer = (question: string): string => {
  const lowerQuestion = question.toLowerCase();
  
  for (const [keyword, answer] of Object.entries(FAQ)) {
    if (lowerQuestion.includes(keyword)) {
      return answer;
    }
  }
  
  // Check for greetings
  if (lowerQuestion.match(/^(oi|olá|ola|hey|eae|e aí)/)) {
    return "👋 Olá! Sou o assistente do OfficeWell. Como posso ajudar? Digite 'ajuda' para ver os tópicos disponíveis.";
  }
  
  if (lowerQuestion.match(/(obrigad|valeu|thanks)/)) {
    return "😊 Por nada! Estou aqui para ajudar. Cuide-se e boas pausas!";
  }
  
  return "🤔 Não entendi sua pergunta. Tente palavras-chave como: água, pausa, alongamento, olhos, ergonomia, pontos, LER, notificação ou meta.";
};

export function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "👋 Olá! Sou o assistente virtual do OfficeWell. Como posso ajudar você hoje? Use os botões rápidos ou digite sua dúvida!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  // Fetch today's mood
  useEffect(() => {
    const fetchTodayMood = async () => {
      const sessionId = getSessionId();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('mood_logs')
        .select('mood')
        .eq('session_id', sessionId)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setCurrentMood(data[0].mood as MoodType);
      }
    };

    fetchTodayMood();
  }, []);

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    addMessage(input, false);
    
    setTimeout(() => {
      const answer = findAnswer(input);
      addMessage(answer, true);
    }, 500);
    
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const quickActions: QuickAction[] = [
    {
      label: "Água",
      icon: <Droplets className="h-4 w-4" />,
      action: () => {
        addMessage("Como funciona o lembrete de água?", false);
        setTimeout(() => addMessage(FAQ["água"], true), 500);
      },
    },
    {
      label: "Olhos",
      icon: <Eye className="h-4 w-4" />,
      action: () => {
        addMessage("Como cuidar dos olhos?", false);
        setTimeout(() => addMessage(FAQ["olhos"], true), 500);
      },
    },
    {
      label: "Ergonomia",
      icon: <Activity className="h-4 w-4" />,
      action: () => {
        addMessage("Dicas de ergonomia", false);
        setTimeout(() => addMessage(FAQ["ergonomia"], true), 500);
      },
    },
    {
      label: "Ajuda",
      icon: <HelpCircle className="h-4 w-4" />,
      action: () => {
        addMessage("Ajuda", false);
        setTimeout(() => addMessage(FAQ["ajuda"], true), 500);
      },
    },
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0 : 1 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    Assistente OfficeWell
                    {currentMood && (
                      <span className="text-lg" title={`Humor: ${currentMood}`}>
                        {moodEmojis[currentMood]}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs opacity-80">Online agora</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="h-[320px] p-4">
              <div className="flex flex-col gap-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2 ${
                      message.isBot ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.isBot
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {message.isBot ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        message.isBot
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="flex gap-2 border-t bg-muted/30 p-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="flex-1 gap-1 text-xs"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2 border-t p-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua dúvida..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
