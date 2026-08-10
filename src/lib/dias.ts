// "diaSemana" é salvo como texto livre ("Segunda", "Sábado 1", "Noturno Ter/Qui"...)
// então `orderBy: { diaSemana: "asc" }` no Prisma ordena alfabeticamente, não
// cronologicamente — "Quarta" vem antes de "Segunda". Essa ordem corrige isso.
const ORDEM_DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function indiceDiaSemana(diaSemana: string): number {
  const normalizado = diaSemana.trim();
  const indice = ORDEM_DIAS.findIndex((d) => normalizado.startsWith(d));
  return indice === -1 ? ORDEM_DIAS.length : indice;
}

export function ordenarPorDiaSemana<T extends { diaSemana: string }>(itens: T[]): T[] {
  return [...itens].sort((a, b) => indiceDiaSemana(a.diaSemana) - indiceDiaSemana(b.diaSemana));
}
