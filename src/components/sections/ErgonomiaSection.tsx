import { ScanFace, Activity, ClipboardCheck, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ErgonomiaSectionProps {
  onPostureCheck: () => void;
  onDailySession: () => void;
}

export const ErgonomiaSection = ({ onPostureCheck, onDailySession }: ErgonomiaSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Ergonomia</h2>
        <p className="text-muted-foreground mt-1">
          Cuide da sua postura e saúde no trabalho
        </p>
      </div>

      {/* Posture Monitoring */}
      <Card className="p-5 glass-card hover:shadow-lg transition-all duration-300 group">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              <ScanFace className="h-7 w-7 text-violet-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Monitoramento de Postura</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Analise sua postura usando a câmera
              </p>
            </div>
          </div>
          <Button 
            onClick={onPostureCheck}
            className="gradient-primary min-h-12 px-6 text-base font-semibold rounded-xl w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
          >
            <ScanFace className="h-5 w-5 mr-2" />
            Verificar
          </Button>
        </div>
      </Card>

      {/* Daily Session */}
      <Card className="p-5 glass-card hover:shadow-lg transition-all duration-300 group">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Sessão Diária de Ergonomia</h3>
              <p className="text-sm text-muted-foreground mt-1">
                5 exercícios rápidos para sua saúde
              </p>
            </div>
          </div>
          <Button 
            onClick={onDailySession}
            variant="secondary"
            className="min-h-12 px-6 text-base font-semibold rounded-xl w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
          >
            <Activity className="h-5 w-5 mr-2" />
            Iniciar
          </Button>
        </div>
      </Card>

      {/* Ergonomic Assessment */}
      <Card className="p-5 glass-card overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
              <ClipboardCheck className="h-7 w-7 text-teal-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Avaliação Ergonômica</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Analise LER, fadiga mental e postura de trabalho
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/ergonomia")}
            className="gradient-primary min-h-12 px-6 text-base font-semibold rounded-xl w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Avaliar
          </Button>
        </div>
      </Card>

      {/* Push Notifications */}
      <Card className="p-5 glass-card overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 group-hover:scale-110 transition-transform duration-300">
              <Bell className="h-7 w-7 text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Push Notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie e envie notificações push
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/push")}
            variant="secondary"
            className="min-h-12 px-6 text-base font-semibold rounded-xl w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
          >
            <Bell className="h-5 w-5 mr-2" />
            Gerenciar
          </Button>
        </div>
      </Card>
    </section>
  );
};
