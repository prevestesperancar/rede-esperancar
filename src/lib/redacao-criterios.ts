export const CRITERIOS_REDACAO: Record<string, { label: string; max: number }[]> = {
  ENEM: [
    { label: "Competência 1 — Domínio da escrita formal", max: 200 },
    { label: "Competência 2 — Compreensão do tema", max: 200 },
    { label: "Competência 3 — Seleção e organização de argumentos", max: 200 },
    { label: "Competência 4 — Coesão textual", max: 200 },
    { label: "Competência 5 — Proposta de intervenção", max: 200 },
  ],
  UERJ: [
    { label: "1 — Desenvolvimento e abordagem do tema", max: 4 },
    { label: "2 — Estratégias argumentativas e progressão", max: 4 },
    { label: "3 — Coesão e coerência textual", max: 4 },
    { label: "4 — Registro linguístico formal", max: 4 },
    { label: "5 — Adequação ao tipo textual e número de linhas", max: 4 },
  ],
};

export function criteriosDaProva(prova: string) {
  return CRITERIOS_REDACAO[prova] ?? CRITERIOS_REDACAO.ENEM;
}
