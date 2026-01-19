import type { ExerciseProfile } from "@/hooks/useWorkSchedule";

export type Fadiga = "boa" | "media" | "ruim";

export function sugestaoFadiga(fadiga: Fadiga, exerciseProfile?: ExerciseProfile) {
  const isActive = exerciseProfile && exerciseProfile !== "none";
  
  if (fadiga === "boa") {
    if (isActive) {
      return "Excelente! Seu condicionamento físico está ajudando 💪";
    }
    return "Continue mantendo pausas regulares 👍";
  }

  if (fadiga === "media") {
    if (isActive) {
      return "Considere uma pausa curta. Seu corpo pode precisar de mais recuperação hoje.";
    }
    return "Considere uma pausa curta e alongamento.";
  }

  // fadiga === "ruim"
  if (isActive) {
    return "Alerta de fadiga elevada. Mesmo atletas precisam de descanso! Faça uma pausa maior.";
  }
  return "Alerta de fadiga elevada. Faça uma pausa maior e respiração guiada.";
}

// Sugestões de exercício baseadas no perfil
export function sugestaoExercicio(exerciseProfile: ExerciseProfile): string {
  switch (exerciseProfile) {
    case "intense":
      return "Foque em alongamentos leves para complementar seus treinos intensos.";
    case "moderate":
      return "Bom ritmo! Mantenha os alongamentos no trabalho para evitar lesões.";
    case "light":
      return "Considere aumentar um pouco a frequência de exercícios para mais benefícios.";
    case "none":
    default:
      return "Recomendamos iniciar com caminhadas leves - mesmo 20 min fazem diferença!";
  }
}

// Verificar se fadiga pode estar relacionada ao exercício intenso
export function avaliarFadigaPorExercicio(fadiga: Fadiga, exerciseProfile: ExerciseProfile): {
  isExerciseRelated: boolean;
  message: string;
} {
  if (fadiga === "ruim" && exerciseProfile === "intense") {
    return {
      isExerciseRelated: true,
      message: "Sua fadiga pode estar relacionada ao treino intenso. Considere um dia de recuperação ativa.",
    };
  }
  
  if (fadiga === "media" && (exerciseProfile === "intense" || exerciseProfile === "moderate")) {
    return {
      isExerciseRelated: true,
      message: "Pode ser efeito do treino recente. Hidrate-se bem e faça alongamentos suaves.",
    };
  }

  return {
    isExerciseRelated: false,
    message: "",
  };
}
