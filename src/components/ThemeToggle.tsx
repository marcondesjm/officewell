import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-primary/10 border-2 border-border/50 hover:border-primary/30 transition-all duration-300 touch-manipulation active:scale-95"
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
    </Button>
  );
}
