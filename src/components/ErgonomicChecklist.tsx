import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type ErgonomicData = {
  monitorAltura: boolean;
  distanciaMonitor: boolean;
  posturaPunhos: boolean;
  encostoCadeira: boolean;
  pesApoiados: boolean;
};

type Props = {
  data: ErgonomicData;
  onChange: (field: keyof ErgonomicData, value: boolean) => void;
};

const checklistItems: { field: keyof ErgonomicData; label: string; icon: string }[] = [
  { field: "monitorAltura", label: "Monitor na altura dos olhos", icon: "🖥️" },
  { field: "distanciaMonitor", label: "Distância correta do monitor (50-70cm)", icon: "📏" },
  { field: "posturaPunhos", label: "Punhos alinhados com o teclado", icon: "⌨️" },
  { field: "encostoCadeira", label: "Encosto da cadeira ajustado", icon: "🪑" },
  { field: "pesApoiados", label: "Pés apoiados no chão ou suporte", icon: "👣" },
];

export function ErgonomicChecklist({ data, onChange }: Props) {
  const completedCount = Object.values(data).filter(Boolean).length;
  const percentage = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Progresso: {completedCount}/{checklistItems.length}
        </span>
        <span className={`text-sm font-semibold ${
          percentage >= 80 ? "text-success" : percentage >= 50 ? "text-warning" : "text-destructive"
        }`}>
          {percentage}%
        </span>
      </div>
      
      <div className="space-y-3">
        {checklistItems.map(({ field, label, icon }) => (
          <div
            key={field}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              data[field] 
                ? "bg-success-light border-success/30" 
                : "bg-muted/30 border-border hover:border-primary/30"
            }`}
          >
            <Checkbox
              id={field}
              checked={data[field]}
              onCheckedChange={(checked) => onChange(field, checked === true)}
              className="data-[state=checked]:bg-success data-[state=checked]:border-success"
            />
            <Label 
              htmlFor={field} 
              className="flex items-center gap-2 cursor-pointer flex-1 text-sm font-medium"
            >
              <span>{icon}</span>
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
