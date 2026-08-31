// Convenção da Uerj (Exame de Qualificação): questão "ANULADA" conta como
// acerto pra todo mundo — não pune quem errou, mas também não deixa de
// contar no total de questões da prova.
export function corrigirAutomaticamente(gabarito: string, respostas: string) {
  const certas = gabarito.split(",").map((s) => s.trim().toUpperCase());
  const dadas = respostas.split(",").map((s) => s.trim().toUpperCase());
  let acertos = 0;
  certas.forEach((c, i) => {
    if (c === "ANULADA") {
      acertos++;
      return;
    }
    if (c && dadas[i] === c) acertos++;
  });
  return acertos;
}

// Faixas de conceito do Exame de Qualificação da Uerj (baseadas nos 60
// pontos oficiais: A 54-60, B 42-53, C 30-41, D 18-29, E 0-17), aplicadas
// como percentual pra funcionar com qualquer quantidade de questões.
export function conceitoUerj(acertos: number, totalQuestoes: number): "A" | "B" | "C" | "D" | "E" {
  const percentual = totalQuestoes > 0 ? (acertos / totalQuestoes) * 100 : 0;
  if (percentual >= 90) return "A";
  if (percentual >= 70) return "B";
  if (percentual >= 50) return "C";
  if (percentual >= 30) return "D";
  return "E";
}
