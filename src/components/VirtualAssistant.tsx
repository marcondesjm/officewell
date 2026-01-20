import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Droplets, Eye, Activity, HelpCircle, Trash2, Smile } from "lucide-react";
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

const moodLabels: Record<MoodType, string> = {
  great: 'ótimo',
  good: 'bem',
  okay: 'neutro',
  bad: 'mal',
  terrible: 'péssimo',
};

// Mood-based tips and responses
const moodTips: Record<MoodType, string[]> = {
  great: [
    "🌟 Que ótimo que você está se sentindo bem! Aproveite essa energia positiva para manter boas práticas de saúde.",
    "✨ Seu humor está excelente! Lembre-se de fazer pausas regulares para manter esse bem-estar.",
    "🎉 Fantástico! Continue assim e não esqueça de se hidratar para manter a energia!",
  ],
  good: [
    "😊 Bom saber que está bem! Uma pausa para alongamento pode deixar você ainda melhor.",
    "👍 Está num bom ritmo! Que tal um copo de água para manter a disposição?",
    "🌈 Ótimo humor! Mantenha a postura correta para continuar se sentindo assim.",
  ],
  okay: [
    "🧘 Está neutro? Uma pequena pausa para alongamento pode melhorar seu dia!",
    "💧 Às vezes um copo de água e uma pausa rápida fazem diferença no humor.",
    "🌱 Que tal uma caminhada rápida ou alguns exercícios de respiração?",
  ],
  bad: [
    "💙 Sinto que não está 100%. Uma pausa para descansar os olhos pode ajudar.",
    "🤗 Dias difíceis acontecem. Tente uma pausa de 5 minutos para respirar.",
    "🌿 Quando não estamos bem, pequenas pausas fazem diferença. Cuide-se!",
  ],
  terrible: [
    "❤️ Sinto muito que não está bem. Considere uma pausa maior se possível.",
    "🫂 Dias assim são difíceis. Lembre-se: está tudo bem não estar bem às vezes.",
    "💜 Se precisar, faça uma pausa. Sua saúde mental é tão importante quanto a física.",
  ],
};

const getRandomMoodTip = (mood: MoodType): string => {
  const tips = moodTips[mood];
  return tips[Math.floor(Math.random() * tips.length)];
};

const getSessionId = () => {
  let sessionId = localStorage.getItem('officewell_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('officewell_session_id', sessionId);
  }
  return sessionId;
};

// Setembro Amarelo - Mental Health Resources
const SETEMBRO_AMARELO_INFO = {
  warning_signs: `🎗️ **Setembro Amarelo - Sinais de Alerta**

⚠️ Fique atento a estes sinais em você ou colegas:
• Isolamento social excessivo
• Mudanças bruscas de humor
• Desesperança ou falta de propósito
• Falar sobre ser um "fardo" para outros
• Alterações no sono ou apetite
• Perda de interesse em atividades
• Despedidas incomuns

💛 Se identificar algum sinal, busque ajuda profissional.`,

  resources: `💛 **Recursos de Ajuda - Você Não Está Sozinho**

📞 **CVV - Centro de Valorização da Vida**
Ligue 188 (24h) ou acesse cvv.org.br

📱 **CAPS - Centro de Atenção Psicossocial**
Procure a unidade mais próxima

🏥 **UBS - Unidade Básica de Saúde**
Atendimento gratuito pelo SUS

💬 **Aplicativos de apoio:**
• CVV Chat (cvv.org.br)
• Vittude
• Zenklub

❤️ Pedir ajuda é um ato de coragem!`,

  general: `🎗️ **Setembro Amarelo - Prevenção ao Suicídio**

Setembro é o mês de conscientização sobre saúde mental e prevenção ao suicídio.

💛 Lembre-se:
• Está tudo bem não estar bem
• Buscar ajuda é sinal de força
• Você importa e faz diferença

📞 CVV: 188 (ligação gratuita, 24h)
🌐 cvv.org.br (chat online)

Digite "sinais" para ver sinais de alerta ou "recursos" para ver onde buscar ajuda.`
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
  "ajuda": "❓ Posso ajudar com: água, pausas, alongamento, olhos, ergonomia, pontos, LER, notificações, metas, humor e Setembro Amarelo. Digite uma palavra-chave!",
  "humor": "😊 Registre seu humor diariamente no card 'Como você está se sentindo?'. Acompanhar suas emoções ajuda a entender padrões de bem-estar!",
};

