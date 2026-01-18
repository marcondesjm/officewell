import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type ErgonomicHistoryData = {
  date: string;
  score: number;
};

export type LerDistribution = {
  level: string;
  count: number;
  color: string;
};

export type FatigueHistoryData = {
  date: string;
  level: string;
  value: number;
};

type Props = {
  ergonomicHistory: ErgonomicHistoryData[];
  lerDistribution: LerDistribution[];
  fatigueHistory: FatigueHistoryData[];
};

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(217 91% 50%)",
  },
  baixo: {
    label: "Baixo",
    color: "hsl(160 84% 39%)",
  },
  medio: {
    label: "Médio",
    color: "hsl(43 96% 56%)",
  },
  alto: {
    label: "Alto",
    color: "hsl(0 84% 60%)",
  },
  boa: {
    label: "Boa",
    color: "hsl(160 84% 39%)",
  },
  media: {
    label: "Média",
    color: "hsl(43 96% 56%)",
  },
  ruim: {
    label: "Ruim",
    color: "hsl(0 84% 60%)",
  },
};

export function ErgonomicCharts({ ergonomicHistory, lerDistribution, fatigueHistory }: Props) {
  // Format dates for display
  const formattedErgonomicHistory = ergonomicHistory.map((item) => ({
    ...item,
    formattedDate: format(new Date(item.date), "dd/MM", { locale: ptBR }),
  }));

  const formattedFatigueHistory = fatigueHistory.map((item) => ({
    ...item,
    formattedDate: format(new Date(item.date), "dd/MM", { locale: ptBR }),
  }));

  // Calculate trend
  const hasData = ergonomicHistory.length >= 2;
  const trend = hasData 
    ? ergonomicHistory[ergonomicHistory.length - 1].score - ergonomicHistory[0].score
    : 0;

  return (
    <div className="space-y-6">
      {/* Score Evolution Chart */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Evolução do Score</CardTitle>
              <CardDescription>
                Histórico de pontuação ergonômica ao longo do tempo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {formattedErgonomicHistory.length > 0 ? (
            <>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={formattedErgonomicHistory}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217 91% 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217 91% 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="formattedDate" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value}%`, "Score"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(217 91% 50%)"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(217 91% 50%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(217 91% 50%)", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "hsl(217 91% 50%)" }}
                  />
                </AreaChart>
              </ChartContainer>
              {hasData && (
                <div className={`flex items-center gap-2 mt-4 text-sm ${
                  trend >= 0 ? "text-success" : "text-destructive"
                }`}>
                  <TrendingUp className={`h-4 w-4 ${trend < 0 ? "rotate-180" : ""}`} />
                  <span>
                    {trend >= 0 ? "+" : ""}{trend}% desde a primeira avaliação
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Salve avaliações para ver o histórico
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LER Risk Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <PieChartIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg">Distribuição Risco LER</CardTitle>
                <CardDescription>
                  Proporção de avaliações por nível
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {lerDistribution.some(d => d.count > 0) ? (
              <div className="flex items-center gap-4">
                <ChartContainer config={chartConfig} className="h-[180px] w-[180px]">
                  <PieChart>
                    <Pie
                      data={lerDistribution.filter(d => d.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {lerDistribution.filter(d => d.count > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [value, name]}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2">
                  {lerDistribution.map((item) => (
                    <div key={item.level} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm capitalize">{item.level}</span>
                      <span className="text-sm font-semibold ml-auto">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground">
                Nenhuma avaliação LER registrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fatigue Over Time */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <BarChart3 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-lg">Fadiga ao Longo do Tempo</CardTitle>
                <CardDescription>
                  Evolução do nível de fadiga
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {formattedFatigueHistory.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[180px] w-full">
                <BarChart data={formattedFatigueHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="formattedDate" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 3]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(value) => {
                      if (value === 1) return "Boa";
                      if (value === 2) return "Média";
                      if (value === 3) return "Ruim";
                      return "";
                    }}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => {
                      if (value === 1) return ["Boa", "Fadiga"];
                      if (value === 2) return ["Média", "Fadiga"];
                      if (value === 3) return ["Ruim", "Fadiga"];
                      return [value, "Fadiga"];
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                  >
                    {formattedFatigueHistory.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.level === "boa" 
                            ? "hsl(160 84% 39%)" 
                            : entry.level === "media" 
                            ? "hsl(43 96% 56%)" 
                            : "hsl(0 84% 60%)"
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground">
                Nenhuma avaliação de fadiga registrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
