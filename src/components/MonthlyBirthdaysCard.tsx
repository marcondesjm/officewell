import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cake, PartyPopper, Calendar, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Employee {
  id: string;
  name: string;
  department: string | null;
  birthday: string | null;
  avatar_url: string | null;
}

const isBirthdayToday = (birthday: string | null): boolean => {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
};

const isBirthdayThisMonth = (birthday: string | null): boolean => {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return today.getMonth() === bday.getMonth();
};

const getDayOfBirthday = (birthday: string | null): number => {
  if (!birthday) return 0;
  return new Date(birthday).getDate();
};

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const MonthlyBirthdaysCard = () => {
  const [birthdays, setBirthdays] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("*");

        if (error) throw error;

        const monthBirthdays = (data || [])
          .filter((emp) => isBirthdayThisMonth(emp.birthday))
          .sort((a, b) => getDayOfBirthday(a.birthday) - getDayOfBirthday(b.birthday));

        setBirthdays(monthBirthdays);
      } catch (error) {
        console.error("Error fetching birthdays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-indigo-500/5 border-pink-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (birthdays.length === 0) {
    return null;
  }

  const todayBirthdays = birthdays.filter(emp => isBirthdayToday(emp.birthday));
  const upcomingBirthdays = birthdays.filter(emp => !isBirthdayToday(emp.birthday));

  return (
    <Card className="bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-indigo-500/10 border-pink-500/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 text-white">
            <Cake className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
            Aniversariantes de {capitalizedMonth}
          </span>
          <Badge variant="secondary" className="ml-auto bg-pink-500/20 text-pink-600 dark:text-pink-400 border-0">
            {birthdays.length} {birthdays.length === 1 ? 'pessoa' : 'pessoas'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Today's Birthdays - Highlighted */}
        {todayBirthdays.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 rounded-xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <PartyPopper className="h-5 w-5 text-pink-500 animate-bounce" />
              <span className="font-semibold text-sm text-pink-600 dark:text-pink-400">
                🎉 Aniversariantes de Hoje! 🎉
              </span>
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayBirthdays.map((emp, index) => (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/80 backdrop-blur-sm border border-pink-500/20 shadow-lg shadow-pink-500/10"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-pink-500 ring-2 ring-pink-500/30 ring-offset-2 ring-offset-background">
                      {emp.avatar_url && <AvatarImage src={emp.avatar_url} alt={emp.name} />}
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold">
                        {getInitials(emp.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -top-1 -right-1 text-lg">🎂</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{emp.name}</p>
                    {emp.department && (
                      <p className="text-xs text-muted-foreground truncate">{emp.department}</p>
                    )}
                  </div>
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shrink-0">
                    Hoje!
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Birthdays */}
        {upcomingBirthdays.length > 0 && (
          <div>
            {todayBirthdays.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Próximos aniversariantes</span>
              </div>
            )}
            <ScrollArea className="max-h-[280px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {upcomingBirthdays.map((emp, index) => {
                  const day = getDayOfBirthday(emp.birthday);
                  
                  return (
                    <motion.div
                      key={emp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50"
                    >
                      <Avatar className="h-10 w-10 border border-border">
                        {emp.avatar_url && <AvatarImage src={emp.avatar_url} alt={emp.name} />}
                        <AvatarFallback className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-600 dark:text-pink-400 text-xs font-semibold">
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{emp.name}</p>
                        {emp.department && (
                          <p className="text-[10px] text-muted-foreground truncate">{emp.department}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0 bg-background">
                        Dia {day}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
