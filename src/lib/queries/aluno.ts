import { prisma } from "@/lib/prisma";

export async function getEstudanteByUserId(userId: string) {
  return prisma.estudante.findUnique({
    where: { userId },
    include: { user: true },
  });
}

export async function getTurmaAtivaDoEstudante(estudanteId: string) {
  const matricula = await prisma.matricula.findFirst({
    where: { estudanteId, status: "APROVADA" },
    include: {
      turma: {
        include: {
          nucleo: true,
          disciplinas: {
            include: { disciplina: true, professor: true },
            orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
          },
          matriculas: {
            where: { status: "APROVADA" },
            include: { estudante: { include: { user: true } } },
          },
        },
      },
    },
  });
  if (!matricula) return null;

  // Avisos gerais do núcleo (turmaId nulo) também valem pra essa turma,
  // não só os que foram criados especificamente pra ela.
  const avisos = await prisma.aviso.findMany({
    where: {
      nucleoId: matricula.turma.nucleoId,
      OR: [{ turmaId: matricula.turmaId }, { turmaId: null }],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return { ...matricula.turma, avisos };
}

export async function getMateriaisDoNucleo(nucleoId: string) {
  return prisma.material.findMany({
    where: { nucleoId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMonitoriasDaTurma(turmaId: string, nucleoId: string) {
  return prisma.monitoria.findMany({
    where: {
      OR: [{ turmaId }, { AND: [{ nucleoId }, { turmaId: null }] }, { global: true }],
    },
    include: { disciplina: true },
    orderBy: { diaSemana: "asc" },
  });
}

export async function getProximaProva(nucleoId: string) {
  return prisma.prova.findFirst({
    where: { nucleoId, data: { gte: new Date() } },
    orderBy: { data: "asc" },
  });
}
