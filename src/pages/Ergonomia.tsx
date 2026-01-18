import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErgonomicChecklist, ErgonomicData } from "@/components/ErgonomicChecklist";
import { avaliarRiscoLER, LerForm } from "@/utils/lerRisk";
import { sugestaoFadiga, Fadiga } from "@/utils/mentalFatigue";
import { gerarRelatorio } from "@/utils/companyReport";
import { 
  Activity, 
  AlertTriangle, 
  ArrowLeft, 
  Brain, 
  CheckCircle2, 
  ClipboardCheck, 
  FileBarChart, 
  Hand, 
  Heart, 
  Info,
  Lightbulb,
  Shield,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ParallaxBackground from "@/components/ParallaxBackground";

export default function Ergonomia() {
  const navigate = useNavigate();

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
  const [lerResult, setLerResult] = useState<{ nivel: string; cor: string } | null>(null);

  // ============ MENTAL FATIGUE STATE ============
  const [fadiga, setFadiga] = useState<Fadiga | null>(null);
  const [fadigaSugestao, setFadigaSugestao] = useState<string | null>(null);

  // ============ COMPANY REPORT STATE ============
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<{
    mediaScore: number;
    colaboradoresRiscoAlto: number;
    total: number;
  } | null>(null);

  // ============ HANDLERS ============
  const handleErgonomicChange = (field: keyof ErgonomicData, value: boolean) => {
    setErgonomicData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLerChange = (field: keyof LerForm) => {
    setLerForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const avaliarLER = () => {
    const result = avaliarRiscoLER(lerForm);
    setLerResult(result);
    
    if (result.nivel === "alto") {
      toast.error("Risco LER Elevado!", {
        description: "Recomendamos consultar um profissional de saúde.",
      });
    } else if (result.nivel === "medio") {
      toast.warning("Atenção ao Risco LER", {
        description: "Faça pausas regulares e exercícios de alongamento.",
      });
    } else {
      toast.success("Risco LER Baixo", {
        description: "Continue mantendo bons hábitos ergonômicos!",
      });
    }
  };

  const avaliarFadiga = (nivel: Fadiga) => {
    setFadiga(nivel);
    const sugestao = sugestaoFadiga(nivel);
    setFadigaSugestao(sugestao);
  };

  const gerarRelatorioEmpresa = () => {
    // Simulating company data (in production, this would come from database)
    const ergonomicScore = Object.values(ergonomicData).filter(Boolean).length * 20;
    const scores = [ergonomicScore, 75, 85, 60, 90]; // Simulated team scores
    const riscosLER = [lerResult?.nivel || "baixo", "baixo", "medio", "alto", "baixo"];
    
    const report = gerarRelatorio(scores, riscosLER);
    setReportData(report);
    setShowReport(true);
    
    toast.success("Relatório gerado!", {
      description: `Analisados ${report.total} colaboradores.`,
    });
  };

  // Calculate overall ergonomic score
  const ergonomicScore = Object.values(ergonomicData).filter(Boolean).length * 20;

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
          <CardContent>
            <ErgonomicChecklist 
              data={ergonomicData} 
              onChange={handleErgonomicChange} 
            />
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
              className="w-full gradient-warm text-primary-foreground mt-4"
            >
              <Shield className="h-4 w-4 mr-2" />
              Avaliar Risco LER
            </Button>

            {lerResult && (
              <Alert 
                className={`mt-4 ${
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
                </AlertTitle>
                <AlertDescription>
                  {lerResult.nivel === "alto" 
                    ? "Procure um profissional de saúde ocupacional. Faça pausas frequentes." 
                    : lerResult.nivel === "medio"
                    ? "Atenção! Revise sua ergonomia e faça alongamentos regulares."
                    : "Ótimo! Continue mantendo bons hábitos de trabalho."}
                </AlertDescription>
              </Alert>
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
              <Alert className="mt-4 border-info bg-info/10">
                <Lightbulb className="h-5 w-5 text-info" />
                <AlertTitle className="text-info">Sugestão</AlertTitle>
                <AlertDescription>{fadigaSugestao}</AlertDescription>
              </Alert>
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
                  Visão geral da saúde ergonômica do time (simulação)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={gerarRelatorioEmpresa} 
              className="w-full gradient-primary text-primary-foreground"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>

            {showReport && reportData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-3xl font-bold text-primary">{reportData.mediaScore}%</p>
                    <p className="text-sm text-muted-foreground">Score Médio</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-destructive/10 border-destructive/30">
                  <CardContent className="pt-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="text-3xl font-bold text-destructive">{reportData.colaboradoresRiscoAlto}</p>
                    <p className="text-sm text-muted-foreground">Risco Alto LER</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-success/10 border-success/30">
                  <CardContent className="pt-6 text-center">
                    <Heart className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-3xl font-bold text-success">{reportData.total}</p>
                    <p className="text-sm text-muted-foreground">Colaboradores</p>
                  </CardContent>
                </Card>
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
