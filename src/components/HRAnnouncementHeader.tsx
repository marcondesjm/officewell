import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Megaphone, 
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Sparkles,
  Heart,
  Coffee,
  Smile,
  Sun,
  Cake
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import waterBreakImg from "@/assets/water-break.png";
import stretchingBreakImg from "@/assets/stretching-break.png";
import eyeBreakImg from "@/assets/eye-break.png";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string | null;
  created_at: string;
}

interface Employee {
  id: string;
  name: string;
  department: string | null;
  avatar_url: string | null;
  birthday: string | null;
}

const priorityConfig = {
  low: { label: "Baixa", color: "bg-muted text-muted-foreground", icon: Info },
  normal: { label: "Normal", color: "bg-blue-500/10 text-blue-500", icon: Info },
  high: { label: "Alta", color: "bg-orange-500/10 text-orange-500", icon: AlertCircle },
  urgent: { label: "Urgente", color: "bg-red-500/10 text-red-500", icon: AlertTriangle },
};

const motivationalMessages = [
  {
    title: "Hidrate-se! 💧",
    content: "Beber água regularmente melhora sua concentração e produtividade.",
    image: waterBreakImg,
    icon: Sparkles,
  },
  {
    title: "Hora de alongar! 🧘",
    content: "Pequenas pausas para alongamento previnem dores e aumentam seu bem-estar.",
    image: stretchingBreakImg,
    icon: Heart,
  },
  {
    title: "Descanse seus olhos 👀",
    content: "A cada 20 minutos, olhe para algo a 6 metros por 20 segundos.",
    image: eyeBreakImg,
    icon: Sun,
  },
  {
    title: "Você está indo bem! ⭐",
    content: "Lembre-se: cuidar de si mesmo é o primeiro passo para o sucesso.",
    image: stretchingBreakImg,
    icon: Smile,
  },
  {
    title: "Pausa para o café? ☕",
    content: "Aproveite para esticar as pernas e renovar sua energia.",
    image: waterBreakImg,
    icon: Coffee,
  },
];

