import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Cake,
  Camera,
  User,
  Wand2,
  Trophy,
  Star,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useGamification } from "@/hooks/useGamification";

import waterBreakImg from "@/assets/water-break.png";
import stretchingBreakImg from "@/assets/stretching-break.png";
import eyeBreakImg from "@/assets/eye-break.png";
import logoOfficeWell from "@/assets/logo-officewell.png";

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
  low: { 
    label: "Baixa", 
    color: "bg-muted/50 text-muted-foreground border-muted-foreground/20", 
    icon: Info,
    gradient: "from-slate-500/10 to-slate-600/5",
    iconColor: "text-slate-400",
    glow: ""
  },
  normal: { 
    label: "Normal", 
    color: "bg-blue-500/20 text-blue-400 border-blue-400/30", 
    icon: Info,
    gradient: "from-blue-500/10 via-indigo-500/5 to-blue-600/10",
    iconColor: "text-blue-400",
    glow: ""
  },
  high: { 
    label: "Alta", 
    color: "bg-amber-500/20 text-amber-400 border-amber-400/30", 
    icon: AlertCircle,
    gradient: "from-amber-500/15 via-orange-500/10 to-yellow-500/15",
    iconColor: "text-amber-400",
    glow: "shadow-amber-500/20"
  },
  urgent: { 
    label: "Urgente", 
    color: "bg-red-500/20 text-red-400 border-red-400/30 animate-pulse", 
    icon: AlertTriangle,
    gradient: "from-red-500/20 via-rose-500/15 to-red-600/20",
    iconColor: "text-red-400",
    glow: "shadow-red-500/30 shadow-lg"
  },
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

interface UserProfile {
  name: string;
  avatarUrl: string | null;
}

const getStoredProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem('hr-demo-profile');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading profile from localStorage:', e);
  }
  return { name: 'Conta Demo RH', avatarUrl: null };
};

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
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredProfile);
  const [editName, setEditName] = useState(userProfile.name);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // Gamification stats
  const { stats, getCurrentRank, getNextRank, getProgressToNextRank } = useGamification();
  const currentRank = getCurrentRank();
  const nextRank = getNextRank();
  const progressToNextRank = getProgressToNextRank();

  // Track page visibility to pause carousels when minimized
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  useEffect(() => {
    localStorage.setItem('hr-demo-profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const handleSaveName = () => {
    if (editName.trim()) {
      setUserProfile(prev => ({ ...prev, name: editName.trim() }));
      toast.success("Nome atualizado!");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Convert to base64 for localStorage
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUserProfile(prev => ({ ...prev, avatarUrl: base64 }));
      toast.success("Foto atualizada!");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAvatar = async () => {
    setIsGeneratingAvatar(true);
    try {
      const initials = userProfile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      
      // Generate a simple avatar using UI Avatars
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&size=128&background=random&color=fff&bold=true`;
      setUserProfile(prev => ({ ...prev, avatarUrl }));
      toast.success("Avatar gerado!");
    } catch (error) {
      toast.error("Erro ao gerar avatar");
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

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

  // Auto-rotate announcements (only when page is visible)
  useEffect(() => {
    if (announcements.length <= 1 || !isPageVisible) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length, isPageVisible]);

  // Auto-rotate motivational messages when no announcements (only when page is visible)
  useEffect(() => {
    if (announcements.length > 0 || !isPageVisible) return;
    
    const interval = setInterval(() => {
      setMotivationalIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [announcements.length, isPageVisible]);

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

  // Auto-rotate birthdays (only when page is visible)
  useEffect(() => {
    if (birthdayData.employees.length <= 1 || !isPageVisible) return;
    
    const interval = setInterval(() => {
      setBirthdayIndex((prev) => (prev + 1) % birthdayData.employees.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [birthdayData.employees.length, isPageVisible]);

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
    <TooltipProvider delayDuration={300}>
    <div className="w-full max-w-2xl mx-auto space-y-4">

      {/* Announcements or Motivational Messages Carousel */}
      {announcements.length > 0 ? (
        (() => {
          const priority = currentAnnouncement?.priority as keyof typeof priorityConfig || "normal";
          const config = priorityConfig[priority] || priorityConfig.normal;
          const PriorityIcon = config.icon;
          
          return (
            <div className={`relative overflow-hidden rounded-2xl border border-border/50 backdrop-blur-xl bg-gradient-to-br ${config.gradient} ${config.glow} transition-all duration-500`}>
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} blur-3xl opacity-50`} />
                <div className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-gradient-to-tr ${config.gradient} blur-2xl opacity-30`} />
              </div>

              <div className="relative p-6">
                {/* Header with icon */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ${config.glow}`}>
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                    Comunicados do RH
                  </span>
                  {announcements.length > 1 && (
                    <Badge variant="secondary" className="text-xs bg-muted/50">
                      {currentIndex + 1}/{announcements.length}
                    </Badge>
                  )}
                </div>

                <div className="min-h-[100px] flex flex-col items-center justify-center">
                  {currentAnnouncement && (
                    <div 
                      key={currentAnnouncement.id} 
                      className="text-center animate-fade-in space-y-3"
                    >
                      {/* Title with priority indicator */}
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <PriorityIcon className={`h-5 w-5 ${config.iconColor}`} />
                          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            {currentAnnouncement.title}
                          </h3>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium ${config.color} border px-3 py-0.5`}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      
                      {/* Content */}
                      <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                        {currentAnnouncement.content}
                      </p>
                      
                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground/60">
                        {format(parseISO(currentAnnouncement.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                {announcements.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted/80 hover:scale-110 transition-all duration-200 shadow-lg"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted/80 hover:scale-110 transition-all duration-200 shadow-lg"
                      aria-label="Próximo"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Enhanced dots indicator */}
                    <div className="flex items-center justify-center gap-2 mt-5">
                      {announcements.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentIndex 
                              ? "bg-primary w-6 shadow-lg shadow-primary/30" 
                              : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50 hover:w-3"
                          }`}
                          aria-label={`Ir para aviso ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()
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
    </TooltipProvider>
  );
};
