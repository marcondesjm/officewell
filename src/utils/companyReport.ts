export function gerarRelatorio(scores: number[], riscosLER: string[]) {
  const mediaScore = scores.length > 0 
    ? scores.reduce((a, b) => a + b, 0) / scores.length 
    : 0;

  const riscoAlto = riscosLER.filter((r) => r === "alto").length;

  return {
    mediaScore: Math.round(mediaScore),
    colaboradoresRiscoAlto: riscoAlto,
    total: scores.length,
  };
}
