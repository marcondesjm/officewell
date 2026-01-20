import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Trash2, Droplets, Eye, PersonStanding, Ribbon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface VirtualAssistantProps {
  currentMood?: MoodType | null;
}

const MOOD_EMOJIS: Record<MoodType, string> = {
  great: '😄',
  good: '🙂',
  okay: '😐',
  bad: '😔',
  terrible: '😢'
};

const MOOD_GREETINGS: Record<MoodType, string> = {
  great: "Que bom te ver radiante hoje! 🌟",
  good: "Ótimo ter você por aqui! 💪",
  okay: "Estou aqui para ajudar no que precisar.",
  bad: "Lamento que não esteja bem. Como posso ajudar? 💙",
  terrible: "Sinto muito que esteja passando por um momento difícil. Estou aqui por você. 💙"
};

const MOOD_TIPS: Record<MoodType, string[]> = {
  great: [
    "Continue assim! Que tal compartilhar essa energia boa com um colega?",
    "Excelente momento para metas desafiadoras!",
    "Sua energia positiva é contagiante! 🌟"
  ],
  good: [
    "Mantenha o ritmo! Uma pausa para alongamento pode energizar ainda mais.",
    "Bom momento para focar em tarefas importantes.",
    "Continue hidratado para manter essa disposição!"
  ],
  okay: [
    "Uma caminhada rápida pode melhorar seu humor.",
    "Que tal uma pausa para os olhos? Pode ajudar a relaxar.",
    "Respire fundo algumas vezes. Pequenas pausas fazem diferença."
  ],
  bad: [
    "Faça uma pausa. Cuide de você primeiro.",
    "Um copo de água e alguns alongamentos podem ajudar.",
    "Converse com alguém de confiança. Não precisa enfrentar tudo sozinho."
  ],
  terrible: [
    "Sua saúde mental é prioridade. Considere uma pausa maior.",
    "Está tudo bem não estar bem. Procure apoio se precisar.",
    "Lembre-se: isso vai passar. Você é mais forte do que imagina. 💙"
  ]
};

// Chat history storage
const CHAT_STORAGE_KEY = 'officewell_chat_history';
const SESSION_ID_KEY = 'officewell_session_id';

const getStoredMessages = (): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (e) {
    console.error('Error loading chat history:', e);
  }
  return [];
};

const storeMessages = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
};

const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
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
  "alongamento": "🤸 Alongue-se a cada hora! Movimente pescoço, ombros, punhos e costas. Isso previne dores e melhora a circulação.",
  "olhos": "👁️ Siga a regra 20-20-20: a cada 20 minutos, olhe para algo a 20 pés (6 metros) por 20 segundos. Seus olhos agradecem!",
  "ergonomia": "🪑 Mantenha a tela na altura dos olhos, pés apoiados no chão, cotovelos a 90°. Faça nosso checklist de ergonomia!",
  "pontos": "⭐ Ganhe pontos completando pausas, bebendo água e mantendo boa postura. Quanto mais consistente, mais pontos!",
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
      const randomTip = MOOD_TIPS[mood][Math.floor(Math.random() * MOOD_TIPS[mood].length)];
      return `${MOOD_EMOJIS[mood]} Seu humor atual está registrado como "${mood}". ${randomTip}`;
    }
    return "Você ainda não registrou seu humor hoje. Use o card 'Como você está se sentindo?' para registrar!";
  }

  // Check for greetings with mood-aware responses
  if (lowerQuestion.match(/(oi|olá|ola|hey|bom dia|boa tarde|boa noite|e aí|eai)/)) {
    if (mood) {
      return `${MOOD_EMOJIS[mood]} Olá! ${MOOD_GREETINGS[mood]} Como posso ajudar?`;
    }
    return "👋 Olá! Sou o assistente do OfficeWell. Como posso ajudar você hoje?";
  }

  // Check for wellness tips based on mood
  if (lowerQuestion.match(/(dica|sugestão|sugestao|conselho|recomendação|recomendacao)/)) {
    if (mood) {
      const randomTip = MOOD_TIPS[mood][Math.floor(Math.random() * MOOD_TIPS[mood].length)];
      return `💡 Baseado em como você está se sentindo: ${randomTip}`;
    }
    return "💡 Dica: Mantenha-se hidratado, faça pausas regulares e cuide da sua postura. Pequenos hábitos fazem grande diferença!";
  }
  
  // Check FAQ keywords
  for (const [key, value] of Object.entries(FAQ)) {
    if (lowerQuestion.includes(key)) {
      return value;
    }
  }
  
  // Default response with mood awareness
  if (mood && (mood === 'bad' || mood === 'terrible')) {
    return `Entendo que pode estar passando por um momento difícil. 💙 Posso ajudar com: água, pausas, alongamento, olhos, ergonomia, pontos, LER, notificações, metas ou humor. O que você precisa?`;
  }
  
  return "🤔 Não entendi sua pergunta. Tente perguntar sobre: água, pausas, alongamento, olhos, ergonomia, pontos, LER, notificações, metas ou humor!";
};

export const VirtualAssistant = ({ currentMood }: VirtualAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const storedMessages = getStoredMessages();
    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    }
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      storeMessages(messages);
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      // ScrollArea uses a viewport element inside
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 10);
      }
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date()
    };

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: findAnswer(input, currentMood || null),
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  const handleQuickAction = (action: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: action,
      isBot: false,
      timestamp: new Date()
    };

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: findAnswer(action, currentMood || null),
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 relative"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageCircle className="h-6 w-6" />
              {currentMood && (
                <span className="absolute -top-1 -right-1 text-lg">
                  {MOOD_EMOJIS[currentMood]}
                </span>
              )}
            </>
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96"
          >
            <Card className="flex flex-col h-[500px] shadow-xl border-2">
              {/* Header */}
              <div className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">Assistente OfficeWell</h3>
                    <p className="text-xs opacity-80">
                      {currentMood ? `Humor: ${MOOD_EMOJIS[currentMood]}` : 'Como posso ajudar?'}
                    </p>
                  </div>
                </div>
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearHistory}
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                    title="Limpar histórico"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="p-2 border-b bg-muted/50 flex gap-1 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleQuickAction("água")}
                >
                  <Droplets className="h-3 w-3 mr-1" />
                  Água
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleQuickAction("olhos")}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Olhos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleQuickAction("alongamento")}
                >
                  <PersonStanding className="h-3 w-3 mr-1" />
                  Alongar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-yellow-100 hover:bg-yellow-200 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:border-yellow-600 dark:text-yellow-300"
                  onClick={() => handleQuickAction("setembro amarelo")}
                >
                  <Ribbon className="h-3 w-3 mr-1" />
                  Setembro Amarelo
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Olá! Como posso ajudar?</p>
                    <p className="text-xs mt-2">
                      Pergunte sobre água, pausas, ergonomia...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id}>
                        <div
                          className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.isBot
                                ? "bg-muted text-foreground"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">{msg.text}</p>
                          </div>
                        </div>
                        <div className={`flex ${msg.isBot ? "justify-start" : "justify-end"} mt-1`}>
                          <span className={`text-[10px] text-muted-foreground ${msg.isBot ? "ml-1" : "mr-1"}`}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua pergunta..."
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
