import { X, ExternalLink, Building2, Sparkles, ShoppingBag, Utensils, Car, Briefcase, Heart, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Partner {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  iconBg: string;
  buttonGradient: string;
  shadowColor: string;
  textGradient: string;
  badge?: string;
}

const partners: Partner[] = [
  {
    id: "doorvii",
    name: "DoorVII",
    description: "Gestão inteligente de condomínios e portarias digitais",
    url: "https://doorvii.lovable.app",
    icon: Building2,
    gradient: "from-indigo-600/20 via-violet-600/20 to-purple-600/20",
    borderColor: "border-indigo-500/30",
    iconBg: "from-indigo-500 to-violet-600",
    buttonGradient: "from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500",
    shadowColor: "shadow-violet-500/25",
    textGradient: "from-indigo-400 to-violet-400",
    badge: "Novo",
  },
  {
    id: "marketplace",
    name: "ShopFlow",
    description: "Marketplace completo para pequenos negócios locais",
    url: "https://shopflow.lovable.app",
    icon: ShoppingBag,
    gradient: "from-emerald-600/20 via-green-600/20 to-teal-600/20",
    borderColor: "border-emerald-500/30",
    iconBg: "from-emerald-500 to-green-600",
    buttonGradient: "from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500",
    shadowColor: "shadow-emerald-500/25",
    textGradient: "from-emerald-400 to-green-400",
    badge: "Popular",
  },
  {
    id: "fooddelivery",
    name: "FoodExpress",
    description: "Delivery de comida saudável direto no seu escritório",
    url: "https://foodexpress.lovable.app",
    icon: Utensils,
    gradient: "from-orange-600/20 via-amber-600/20 to-yellow-600/20",
    borderColor: "border-orange-500/30",
    iconBg: "from-orange-500 to-amber-600",
    buttonGradient: "from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500",
    shadowColor: "shadow-orange-500/25",
    textGradient: "from-orange-400 to-amber-400",
  },
  {
    id: "carpool",
    name: "RideShare",
    description: "Compartilhe caronas com colegas de trabalho",
    url: "https://rideshare.lovable.app",
    icon: Car,
    gradient: "from-blue-600/20 via-cyan-600/20 to-sky-600/20",
    borderColor: "border-blue-500/30",
    iconBg: "from-blue-500 to-cyan-600",
    buttonGradient: "from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500",
    shadowColor: "shadow-blue-500/25",
    textGradient: "from-blue-400 to-cyan-400",
    badge: "Eco",
  },
  {
    id: "taskmanager",
    name: "TaskPro",
    description: "Organize suas tarefas e aumente sua produtividade",
    url: "https://taskpro.lovable.app",
    icon: Briefcase,
    gradient: "from-rose-600/20 via-pink-600/20 to-fuchsia-600/20",
    borderColor: "border-rose-500/30",
    iconBg: "from-rose-500 to-pink-600",
    buttonGradient: "from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500",
    shadowColor: "shadow-rose-500/25",
    textGradient: "from-rose-400 to-pink-400",
  },
  {
    id: "wellness",
    name: "MindfulMe",
    description: "Meditação e bem-estar mental para profissionais",
    url: "https://mindfulme.lovable.app",
    icon: Heart,
    gradient: "from-purple-600/20 via-violet-600/20 to-indigo-600/20",
    borderColor: "border-purple-500/30",
    iconBg: "from-purple-500 to-violet-600",
    buttonGradient: "from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500",
    shadowColor: "shadow-purple-500/25",
    textGradient: "from-purple-400 to-violet-400",
  },
];

export const PartnersBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isPaused]);

  if (dismissed) return null;

  const partner = partners[currentIndex];
  const Icon = partner.icon;

  const handleClick = () => {
    window.open(partner.url, "_blank", "noopener,noreferrer");
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + partners.length) % partners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % partners.length);
  };

  return (
    <div 
      className="relative overflow-hidden rounded-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={partner.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`relative bg-gradient-to-r ${partner.gradient} border ${partner.borderColor} p-4`}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-xl" />
          
          {/* Close button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {/* Navigation arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <div className="flex items-center justify-between gap-4 px-8 relative">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${partner.iconBg} flex items-center justify-center shadow-lg ${partner.shadowColor}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-lg bg-gradient-to-r ${partner.textGradient} bg-clip-text text-transparent`}>
                    {partner.name}
                  </p>
                  {partner.badge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-medium">
                      <Sparkles className="h-3 w-3" />
                      {partner.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {partner.description}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleClick} 
              size="sm" 
              className={`gap-1.5 shrink-0 bg-gradient-to-r ${partner.buttonGradient} text-white border-0 shadow-lg ${partner.shadowColor}`}
            >
              Conhecer
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Pagination dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {partners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? "w-6 bg-foreground/60" 
                    : "bg-foreground/20 hover:bg-foreground/30"
                }`}
                aria-label={`Ir para parceiro ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Sponsor label */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[9px] text-muted-foreground/50">
            <Zap className="h-3 w-3" />
            Parceiro
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
