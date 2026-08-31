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

// Faixas oficiais do Exame de Qualificação da Uerj — 60 questões, acertos
// mínimos e pontuação de cada conceito. Conceito E é eliminação.
const FAIXAS_CONCEITO_UERJ = [
  { letra: "A" as const, minimoEm60: 43, pontos: 20 },
  { letra: "B" as const, minimoEm60: 37, pontos: 15 },
  { letra: "C" as const, minimoEm60: 31, pontos: 10 },
  { letra: "D" as const, minimoEm60: 25, pontos: 5 },
  { letra: "E" as const, minimoEm60: 0, pontos: null },
];

// Se a prova não tiver exatamente 60 questões, escala os acertos pra base
// 60 antes de comparar com as faixas oficiais.
export function conceitoUerj(acertos: number, totalQuestoes: number): "A" | "B" | "C" | "D" | "E" {
  const acertosEm60 = totalQuestoes > 0 ? Math.round((acertos / totalQuestoes) * 60) : 0;
  const faixa = FAIXAS_CONCEITO_UERJ.find((f) => acertosEm60 >= f.minimoEm60);
  return faixa?.letra ?? "E";
}

// Pontuação do conceito (20/15/10/5) — null quando é eliminação (conceito E).
export function pontosConceito(conceito: "A" | "B" | "C" | "D" | "E"): number | null {
  return FAIXAS_CONCEITO_UERJ.find((f) => f.letra === conceito)?.pontos ?? null;
}

// Texto pra mostrar ao lado do conceito: "20 pontos" etc. — vazio no E
// (eliminação já fica implícita em não ter pontuação nenhuma).
export function rotuloConceito(conceito: "A" | "B" | "C" | "D" | "E"): string {
  if (conceito === "E") return "";
  return `${pontosConceito(conceito)} pontos`;
}

// Seções do cartão-resposta oficial da Uerj (prova de 60 questões), na mesma
// ordem/numeração impressa no gabarito físico — usado pra montar a grade de
// conferência parecida com o cartão real.
export const SECOES_UERJ_60 = [
  { nome: "Texto Base", inicio: 1, fim: 8 },
  { nome: "Linguagens", inicio: 9, fim: 22 },
  { nome: "Língua Estrangeira", inicio: INICIO_BLOCO_LINGUA, fim: FIM_BLOCO_LINGUA },
  { nome: "Matemática", inicio: 28, fim: 34 },
  { nome: "Ciências da Natureza", inicio: 35, fim: 47 },
  { nome: "Ciências Humanas", inicio: 48, fim: 60 },
];
