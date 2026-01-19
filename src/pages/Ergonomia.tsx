import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErgonomicChecklist, ErgonomicData } from "@/components/ErgonomicChecklist";
import { ErgonomicCharts, ErgonomicHistoryData, LerDistribution, FatigueHistoryData } from "@/components/ErgonomicCharts";
import { avaliarRiscoLER, LerForm, LerRiskResult, sugestaoPreventiva } from "@/utils/lerRisk";
import { sugestaoFadiga, Fadiga, sugestaoExercicio, avaliarFadigaPorExercicio } from "@/utils/mentalFatigue";
import { useWorkSchedule, ExerciseProfile } from "@/hooks/useWorkSchedule";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, 
  AlertTriangle, 
  ArrowLeft, 
  BarChart3,
  Brain, 
  CheckCircle2, 
  ClipboardCheck, 
  Download,
  Dumbbell,
  FileBarChart, 
  Hand, 
  Heart, 
  History,
  Info,
  Lightbulb,
  Loader2,
  Save,
  Shield,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  XCircle
} from "lucide-react";
import { generateErgonomicPDF, PDFExportData } from "@/utils/pdfExport";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ParallaxBackground from "@/components/ParallaxBackground";

// Generate or retrieve session ID for anonymous tracking
const getSessionId = () => {
  let sessionId = localStorage.getItem("ergonomic_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("ergonomic_session_id", sessionId);
  }
  return sessionId;
};

