import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cake, 
  Megaphone, 
  Users, 
  AlertTriangle,
  Info,
  AlertCircle,
  PartyPopper,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  name: string;
  department: string | null;
  birthday: string | null;
  email: string | null;
  avatar_url: string | null;
}

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

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const isBirthdayThisMonth = (birthday: string | null): boolean => {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return bday.getMonth() === today.getMonth();
};

const isBirthdayToday = (birthday: string | null): boolean => {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth();
};

const getDayOfBirthday = (birthday: string | null): number => {
  if (!birthday) return 0;
  return new Date(birthday).getDate();
};

export const HRPanel = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const { data: empData, error: empError } = await supabase
          .from("employees")
          .select("*")
          .order("name");

        if (empError) throw empError;

        // Fetch announcements
        const { data: annData, error: annError } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });

        if (annError) throw annError;

        setEmployees(empData || []);
        setAnnouncements(annData || []);
      } catch (error) {
        console.error("Error fetching HR data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter birthdays this month and sort by day
  const birthdaysThisMonth = employees
    .filter((emp) => isBirthdayThisMonth(emp.birthday))
    .sort((a, b) => getDayOfBirthday(a.birthday) - getDayOfBirthday(b.birthday));

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const currentMonth = monthNames[new Date().getMonth()];

  if (loading) {
    return (
      <Card className="p-6 glass-strong shadow-card border-0 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-strong shadow-card border-0 animate-fade-in overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl text-gradient">Painel RH</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/rh")}
            className="gap-2 text-muted-foreground hover:text-primary"
          >
            <Settings className="h-4 w-4" />
            Gerenciar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="birthdays" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="birthdays" className="gap-2">
              <Cake className="h-4 w-4" />
              Aniversários
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Avisos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="birthdays" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Aniversariantes de {currentMonth}
            </p>
            
            {birthdaysThisMonth.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {birthdaysThisMonth.map((emp) => {
                  const isToday = isBirthdayToday(emp.birthday);
                  const day = getDayOfBirthday(emp.birthday);
                  
                  return (
                    <div
                      key={emp.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isToday 
                          ? "bg-primary/10 border border-primary/30" 
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        {emp.avatar_url && <AvatarImage src={emp.avatar_url} alt={emp.name} />}
                        <AvatarFallback className={isToday ? "bg-primary text-primary-foreground" : ""}>
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{emp.name}</p>
                          {isToday && (
                            <PartyPopper className="h-4 w-4 text-primary animate-bounce" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {emp.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={isToday ? "default" : "secondary"} className="text-xs">
                          {isToday ? "Hoje! 🎉" : `Dia ${day}`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Cake className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum aniversariante este mês</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="announcements" className="space-y-3">
            {announcements.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {announcements.map((ann) => {
                  const priority = ann.priority as keyof typeof priorityConfig || "normal";
                  const config = priorityConfig[priority] || priorityConfig.normal;
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={ann.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-md ${config.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm">{ann.title}</h4>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {ann.content}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-2">
                            {new Date(ann.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Megaphone className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum aviso no momento</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
