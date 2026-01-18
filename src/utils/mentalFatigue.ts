export type Fadiga = "boa" | "media" | "ruim";

export function sugestaoFadiga(fadiga: Fadiga) {
  if (fadiga === "boa") {
    return "Continue mantendo pausas regulares 👍";
  }

  if (fadiga === "media") {
    return "Considere uma pausa curta e alongamento.";
  }

  return "Alerta de fadiga elevada. Faça uma pausa maior e respiração guiada.";
}
