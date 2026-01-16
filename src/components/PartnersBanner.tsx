import { X, ExternalLink, Sparkles, ChevronLeft, ChevronRight, Zap, Building2, ShoppingBag, Utensils, Car, Briefcase, Heart, Star, Rocket, Gift, Coffee, Music, Camera, Gamepad2, Palette, GraduationCap, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

// Icon mapping for dynamic icons
const iconMap: Record<string, React.ElementType> = {
  "building-2": Building2,
  "shopping-bag": ShoppingBag,
  "utensils": Utensils,
  "car": Car,
  "briefcase": Briefcase,
  "heart": Heart,
  "zap": Zap,
  "star": Star,
  "rocket": Rocket,
  "gift": Gift,
  "coffee": Coffee,
  "music": Music,
  "camera": Camera,
  "gamepad-2": Gamepad2,
  "palette": Palette,
  "graduation-cap": GraduationCap,
  "plane": Plane,
};

interface Partner {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  gradient: string;
  border_color: string;
  icon_bg: string;
  button_gradient: string;
  shadow_color: string;
  text_gradient: string;
  badge: string | null;
}

export const PartnersBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch active partners from database
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from("partners")
          .select("id, name, description, url, icon, gradient, border_color, icon_bg, button_gradient, shadow_color, text_gradient, badge")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        setPartners(data || []);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Track impression when partner is shown
  useEffect(() => {
    if (partners.length === 0 || dismissed) return;
    
    const partner = partners[currentIndex];
    if (!partner) return;

    // Track impression
    const trackImpression = async () => {
      try {
        await supabase.rpc("increment_partner_impressions", { partner_id: partner.id });
      } catch (error) {
        // Silently fail - tracking is not critical
        console.log("Could not track impression");
      }
    };

    trackImpression();
  }, [currentIndex, partners, dismissed]);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (isPaused || partners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isPaused, partners.length]);

  if (dismissed || loading || partners.length === 0) return null;

  const partner = partners[currentIndex];
  const Icon = iconMap[partner.icon] || Building2;

  const handleClick = async () => {
    // Track click
    try {
      await supabase.rpc("increment_partner_clicks", { partner_id: partner.id });
    } catch (error) {
      console.log("Could not track click");
    }
    
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
          className={`relative bg-gradient-to-r ${partner.gradient} border ${partner.border_color} p-4`}
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
          {partners.length > 1 && (
            <>
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
            </>
          )}
          
          <div className="flex items-center justify-between gap-4 px-8 relative">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${partner.icon_bg} flex items-center justify-center shadow-lg ${partner.shadow_color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-lg bg-gradient-to-r ${partner.text_gradient} bg-clip-text text-transparent`}>
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
              className={`gap-1.5 shrink-0 bg-gradient-to-r ${partner.button_gradient} text-white border-0 shadow-lg ${partner.shadow_color}`}
            >
              Conhecer
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Pagination dots */}
          {partners.length > 1 && (
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
          )}
          
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
