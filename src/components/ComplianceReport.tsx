import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  Dumbbell, 
  Droplets, 
  Download, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Shield
} from "lucide-react";
import { useComplianceTracking } from "@/hooks/useComplianceTracking";

export const ComplianceReport = () => {
  const { getTodayCompliance, getWeekCompliance, generateReport, getDeviceId } = useComplianceTracking();

  const today = getTodayCompliance();
  const week = getWeekCompliance();
  const deviceId = getDeviceId();

  const handleExportReport = () => {
    const report = generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-report-${report.today.date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return "text-green-500";
    if (rate >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getComplianceBadge = (rate: number) => {
    if (rate >= 80) return { label: "Excelente", variant: "default" as const };
    if (rate >= 50) return { label: "Regular", variant: "secondary" as const };
    return { label: "Atenção", variant: "destructive" as const };
  };

  const typeIcons = {
    eye: Eye,
    stretch: Dumbbell,
    water: Droplets,
  };

  const typeLabels = {
    eye: "Descanso Visual",
    stretch: "Alongamento",
    water: "Hidratação",
  };

  const badge = getComplianceBadge(today.complianceRate);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Relatório de Conformidade</CardTitle>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <CardDescription className="flex items-center gap-2 text-xs">
          <span>ID do Dispositivo:</span>
          <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
            {deviceId.slice(0, 20)}...
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's compliance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Hoje
            </span>
            <span className={`text-2xl font-bold ${getComplianceColor(today.complianceRate)}`}>
              {today.complianceRate}%
            </span>
          </div>
          <Progress value={today.complianceRate} className="h-2" />
        </div>

        {/* Today's records */}
        {today.records.length > 0 ? (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Pausas de hoje:</span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {today.records.map((record, index) => {
                const Icon = typeIcons[record.type];
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs bg-muted/50 rounded-md px-2 py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3 w-3" />
                      <span>{typeLabels[record.type]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {new Date(record.scheduledAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {record.wasCompliant ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            Nenhuma pausa registrada hoje ainda.
          </p>
        )}

        {/* Week overview */}
        <div className="space-y-2 pt-2 border-t">
          <span className="text-xs text-muted-foreground">Últimos 7 dias:</span>
          <div className="flex gap-1">
            {week.map((day, index) => {
              const hasRecords = day.records.length > 0;
              const isToday = day.date === new Date().toISOString().split("T")[0];
              
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-full h-8 rounded-sm flex items-center justify-center text-[10px] font-medium ${
                      !hasRecords
                        ? "bg-muted text-muted-foreground"
                        : day.complianceRate >= 80
                        ? "bg-green-500/20 text-green-600"
                        : day.complianceRate >= 50
                        ? "bg-yellow-500/20 text-yellow-600"
                        : "bg-red-500/20 text-red-600"
                    }`}
                  >
                    {hasRecords ? `${day.complianceRate}%` : "-"}
                  </div>
                  <span className={`text-[9px] ${isToday ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {new Date(day.date).toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleExportReport}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </CardContent>
    </Card>
  );
};
