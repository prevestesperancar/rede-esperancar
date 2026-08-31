// Bloco de língua estrangeira do padrão Uerj: questões 23 a 27 (1-indexado).
// Cada aluno escolhe um idioma na prova, então essas 5 questões têm um
// gabarito diferente por idioma — o resto da prova é igual pra todo mundo.
export const INICIO_BLOCO_LINGUA = 23;
export const FIM_BLOCO_LINGUA = 27;

export const IDIOMAS_BLOCO_LINGUA = ["Inglês", "Espanhol", "Francês"] as const;
export type IdiomaBloco = (typeof IDIOMAS_BLOCO_LINGUA)[number];

type SimuladoComGabaritos = {
  gabarito: string;
  gabaritoIngles?: string | null;
  gabaritoEspanhol?: string | null;
  gabaritoFrances?: string | null;
};

// Monta o gabarito "de verdade" pra um aluno específico: usa o gabarito
// principal, mas troca as posições 23-27 pelo gabarito do idioma que ele
// escolheu. Sem prova com esse bloco (menos de 27 questões) ou sem idioma
// escolhido, essas posições ficam com "?" (nunca conta como acerto).
export function montarGabaritoEfetivo(
  simulado: SimuladoComGabaritos,
  linguaEscolhida?: string | null
): string {
  const base = simulado.gabarito.split(",").map((s) => s.trim().toUpperCase());
  if (base.length < FIM_BLOCO_LINGUA) return base.join(",");

  const gabaritoIdioma =
    linguaEscolhida === "Inglês"
      ? simulado.gabaritoIngles
      : linguaEscolhida === "Espanhol"
      ? simulado.gabaritoEspanhol
      : linguaEscolhida === "Francês"
      ? simulado.gabaritoFrances
      : null;

  const respostasIdioma = gabaritoIdioma
    ? gabaritoIdioma.split(",").map((s) => s.trim().toUpperCase())
    : null;

  return base
    .map((c, i) => {
      const posicao = i + 1;
      if (posicao < INICIO_BLOCO_LINGUA || posicao > FIM_BLOCO_LINGUA) return c;
      if (!respostasIdioma) return "?";
      return respostasIdioma[posicao - INICIO_BLOCO_LINGUA] ?? "?";
    })
    .join(",");
}

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

export function corrigirComLingua(
  simulado: SimuladoComGabaritos,
  respostas: string,
  linguaEscolhida?: string | null
) {
  return corrigirAutomaticamente(montarGabaritoEfetivo(simulado, linguaEscolhida), respostas);
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
