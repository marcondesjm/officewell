import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  FileText, 
  RefreshCw, 
  Calendar, 
  Droplets, 
  StretchHorizontal, 
  Eye,
  Star,
  Search,
  Download,
  TrendingUp,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyReport {
  id: string;
  user_id: string;
  session_id: string;
  display_name: string;
  report_date: string;
  water_breaks: number;
  stretch_breaks: number;
  eye_breaks: number;
  total_breaks: number;
  points_earned: number;
  notes: string | null;
  created_at: string;
}

interface ReportStats {
  totalReports: number;
  avgWaterBreaks: number;
  avgStretchBreaks: number;
  avgEyeBreaks: number;
  avgTotalBreaks: number;
  topPerformer: string | null;
}

export function DailyReportsAdmin() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 0,
    avgWaterBreaks: 0,
    avgStretchBreaks: 0,
    avgEyeBreaks: 0,
    avgTotalBreaks: 0,
    topPerformer: null,
  });

  const getDateRange = (filter: string) => {
    const today = new Date();
    switch (filter) {
      case "today":
        return {
          start: format(today, "yyyy-MM-dd"),
          end: format(today, "yyyy-MM-dd"),
        };
      case "yesterday":
        return {
          start: format(subDays(today, 1), "yyyy-MM-dd"),
          end: format(subDays(today, 1), "yyyy-MM-dd"),
        };
      case "week":
        return {
          start: format(startOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd"),
          end: format(endOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd"),
        };
      case "month":
        return {
          start: format(startOfMonth(today), "yyyy-MM-dd"),
          end: format(endOfMonth(today), "yyyy-MM-dd"),
        };
      case "all":
      default:
        return { start: null, end: null };
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange(dateFilter);
      
      let query = supabase
        .from("daily_reports")
        .select("*")
        .order("report_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (start && end) {
        query = query.gte("report_date", start).lte("report_date", end);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReports(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: DailyReport[]) => {
    if (data.length === 0) {
      setStats({
        totalReports: 0,
        avgWaterBreaks: 0,
        avgStretchBreaks: 0,
        avgEyeBreaks: 0,
        avgTotalBreaks: 0,
        topPerformer: null,
      });
      return;
    }

    const totalWater = data.reduce((sum, r) => sum + r.water_breaks, 0);
    const totalStretch = data.reduce((sum, r) => sum + r.stretch_breaks, 0);
    const totalEye = data.reduce((sum, r) => sum + r.eye_breaks, 0);
    const totalBreaks = data.reduce((sum, r) => sum + r.total_breaks, 0);

    // Find top performer (most total breaks)
    const topReport = data.reduce((top, current) => 
      current.total_breaks > top.total_breaks ? current : top
    , data[0]);

    setStats({
      totalReports: data.length,
      avgWaterBreaks: Math.round(totalWater / data.length * 10) / 10,
      avgStretchBreaks: Math.round(totalStretch / data.length * 10) / 10,
      avgEyeBreaks: Math.round(totalEye / data.length * 10) / 10,
      avgTotalBreaks: Math.round(totalBreaks / data.length * 10) / 10,
      topPerformer: topReport.display_name,
    });
  };

  useEffect(() => {
    fetchReports();
  }, [dateFilter]);

  const filteredReports = reports.filter(report =>
    report.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["Nome", "Data", "Água", "Alongamento", "Olhos", "Total", "Pontos"];
    const rows = filteredReports.map(r => [
      r.display_name,
      format(new Date(r.report_date), "dd/MM/yyyy"),
      r.water_breaks,
      r.stretch_breaks,
      r.eye_breaks,
      r.total_breaks,
      r.points_earned,
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorios-diarios-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Relatório exportado!");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPerformanceBadge = (totalBreaks: number) => {
    if (totalBreaks >= 15) return <Badge className="bg-emerald-500">Excelente</Badge>;
    if (totalBreaks >= 10) return <Badge className="bg-blue-500">Bom</Badge>;
    if (totalBreaks >= 5) return <Badge className="bg-amber-500">Regular</Badge>;
    return <Badge variant="secondary">Iniciando</Badge>;
  };

  const dateFilterLabels: Record<string, string> = {
    today: "Hoje",
    yesterday: "Ontem",
    week: "Esta Semana",
    month: "Este Mês",
    all: "Todos",
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-500/20">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.totalReports}</p>
                <p className="text-[10px] text-muted-foreground">Relatórios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-cyan-500/20">
                <Droplets className="h-4 w-4 text-cyan-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.avgWaterBreaks}</p>
                <p className="text-[10px] text-muted-foreground">Média Água</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-emerald-500/20">
                <StretchHorizontal className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.avgStretchBreaks}</p>
                <p className="text-[10px] text-muted-foreground">Média Along.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-violet-500/20">
                <Eye className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.avgEyeBreaks}</p>
                <p className="text-[10px] text-muted-foreground">Média Olhos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-amber-500/20">
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.avgTotalBreaks}</p>
                <p className="text-[10px] text-muted-foreground">Média Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performer */}
      {stats.topPerformer && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-3 flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-500" />
            <span className="text-sm">
              <strong className="text-primary">{stats.topPerformer}</strong> é o destaque do período com mais pausas realizadas! 🎉
            </span>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchReports} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Relatórios Diários
            <Badge variant="secondary" className="ml-2">
              {dateFilterLabels[dateFilter]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum relatório encontrado</p>
              <p className="text-sm">Os relatórios aparecerão aqui quando os funcionários enviarem.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead className="text-center">Data</TableHead>
                    <TableHead className="text-center">
                      <Droplets className="h-4 w-4 inline text-cyan-500" />
                    </TableHead>
                    <TableHead className="text-center">
                      <StretchHorizontal className="h-4 w-4 inline text-emerald-500" />
                    </TableHead>
                    <TableHead className="text-center">
                      <Eye className="h-4 w-4 inline text-violet-500" />
                    </TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Pontos</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                              {getInitials(report.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{report.display_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {format(new Date(report.report_date), "dd/MM", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-center font-medium text-cyan-600 dark:text-cyan-400">
                        {report.water_breaks}
                      </TableCell>
                      <TableCell className="text-center font-medium text-emerald-600 dark:text-emerald-400">
                        {report.stretch_breaks}
                      </TableCell>
                      <TableCell className="text-center font-medium text-violet-600 dark:text-violet-400">
                        {report.eye_breaks}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {report.total_breaks}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="flex items-center justify-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          {report.points_earned}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getPerformanceBadge(report.total_breaks)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
