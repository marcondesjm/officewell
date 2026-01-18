export type LerForm = {
  dorPunhos: boolean;
  formigamento: boolean;
  rigidez: boolean;
  dorPescoco: boolean;
};

export function avaliarRiscoLER(form: LerForm) {
  const respostas = Object.values(form).filter(Boolean).length;

  if (respostas <= 1) {
    return { nivel: "baixo", cor: "green" };
  }

  if (respostas <= 3) {
    return { nivel: "medio", cor: "yellow" };
  }

  return { nivel: "alto", cor: "red" };
}
