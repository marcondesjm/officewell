import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Gift, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Confetti from "@/components/Confetti";

interface Employee {
  id: string;
  name: string;
  department: string | null;
  birthday: string | null;
}

interface BirthdaySettings {
  id: string;
  message: string;
  image_url: string | null;
}

// Helper function to parse date without timezone issues
const parseDateLocal = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const isBirthdayToday = (birthday: string | null): boolean => {
  if (!birthday) return false;
  const today = new Date();
  const bday = parseDateLocal(birthday);
  if (!bday) return false;
  return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth();
};

export const BirthdayCelebration = () => {
  const [birthdayPeople, setBirthdayPeople] = useState<Employee[]>([]);
  const [birthdaySettings, setBirthdaySettings] = useState<BirthdaySettings | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkBirthdays = async () => {
      // Check if already dismissed today
      const dismissedDate = localStorage.getItem("birthdayDismissedDate");
      const today = new Date().toDateString();
      
      if (dismissedDate === today) {
        setDismissed(true);
        return;
      }

      try {
        const { data: empData, error: empError } = await supabase
          .from("employees")
          .select("*");

        if (empError) throw empError;

        const todayBirthdays = (empData || []).filter((emp) => 
          isBirthdayToday(emp.birthday)
        );

        if (todayBirthdays.length > 0) {
          // Fetch birthday settings
          const { data: settingsData } = await supabase
            .from("birthday_settings")
            .select("*")
            .limit(1)
            .single();

          setBirthdaySettings(settingsData);
          setBirthdayPeople(todayBirthdays);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error checking birthdays:", error);
      }
    };

    checkBirthdays();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setDismissed(true);
    localStorage.setItem("birthdayDismissedDate", new Date().toDateString());
  };

  if (dismissed || birthdayPeople.length === 0) return null;

  const customMessage = birthdaySettings?.message || "Desejamos um dia repleto de alegrias, realizações e muita felicidade!";
  const customImage = birthdaySettings?.image_url;

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <Confetti />
        
        <div className="relative p-6 sm:p-8">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header with animation */}
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              <PartyPopper className="h-10 w-10 text-primary animate-bounce" />
              <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">
              🎂 Feliz Aniversário! 🎂
            </h2>
            <p className="text-muted-foreground">
              Hoje é dia de celebrar!
            </p>
          </div>

          {/* Birthday image - custom or default */}
          <div className="relative mx-auto w-48 h-48 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-xl animate-pulse" />
            {customImage ? (
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/30">
                <img
                  src={customImage}
                  alt="Celebração de aniversário"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 border-primary/30">
                <Gift className="h-20 w-20 text-primary animate-bounce" />
              </div>
            )}
          </div>

          {/* Birthday people */}
          <div className="space-y-4">
            {birthdayPeople.map((person) => (
              <div
                key={person.id}
                className="text-center p-4 rounded-xl bg-primary/5 border border-primary/20"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🎉</span>
                  <h3 className="text-xl font-bold text-primary">
                    {person.name}
                  </h3>
                  <span className="text-2xl">🎉</span>
                </div>
                {person.department && (
                  <p className="text-sm text-muted-foreground">
                    {person.department}
                  </p>
                )}
                <p className="text-sm mt-2 italic text-foreground/80">
                  {customMessage}
                </p>
              </div>
            ))}
          </div>

          {/* Action button */}
          <div className="mt-6 text-center">
            <Button
              onClick={handleClose}
              className="gap-2 px-8"
              size="lg"
            >
              <PartyPopper className="h-4 w-4" />
              Parabéns! 🎊
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