const findAnswer = (question: string, mood: MoodType | null): string => {
  const lowerQuestion = question.toLowerCase();
  
  // Check for Setembro Amarelo / Mental Health keywords FIRST (priority)
  if (lowerQuestion.match(/(setembro amarelo|amarelo|suicídio|suicidio|depressão|depressao|ansiedade|desespero|sem esperança|sem esperanca|não aguento|nao aguento|desistir|me machucar|cvv|188)/)) {
    // Check for specific sub-topics
    if (lowerQuestion.match(/(sinal|sinais|alerta|sintoma|identificar)/)) {
      return SETEMBRO_AMARELO_INFO.warning_signs;
    }
    if (lowerQuestion.match(/(recurso|ajuda|apoio|telefone|ligar|onde|cvv|188|caps|psicólogo|psicologo)/)) {
      return SETEMBRO_AMARELO_INFO.resources;
    }
    return SETEMBRO_AMARELO_INFO.general;
  }

  // Check for crisis keywords - always show resources
  if (lowerQuestion.match(/(quero morrer|não consigo mais|nao consigo mais|acabar com tudo|sem saída|sem saida|me matar)/)) {
    return `💛 **Você não está sozinho. Sua vida importa.**

📞 **Ligue agora para o CVV: 188** (gratuito, 24h)
🌐 Ou acesse cvv.org.br para chat online

Alguém está pronto para te ouvir, sem julgamentos.

❤️ Aguente firme. Buscar ajuda é o primeiro passo.`;
  }
  
  // Check for mood-related questions
  if (lowerQuestion.match(/(como estou|meu humor|sentindo|emoção|emocional)/)) {
    if (mood) {
      return `${moodEmojis[mood]} Você registrou que está se sentindo ${moodLabels[mood]} hoje. ${getRandomMoodTip(mood)}`;
    }
    return "😊 Você ainda não registrou seu humor hoje. Use o card 'Como você está se sentindo?' para registrar!";
  }

  // Check for tip/suggestion requests
  if (lowerQuestion.match(/(dica|sugestão|conselho|recomend)/)) {
    if (mood) {
      return getRandomMoodTip(mood);
    }
    return "💡 Registre seu humor primeiro para receber dicas personalizadas! Enquanto isso: lembre-se de fazer pausas regulares.";
  }
  
  for (const [keyword, answer] of Object.entries(FAQ)) {
    if (lowerQuestion.includes(keyword)) {
      // Add mood-specific suffix for certain topics
      if (mood && (mood === 'bad' || mood === 'terrible') && ['pausa', 'alongamento'].includes(keyword)) {
        return answer + "\n\n💙 Percebi que você não está 100% hoje. Cuide-se e faça pausas quando precisar.";
      }
      return answer;
    }
  }
  
  // Check for greetings - personalize based on mood
  if (lowerQuestion.match(/^(oi|olá|ola|hey|eae|e aí)/)) {
    if (mood) {
      const moodGreeting = mood === 'great' || mood === 'good' 
        ? `Que bom que você está ${moodLabels[mood]}! ` 
        : mood === 'bad' || mood === 'terrible'
        ? `Vi que não está 100% hoje. Estou aqui para ajudar! `
        : '';
      return `👋 Olá! ${moodGreeting}Sou o assistente do OfficeWell. Como posso ajudar? Digite 'ajuda' para ver os tópicos disponíveis.`;
    }
    return "👋 Olá! Sou o assistente do OfficeWell. Como posso ajudar? Digite 'ajuda' para ver os tópicos disponíveis.";
  }
  
  if (lowerQuestion.match(/(obrigad|valeu|thanks)/)) {
    return "😊 Por nada! Estou aqui para ajudar. Cuide-se e boas pausas!";
  }
  
  return "🤔 Não entendi sua pergunta. Tente palavras-chave como: água, pausa, alongamento, olhos, ergonomia, pontos, LER, notificação, meta ou humor.";
};

const CHAT_STORAGE_KEY = 'officewell_assistant_chat';

const getWelcomeMessage = (): Message => ({
  id: "welcome",
  text: "👋 Olá! Sou o assistente virtual do OfficeWell. Como posso ajudar você hoje? Use os botões rápidos ou digite sua dúvida!",
  isBot: true,
  timestamp: new Date(),
});

const loadChatHistory = (): Message[] => {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (e) {
    console.error('Error loading chat history:', e);
  }
  return [getWelcomeMessage()];
};

const saveChatHistory = (messages: Message[]) => {
  try {
    // Keep only last 50 messages to avoid storage bloat
    const toSave = messages.slice(-50);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
};

export function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [moodAnimating, setMoodAnimating] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => loadChatHistory());
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage and auto-scroll whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
    // Auto-scroll to bottom when new messages are added
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

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

  // Listen for mood updates from MoodTracker
  useEffect(() => {
    const handleMoodUpdate = (event: CustomEvent<{ mood: MoodType }>) => {
      setMoodAnimating(true);
      setCurrentMood(event.detail.mood);
      setTimeout(() => setMoodAnimating(false), 600);
    };

    window.addEventListener('moodUpdated', handleMoodUpdate as EventListener);
    return () => {
      window.removeEventListener('moodUpdated', handleMoodUpdate as EventListener);
    };
  }, []);

  const clearHistory = () => {
    setMessages([getWelcomeMessage()]);
  };

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
      const answer = findAnswer(input, currentMood);
      addMessage(answer, true);
    }, 500);
    
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const getMoodResponse = (): string => {
    if (!currentMood) {
      return "😊 Você ainda não registrou seu humor hoje! Use o card 'Como você está se sentindo?' para registrar e receber dicas personalizadas.";
    }
    return `${moodEmojis[currentMood]} Você está se sentindo ${moodLabels[currentMood]} hoje.\n\n${getRandomMoodTip(currentMood)}`;
  };

  const quickActions: QuickAction[] = [
    {
      label: "Humor",
      icon: <Smile className="h-4 w-4" />,
      action: () => {
        addMessage("Como estou hoje?", false);
        setTimeout(() => addMessage(getMoodResponse(), true), 500);
      },
    },
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
                    <AnimatePresence mode="wait">
                      {currentMood && (
                        <motion.span 
                          key={currentMood}
                          className="text-lg"
                          title={`Humor: ${currentMood}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ 
                            scale: moodAnimating ? [1, 1.4, 1] : 1, 
                            rotate: 0 
                          }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 15 
                          }}
                        >
                          {moodEmojis[currentMood]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </h3>
                  <p className="text-xs opacity-80">Online agora</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearHistory}
                  className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                  title="Limpar histórico"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-[320px] p-4">
              <div className="flex flex-col gap-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${
                      message.isBot ? "items-start" : "items-end"
                    }`}
                  >
                    <div
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
                    </div>
                    <span className={`text-[10px] text-muted-foreground mt-1 ${
                      message.isBot ? "ml-10" : "mr-10"
                    }`}>
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </motion.div>
                ))}
                <div ref={scrollRef} />
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