export default function Ergonomia() {
  const navigate = useNavigate();
  const sessionId = getSessionId();
  const { getExerciseProfile, isActiveUser } = useWorkSchedule();
  const exerciseProfile = getExerciseProfile();

  // ============ LOADING STATES ============
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // ============ ERGONOMIC CHECKLIST STATE ============
  const [ergonomicData, setErgonomicData] = useState<ErgonomicData>({
    monitorAltura: false,
    distanciaMonitor: false,
    posturaPunhos: false,
    encostoCadeira: false,
    pesApoiados: false,
  });

  // ============ LER RISK STATE ============
  const [lerForm, setLerForm] = useState<LerForm>({
    dorPunhos: false,
    formigamento: false,
    rigidez: false,
    dorPescoco: false,
  });
  const [lerResult, setLerResult] = useState<LerRiskResult | null>(null);
  const [lerSugestoes, setLerSugestoes] = useState<string[]>([]);

  // ============ MENTAL FATIGUE STATE ============
  const [fadiga, setFadiga] = useState<Fadiga | null>(null);
  const [fadigaSugestao, setFadigaSugestao] = useState<string | null>(null);
  const [exerciseFatigueRelation, setExerciseFatigueRelation] = useState<{ isExerciseRelated: boolean; message: string } | null>(null);

  // ============ HISTORY STATE ============
  const [assessmentHistory, setAssessmentHistory] = useState<{
    ergonomic: number;
    ler: number;
    fatigue: number;
    avgScore: number;
  } | null>(null);

  // ============ CHARTS DATA STATE ============
  const [ergonomicChartData, setErgonomicChartData] = useState<ErgonomicHistoryData[]>([]);
  const [lerDistribution, setLerDistribution] = useState<LerDistribution[]>([
    { level: "baixo", count: 0, color: "hsl(160 84% 39%)" },
    { level: "medio", count: 0, color: "hsl(43 96% 56%)" },
    { level: "alto", count: 0, color: "hsl(0 84% 60%)" },
  ]);
  const [fatigueChartData, setFatigueChartData] = useState<FatigueHistoryData[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);

  // ============ COMPANY REPORT STATE ============
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<{
    mediaScore: number;
    colaboradoresRiscoAlto: number;
    total: number;
    totalAssessments: number;
  } | null>(null);

  // ============ HANDLERS ============
  const handleErgonomicChange = (field: keyof ErgonomicData, value: boolean) => {
    setErgonomicData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLerChange = (field: keyof LerForm) => {
    setLerForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Save ergonomic assessment to database
  const saveErgonomicAssessment = async () => {
    const score = Object.values(ergonomicData).filter(Boolean).length * 20;
    
    const { error } = await supabase.from("ergonomic_assessments").insert({
      session_id: sessionId,
      monitor_altura: ergonomicData.monitorAltura,
      distancia_monitor: ergonomicData.distanciaMonitor,
      postura_punhos: ergonomicData.posturaPunhos,
      encosto_cadeira: ergonomicData.encostoCadeira,
      pes_apoiados: ergonomicData.pesApoiados,
      score,
    });

    if (error) {
      console.error("Error saving ergonomic assessment:", error);
      throw error;
    }
  };

  // Save LER assessment to database
  const saveLerAssessment = async (riskLevel: string) => {
    const { error } = await supabase.from("ler_assessments").insert({
      session_id: sessionId,
      dor_punhos: lerForm.dorPunhos,
      formigamento: lerForm.formigamento,
      rigidez: lerForm.rigidez,
      dor_pescoco: lerForm.dorPescoco,
      risk_level: riskLevel,
    });

    if (error) {
      console.error("Error saving LER assessment:", error);
      throw error;
    }
  };

  // Save fatigue assessment to database
  const saveFatigueAssessment = async (level: Fadiga, suggestion: string) => {
    const { error } = await supabase.from("fatigue_assessments").insert({
      session_id: sessionId,
      fatigue_level: level,
      suggestion,
    });

    if (error) {
      console.error("Error saving fatigue assessment:", error);
      throw error;
    }
  };

  const avaliarLER = async () => {
    const result = avaliarRiscoLER(lerForm, exerciseProfile);
    setLerResult(result);
    setLerSugestoes(sugestaoPreventiva(exerciseProfile));
    setIsSaving(true);

    try {
      await saveLerAssessment(result.nivel);
      
      if (result.nivel === "alto") {
        toast.error("Risco LER Elevado!", {
          description: result.message,
        });
      } else if (result.nivel === "medio") {
        toast.warning("Atenção ao Risco LER", {
          description: result.message,
        });
      } else {
        toast.success("Risco LER Baixo", {
          description: result.message,
        });
      }
    } catch {
      toast.error("Erro ao salvar avaliação LER");
    } finally {
      setIsSaving(false);
    }
  };

  const avaliarFadiga = async (nivel: Fadiga) => {
    setFadiga(nivel);
    const sugestao = sugestaoFadiga(nivel, exerciseProfile);
    setFadigaSugestao(sugestao);
    
    // Verificar se fadiga pode estar relacionada ao exercício
    const exerciseRelation = avaliarFadigaPorExercicio(nivel, exerciseProfile);
    setExerciseFatigueRelation(exerciseRelation);
    
    setIsSaving(true);

    try {
      await saveFatigueAssessment(nivel, sugestao);
      toast.success("Avaliação de fadiga salva!");
    } catch {
      toast.error("Erro ao salvar avaliação de fadiga");
    } finally {
      setIsSaving(false);
    }
  };

  const salvarChecklistErgonomico = async () => {
    setIsSaving(true);
    try {
      await saveErgonomicAssessment();
      toast.success("Checklist ergonômico salvo!", {
        description: `Score: ${ergonomicScore}%`,
      });
    } catch {
      toast.error("Erro ao salvar checklist");
    } finally {
      setIsSaving(false);
    }
  };

  // Load assessment history
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const [ergonomicRes, lerRes, fatigueRes] = await Promise.all([
        supabase.from("ergonomic_assessments").select("score").eq("session_id", sessionId),
        supabase.from("ler_assessments").select("risk_level").eq("session_id", sessionId),
        supabase.from("fatigue_assessments").select("fatigue_level").eq("session_id", sessionId),
      ]);

      const ergonomicCount = ergonomicRes.data?.length || 0;
      const lerCount = lerRes.data?.length || 0;
      const fatigueCount = fatigueRes.data?.length || 0;
      
      const avgScore = ergonomicCount > 0 
        ? Math.round((ergonomicRes.data?.reduce((acc, curr) => acc + curr.score, 0) || 0) / ergonomicCount)
        : 0;

      setAssessmentHistory({
        ergonomic: ergonomicCount,
        ler: lerCount,
        fatigue: fatigueCount,
        avgScore,
      });
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Generate real company report from database
  const gerarRelatorioEmpresa = async () => {
    setIsLoadingReport(true);
    setShowReport(false);

    try {
      const [ergonomicRes, lerRes] = await Promise.all([
        supabase.from("ergonomic_assessments").select("score, session_id"),
        supabase.from("ler_assessments").select("risk_level, session_id"),
      ]);

      const scores = ergonomicRes.data?.map((a) => a.score) || [];
      const riskLevels = lerRes.data?.map((a) => a.risk_level) || [];
      
      // Get unique sessions (simulating unique employees)
      const uniqueSessions = new Set([
        ...(ergonomicRes.data?.map((a) => a.session_id) || []),
        ...(lerRes.data?.map((a) => a.session_id) || []),
      ]);

      const mediaScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      const riscoAlto = riskLevels.filter((r) => r === "alto").length;

      setReportData({
        mediaScore,
        colaboradoresRiscoAlto: riscoAlto,
        total: uniqueSessions.size,
        totalAssessments: scores.length + riskLevels.length,
      });
      setShowReport(true);

      toast.success("Relatório gerado!", {
        description: `Dados de ${uniqueSessions.size} colaborador(es) analisados.`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Export PDF report
  const exportarPDF = async () => {
    if (!reportData) {
      toast.error("Gere o relatório primeiro antes de exportar");
      return;
    }

    setIsExportingPDF(true);

    try {
      // Fetch all data for PDF
      const [ergonomicRes, lerRes, fatigueRes] = await Promise.all([
        supabase
          .from("ergonomic_assessments")
          .select("score, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("ler_assessments")
          .select("risk_level, dor_punhos, formigamento, rigidez, dor_pescoco, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("fatigue_assessments")
          .select("fatigue_level, suggestion, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      const ergonomicHistory = (ergonomicRes.data || []).map((item) => ({
        date: item.created_at,
        score: item.score,
      }));

      const lerHistory = (lerRes.data || []).map((item) => {
        const symptoms: string[] = [];
        if (item.dor_punhos) symptoms.push("Dor nos punhos");
        if (item.formigamento) symptoms.push("Formigamento");
        if (item.rigidez) symptoms.push("Rigidez nos dedos");
        if (item.dor_pescoco) symptoms.push("Dor no pescoço");
        
        return {
          date: item.created_at,
          risk_level: item.risk_level,
          symptoms,
        };
      });

      const fatigueHistory = (fatigueRes.data || []).map((item) => ({
        date: item.created_at,
        level: item.fatigue_level,
        suggestion: item.suggestion || undefined,
      }));

      const pdfData: PDFExportData = {
        reportData,
        ergonomicHistory,
        lerHistory,
        fatigueHistory,
        generatedAt: new Date(),
      };

      generateErgonomicPDF(pdfData);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Load charts data from database
  const loadChartsData = async () => {
    setIsLoadingCharts(true);
    try {
      const [ergonomicRes, lerRes, fatigueRes] = await Promise.all([
        supabase
          .from("ergonomic_assessments")
          .select("score, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true })
          .limit(30),
        supabase
          .from("ler_assessments")
          .select("risk_level, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true }),
        supabase
          .from("fatigue_assessments")
          .select("fatigue_level, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true })
          .limit(30),
      ]);

      // Process ergonomic data for line chart
      const ergonomicData: ErgonomicHistoryData[] = (ergonomicRes.data || []).map((item) => ({
        date: item.created_at,
        score: item.score,
      }));
      setErgonomicChartData(ergonomicData);

      // Process LER data for pie chart
      const lerCounts = { baixo: 0, medio: 0, alto: 0 };
      (lerRes.data || []).forEach((item) => {
        if (item.risk_level === "baixo") lerCounts.baixo++;
        else if (item.risk_level === "medio") lerCounts.medio++;
        else if (item.risk_level === "alto") lerCounts.alto++;
      });
      setLerDistribution([
        { level: "baixo", count: lerCounts.baixo, color: "hsl(160 84% 39%)" },
        { level: "medio", count: lerCounts.medio, color: "hsl(43 96% 56%)" },
        { level: "alto", count: lerCounts.alto, color: "hsl(0 84% 60%)" },
      ]);

      // Process fatigue data for bar chart
      const fatigueData: FatigueHistoryData[] = (fatigueRes.data || []).map((item) => ({
        date: item.created_at,
        level: item.fatigue_level,
        value: item.fatigue_level === "boa" ? 1 : item.fatigue_level === "media" ? 2 : 3,
      }));
      setFatigueChartData(fatigueData);

      setShowCharts(true);
    } catch (error) {
      console.error("Error loading charts data:", error);
      toast.error("Erro ao carregar dados dos gráficos");
    } finally {
      setIsLoadingCharts(false);
    }
  };

  // Calculate overall ergonomic score
  const ergonomicScore = Object.values(ergonomicData).filter(Boolean).length * 20;

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Set page metadata
  useEffect(() => {
    document.title = "Avaliação Ergonômica | OfficeWell";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", 
        "Avalie sua ergonomia no trabalho, risco de LER e fadiga mental. Ferramentas completas para saúde ocupacional."
      );
    }
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <ParallaxBackground />
      
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <header className="flex items-center gap-4 animate-fade-in">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="text-gradient">Avaliação Ergonômica</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Analise sua saúde ocupacional e receba recomendações personalizadas
            </p>
          </div>
        </header>

        {/* Score Overview Card */}
        <Card className="glass-card overflow-hidden animate-fade-in">
          <div className="gradient-primary p-6">
            <div className="flex items-center justify-between">
              <div className="text-primary-foreground">
                <p className="text-sm opacity-90">Sua Pontuação Ergonômica</p>
                <p className="text-4xl font-bold">{ergonomicScore}%</p>
              </div>
              <div className="p-4 bg-primary-foreground/20 rounded-full">
                <Activity className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <Progress 
              value={ergonomicScore} 
              className="mt-4 h-2 bg-primary-foreground/30"
            />
          </div>
        </Card>

        {/* Exercise Profile Card */}
        <Card className="glass-card animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isActiveUser() ? "bg-success/10" : "bg-muted"}`}>
                  <Dumbbell className={`h-5 w-5 ${isActiveUser() ? "text-success" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h3 className="font-semibold">Seu Perfil de Exercícios</h3>
                  <p className="text-sm text-muted-foreground">
                    {exerciseProfile === "intense" && "Praticante Intenso"}
                    {exerciseProfile === "moderate" && "Praticante Moderado"}
                    {exerciseProfile === "light" && "Praticante Leve"}
                    {exerciseProfile === "none" && "Sedentário"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Dica personalizada:</p>
                <p className="text-sm font-medium text-primary max-w-[200px]">
                  {sugestaoExercicio(exerciseProfile).slice(0, 60)}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Card */}
        {assessmentHistory && (assessmentHistory.ergonomic > 0 || assessmentHistory.ler > 0 || assessmentHistory.fatigue > 0) && (
          <Card className="glass-card animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <History className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Seu Histórico</h3>
                    <p className="text-sm text-muted-foreground">Score médio: {assessmentHistory.avgScore}%</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadChartsData}
                  disabled={isLoadingCharts}
                >
                  {isLoadingCharts ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <BarChart3 className="h-4 w-4 mr-2" />
                  )}
                  {showCharts ? "Atualizar Gráficos" : "Ver Gráficos"}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-2xl font-bold text-primary">{assessmentHistory.ergonomic}</p>
                  <p className="text-xs text-muted-foreground">Checklists</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <p className="text-2xl font-bold text-destructive">{assessmentHistory.ler}</p>
                  <p className="text-xs text-muted-foreground">Avaliações LER</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <p className="text-2xl font-bold text-secondary">{assessmentHistory.fatigue}</p>
                  <p className="text-xs text-muted-foreground">Fadiga</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        {showCharts && (
          <div className="animate-fade-in">
            <ErgonomicCharts
              ergonomicHistory={ergonomicChartData}
              lerDistribution={lerDistribution}
              fatigueHistory={fatigueChartData}
            />
          </div>
        )}

        {/* Ergonomic Checklist */}
        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Checklist Ergonômico</CardTitle>
                <CardDescription>
                  Verifique sua configuração de trabalho
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ErgonomicChecklist 
              data={ergonomicData} 
              onChange={handleErgonomicChange} 
            />
            <Button 
              onClick={salvarChecklistErgonomico}
              disabled={isSaving}
              className="w-full gradient-primary text-primary-foreground"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Avaliação
            </Button>
          </CardContent>
        </Card>

        {/* LER Risk Assessment */}
        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-destructive/10">
                <Hand className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Avaliação de Risco LER</CardTitle>
                <CardDescription>
                  Lesão por Esforço Repetitivo - marque os sintomas que você sente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { field: "dorPunhos" as keyof LerForm, label: "Dor nos punhos", icon: "🖐️" },
                { field: "formigamento" as keyof LerForm, label: "Formigamento nas mãos", icon: "✋" },
                { field: "rigidez" as keyof LerForm, label: "Rigidez nos dedos", icon: "👆" },
                { field: "dorPescoco" as keyof LerForm, label: "Dor no pescoço", icon: "🦴" },
              ].map(({ field, label, icon }) => (
                <div
                  key={field}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    lerForm[field]
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-muted/30 border-border hover:border-destructive/30"
                  }`}
                  onClick={() => handleLerChange(field)}
                >
                  <Checkbox
                    checked={lerForm[field]}
                    onCheckedChange={() => handleLerChange(field)}
                    className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                  />
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={avaliarLER}
              disabled={isSaving}
              className="w-full gradient-warm text-primary-foreground mt-4"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Avaliar e Salvar
            </Button>

            {lerResult && (
              <div className="space-y-3 mt-4">
                <Alert 
                  className={`${
                    lerResult.nivel === "alto" 
                      ? "border-destructive bg-destructive/10" 
                      : lerResult.nivel === "medio"
                      ? "border-warning bg-warning/10"
                      : "border-success bg-success/10"
                  }`}
                >
                  {lerResult.nivel === "alto" ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : lerResult.nivel === "medio" ? (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  )}
                  <AlertTitle className={`${
                    lerResult.nivel === "alto" 
                      ? "text-destructive" 
                      : lerResult.nivel === "medio"
                      ? "text-warning"
                      : "text-success"
                  }`}>
                    Risco {lerResult.nivel.charAt(0).toUpperCase() + lerResult.nivel.slice(1)}
                    {lerResult.exerciseBonus && (
                      <span className="ml-2 text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                        Bônus Exercício
                      </span>
                    )}
                  </AlertTitle>
                  <AlertDescription>{lerResult.message}</AlertDescription>
                </Alert>

                {/* Preventive Suggestions */}
                {lerSugestoes.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-info" />
                      Sugestões Preventivas para seu perfil:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {lerSugestoes.slice(0, 4).map((sugestao, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {sugestao}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mental Fatigue Assessment */}
        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-secondary/10">
                <Brain className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <CardTitle>Fadiga Mental</CardTitle>
                <CardDescription>
                  Como você está se sentindo hoje?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup 
              value={fadiga || ""} 
              onValueChange={(value) => avaliarFadiga(value as Fadiga)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "boa", label: "Bem disposto", icon: "😊", color: "success" },
                { value: "media", label: "Um pouco cansado", icon: "😐", color: "warning" },
                { value: "ruim", label: "Muito cansado", icon: "😫", color: "destructive" },
              ].map(({ value, label, icon, color }) => (
                <Label
                  key={value}
                  htmlFor={value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    fadiga === value
                      ? color === "success"
                        ? "border-success bg-success/10"
                        : color === "warning"
                        ? "border-warning bg-warning/10"
                        : "border-destructive bg-destructive/10"
                      : "border-border bg-muted/30 hover:border-primary/30"
                  }`}
                >
                  <RadioGroupItem value={value} id={value} className="sr-only" />
                  <span className="text-3xl">{icon}</span>
                  <span className="text-sm font-medium text-center">{label}</span>
                </Label>
              ))}
            </RadioGroup>

            {fadigaSugestao && (
              <div className="space-y-3 mt-4">
                <Alert className="border-info bg-info/10">
                  <Lightbulb className="h-5 w-5 text-info" />
                  <AlertTitle className="text-info">Sugestão</AlertTitle>
                  <AlertDescription>{fadigaSugestao}</AlertDescription>
                </Alert>

                {/* Exercise-related fatigue info */}
                {exerciseFatigueRelation?.isExerciseRelated && (
                  <Alert className="border-secondary bg-secondary/10">
                    <Dumbbell className="h-5 w-5 text-secondary" />
                    <AlertTitle className="text-secondary">Pode ser do Treino</AlertTitle>
                    <AlertDescription>{exerciseFatigueRelation.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Report */}
        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/10">
                <FileBarChart className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle>Relatório da Equipe</CardTitle>
                <CardDescription>
                  Visão geral da saúde ergonômica baseada em dados reais
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={gerarRelatorioEmpresa}
                disabled={isLoadingReport}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                {isLoadingReport ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Gerar Relatório
              </Button>
              
              {showReport && reportData && (
                <Button 
                  onClick={exportarPDF}
                  disabled={isExportingPDF}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  {isExportingPDF ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exportar PDF
                </Button>
              )}
            </div>

            {showReport && reportData && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-primary/10 border-primary/30">
                    <CardContent className="pt-6 text-center">
                      <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-primary">{reportData.mediaScore}%</p>
                      <p className="text-xs text-muted-foreground">Score Médio</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-destructive/10 border-destructive/30">
                    <CardContent className="pt-6 text-center">
                      <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
                      <p className="text-2xl font-bold text-destructive">{reportData.colaboradoresRiscoAlto}</p>
                      <p className="text-xs text-muted-foreground">Risco Alto LER</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-success/10 border-success/30">
                    <CardContent className="pt-6 text-center">
                      <Heart className="h-6 w-6 text-success mx-auto mb-2" />
                      <p className="text-2xl font-bold text-success">{reportData.total}</p>
                      <p className="text-xs text-muted-foreground">Colaboradores</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-info/10 border-info/30">
                    <CardContent className="pt-6 text-center">
                      <ClipboardCheck className="h-6 w-6 text-info mx-auto mb-2" />
                      <p className="text-2xl font-bold text-info">{reportData.totalAssessments}</p>
                      <p className="text-xs text-muted-foreground">Avaliações</p>
                    </CardContent>
                  </Card>
                </div>

                <Alert className="border-info bg-info/10">
                  <Info className="h-5 w-5 text-info" />
                  <AlertTitle className="text-info">Dados em Tempo Real</AlertTitle>
                  <AlertDescription>
                    Este relatório é gerado com base em todas as avaliações salvas no sistema.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="glass-card animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-info/10 shrink-0">
                <Info className="h-6 w-6 text-info" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dicas de Ergonomia</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-success" />
                    Faça pausas a cada 50-60 minutos de trabalho
                  </li>
                  <li className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-success" />
                    Mantenha os olhos a 50-70cm do monitor
                  </li>
                  <li className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-success" />
                    Alongue pescoço e punhos regularmente
                  </li>
                  <li className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-success" />
                    Hidrate-se com pelo menos 2L de água por dia
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
