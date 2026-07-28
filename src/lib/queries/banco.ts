import { prisma } from "@/lib/prisma";

export async function getMateriasDisponiveis(prova: string) {
  const rows = await prisma.questaoBanco.findMany({
    where: { prova },
    select: { materia: true },
    distinct: ["materia"],
    orderBy: { materia: "asc" },
  });
  return rows.map((r) => r.materia);
}

export async function getQuestoesAleatorias(
  prova: string,
  materias: string[],
  quantidade: number
) {
  const questoes = await prisma.questaoBanco.findMany({
    where: { prova, materia: { in: materias } },
  });
  const embaralhadas = questoes.sort(() => Math.random() - 0.5);
  return embaralhadas.slice(0, quantidade);
}

export async function getTodasQuestoes() {
  return prisma.questaoBanco.findMany({ orderBy: [{ prova: "asc" }, { materia: "asc" }] });
}

export async function getTodasDisciplinas() {
  return prisma.disciplina.findMany({ orderBy: { nome: "asc" } });
}