export const HRAnnouncementHeader = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [motivationalIndex, setMotivationalIndex] = useState(() => 
    Math.floor(Math.random() * motivationalMessages.length)
  );
  const [birthdayData, setBirthdayData] = useState<{
    employees: Employee[];
    type: 'today' | 'week' | 'month';
  }>({ employees: [], type: 'today' });
  const [birthdayIndex, setBirthdayIndex] = useState(0);

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

  const fetchBirthdays = async () => {
    try {
      const { data: employees, error } = await supabase
        .from("employees")
        .select("*");
      
      if (error) throw error;
      
      const today = new Date();
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();
      
      // Helper to check if birthday is today
      const isBirthdayToday = (emp: Employee) => {
        if (!emp.birthday) return false;
        const birthDate = parseISO(emp.birthday);
        return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
      };
      
      // Helper to check if birthday is this week (next 7 days)
      const isBirthdayThisWeek = (emp: Employee) => {
        if (!emp.birthday) return false;
        const birthDate = parseISO(emp.birthday);
        const birthMonth = birthDate.getMonth() + 1;
        const birthDay = birthDate.getDate();
        
        for (let i = 1; i <= 7; i++) {
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + i);
          if (futureDate.getMonth() + 1 === birthMonth && futureDate.getDate() === birthDay) {
            return true;
          }
        }
        return false;
      };
      
      // Helper to check if birthday is this month
      const isBirthdayThisMonth = (emp: Employee) => {
        if (!emp.birthday) return false;
        const birthDate = parseISO(emp.birthday);
        const birthMonth = birthDate.getMonth() + 1;
        const birthDay = birthDate.getDate();
        // Only future days this month
        return birthMonth === todayMonth && birthDay > todayDay;
      };
      
      // Sort by upcoming birthday date
      const sortByUpcomingBirthday = (a: Employee, b: Employee) => {
        if (!a.birthday || !b.birthday) return 0;
        const aDate = parseISO(a.birthday);
        const bDate = parseISO(b.birthday);
        const aDay = aDate.getDate();
        const bDay = bDate.getDate();
        return aDay - bDay;
      };
      
      // Check today first
      const todayBirthdays = (employees || []).filter(isBirthdayToday);
      if (todayBirthdays.length > 0) {
        setBirthdayData({ employees: todayBirthdays, type: 'today' });
        return;
      }
      
      // Check this week
      const weekBirthdays = (employees || []).filter(isBirthdayThisWeek).sort(sortByUpcomingBirthday);
      if (weekBirthdays.length > 0) {
        setBirthdayData({ employees: weekBirthdays, type: 'week' });
        return;
      }
      
      // Check this month
      const monthBirthdays = (employees || []).filter(isBirthdayThisMonth).sort(sortByUpcomingBirthday);
      if (monthBirthdays.length > 0) {
        setBirthdayData({ employees: monthBirthdays, type: 'month' });
        return;
      }
      
      setBirthdayData({ employees: [], type: 'today' });
    } catch (error) {
      console.error("Error fetching birthdays:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchBirthdays();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          console.log('Announcement change received:', payload);
          fetchAnnouncements();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        () => {
          fetchBirthdays();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  // Auto-rotate motivational messages when no announcements
  useEffect(() => {
    if (announcements.length > 0) return;
    
    const interval = setInterval(() => {
      setMotivationalIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const goToPreviousMotivational = () => {
    setMotivationalIndex((prev) => (prev - 1 + motivationalMessages.length) % motivationalMessages.length);
  };

  const goToNextMotivational = () => {
    setMotivationalIndex((prev) => (prev + 1) % motivationalMessages.length);
  };

  // Auto-rotate birthdays
  useEffect(() => {
    if (birthdayData.employees.length <= 1) return;
    
    const interval = setInterval(() => {
      setBirthdayIndex((prev) => (prev + 1) % birthdayData.employees.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [birthdayData.employees.length]);

  const goToPreviousBirthday = () => {
    setBirthdayIndex((prev) => (prev - 1 + birthdayData.employees.length) % birthdayData.employees.length);
  };

  const goToNextBirthday = () => {
    setBirthdayIndex((prev) => (prev + 1) % birthdayData.employees.length);
  };

  const currentAnnouncement = announcements[currentIndex];
  const currentMotivational = motivationalMessages[motivationalIndex];
  const currentBirthday = birthdayData.employees[birthdayIndex];
  
  const getBirthdayTitle = () => {
    switch (birthdayData.type) {
      case 'today':
        return '🎉 Aniversariantes de Hoje 🎉';
      case 'week':
        return '🎂 Próximos Aniversariantes da Semana';
      case 'month':
        return '📅 Próximos Aniversariantes do Mês';
      default:
        return '🎉 Aniversariantes 🎉';
    }
  };

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

      {/* Birthdays */}
      {birthdayData.employees.length > 0 && (
        <div className="glass rounded-2xl p-4 border border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-purple-500/5 relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Cake className="h-5 w-5 text-pink-500" />
            <span className="text-sm font-medium text-pink-500">
              {getBirthdayTitle()}
            </span>
          </div>
          
          <div className="min-h-[60px] flex items-center justify-center">
            {currentBirthday && (
              <div 
                key={currentBirthday.id} 
                className="flex items-center gap-3 bg-background/50 rounded-full px-4 py-2 border border-pink-500/20 animate-fade-in"
              >
                <Avatar className="h-10 w-10 border-2 border-pink-500/50">
                  <AvatarImage src={currentBirthday.avatar_url || undefined} alt={currentBirthday.name} />
                  <AvatarFallback className="bg-pink-500/20 text-pink-700">
                    {currentBirthday.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">{currentBirthday.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {currentBirthday.department && (
                      <span>{currentBirthday.department}</span>
                    )}
                    {birthdayData.type !== 'today' && currentBirthday.birthday && (
                      <>
                        {currentBirthday.department && <span>•</span>}
                        <span className="text-pink-500">
                          {format(parseISO(currentBirthday.birthday), "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          {birthdayData.employees.length > 1 && (
            <>
              <button
                onClick={goToPreviousBirthday}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-muted/50 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToNextBirthday}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-muted/50 transition-colors"
                aria-label="Próximo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {birthdayData.employees.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setBirthdayIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === birthdayIndex 
                        ? "bg-pink-500 w-4" 
                        : "bg-pink-500/30 hover:bg-pink-500/50"
                    }`}
                    aria-label={`Ir para aniversariante ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Announcements or Motivational Messages Carousel */}
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
        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Image */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20">
              <img 
                src={currentMotivational.image} 
                alt={currentMotivational.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="text-center md:text-left flex-1 animate-fade-in">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <currentMotivational.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Dica de Bem-estar
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {currentMotivational.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base">
                {currentMotivational.content}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <button
            onClick={goToPreviousMotivational}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-muted/50 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNextMotivational}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-muted/50 transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {motivationalMessages.map((_, index) => (
              <button
                key={index}
                onClick={() => setMotivationalIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === motivationalIndex 
                    ? "bg-primary w-4" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Ir para mensagem ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
