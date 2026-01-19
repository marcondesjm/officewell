import type { ExerciseProfile } from "@/hooks/useWorkSchedule";

export type LerForm = {
  dorPunhos: boolean;
  formigamento: boolean;
  rigidez: boolean;
  dorPescoco: boolean;
};

export type LerRiskResult = {
  nivel: "baixo" | "medio" | "alto";
  cor: string;
  exerciseBonus: boolean;
  message: string;
};

export function avaliarRiscoLER(form: LerForm, exerciseProfile?: ExerciseProfile): LerRiskResult {
  const respostas = Object.values(form).filter(Boolean).length;
  const isActive = exerciseProfile && exerciseProfile !== "none";
  
  // Quem pratica exercício regularmente tem melhor condicionamento muscular
  // o que pode reduzir um pouco o risco de LER
  const exerciseReduction = isActive ? 0.5 : 0;
  const adjustedScore = Math.max(0, respostas - exerciseReduction);

  if (adjustedScore <= 1) {
    return { 
      nivel: "baixo", 
      cor: "green",
      exerciseBonus: isActive && respostas > 1,
      message: isActive 
        ? "Seu condicionamento físico está ajudando a manter o risco baixo!" 
        : "Continue mantendo bons hábitos ergonômicos.",
    };
  }

  if (adjustedScore <= 3) {
    return { 
      nivel: "medio", 
      cor: "yellow",
      exerciseBonus: isActive && respostas > adjustedScore,
      message: isActive 
        ? "Risco moderado. Seus exercícios ajudam, mas atenção aos sintomas." 
        : "Atenção aos sintomas. Considere alongamentos mais frequentes.",
    };
  }

  return { 
    nivel: "alto", 
    cor: "red",
    exerciseBonus: false,
    message: isActive 
      ? "Risco elevado mesmo com exercícios. Procure avaliação médica." 
      : "Risco elevado! Recomendamos procurar um profissional de saúde.",
  };
}

// Sugestões preventivas baseadas no perfil
export function sugestaoPreventiva(exerciseProfile: ExerciseProfile): string[] {
  const sugestoesBase = [
    "Mantenha postura correta ao digitar",
    "Faça pausas regulares a cada 50 minutos",
    "Posicione o monitor na altura dos olhos",
  ];

  switch (exerciseProfile) {
    case "intense":
      return [
        ...sugestoesBase,
        "Evite treinos muito intensos de membros superiores se sentir dor",
        "Alongue punhos e antebraços antes e depois dos treinos",
      ];
    case "moderate":
      return [
        ...sugestoesBase,
        "Inclua exercícios de fortalecimento de punhos na sua rotina",
        "Alongue-se regularmente mesmo nos dias de descanso",
      ];
    case "light":
      return [
        ...sugestoesBase,
        "Considere adicionar exercícios de fortalecimento muscular",
        "Natação e yoga são ótimos para prevenção de LER",
      ];
    case "none":
    default:
      return [
        ...sugestoesBase,
        "Inicie uma rotina leve de exercícios para fortalecer músculos",
        "Caminhadas ajudam na circulação e prevenção de LER",
      ];
  }
}
