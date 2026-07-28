export const CRITERIOS_REDACAO: Record<string, { label: string; max: number }[]> = {
  ENEM: [
    { label: "Competência 1 — Domínio da escrita formal", max: 200 },
    { label: "Competência 2 — Compreensão do tema", max: 200 },
    { label: "Competência 3 — Seleção e organização de argumentos", max: 200 },
    { label: "Competência 4 — Coesão textual", max: 200 },
    { label: "Competência 5 — Proposta de intervenção", max: 200 },
  ],
  UERJ: [
    { label: "Grupo I — Correção gramatical", max: 10 },
    { label: "Grupo II — Argumentação e comunicação", max: 10 },
    { label: "Grupo III — Adequação ao gênero e à modalidade", max: 10 },
  ],
};

export function criteriosDaProva(prova: string) {
  return CRITERIOS_REDACAO[prova] ?? CRITERIOS_REDACAO.ENEM;
}
