import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Megaphone, 
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCog
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string | null;
  created_at: string;
}

const priorityConfig = {
  low: { label: "Baixa", color: "bg-muted text-muted-foreground", icon: Info },
  normal: { label: "Normal", color: "bg-blue-500/10 text-blue-500", icon: Info },
  high: { label: "Alta", color: "bg-orange-500/10 text-orange-500", icon: AlertCircle },
  urgent: { label: "Urgente", color: "bg-red-500/10 text-red-500", icon: AlertTriangle },
};

export const HRAnnouncementHeader = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const currentAnnouncement = announcements[currentIndex];

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="glass rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/2 mx-auto mb-3" />
          <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* HR Demo Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => navigate("/rh")}
          variant="outline"
          className="rounded-full border-2 border-primary/50 hover:bg-primary/10 hover:border-primary gap-2"
        >
          <UserCog size={18} />
          Conta Demo RH
        </Button>
      </div>

      {/* Announcements Carousel */}
      {announcements.length > 0 ? (
        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Megaphone className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Comunicados do RH
            </span>
          </div>

          <div className="min-h-[80px] flex flex-col items-center justify-center">
            {currentAnnouncement && (
              <>
                {(() => {
                  const priority = currentAnnouncement.priority as keyof typeof priorityConfig || "normal";
                  const config = priorityConfig[priority] || priorityConfig.normal;
                  
                  return (
                    <div className="text-center animate-fade-in">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <h3 className="text-lg md:text-xl font-bold text-foreground">
                          {currentAnnouncement.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${config.color}`}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
                        {currentAnnouncement.content}
                      </p>
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* Navigation */}
          {announcements.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-muted/50 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-muted/50 transition-colors"
                aria-label="Próximo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? "bg-primary w-4" 
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Ir para aviso ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Megaphone className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Comunicados do RH
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Nenhum comunicado no momento. Acesse o painel do RH para criar avisos.
          </p>
        </div>
      )}
    </div>
  );
};
