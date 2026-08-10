import { prisma } from "@/lib/prisma";
import { ordenarPorDiaSemana } from "@/lib/dias";

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

  matricula.turma.disciplinas = ordenarPorDiaSemana(matricula.turma.disciplinas);

  // Avisos gerais do núcleo (turmaId nulo) também valem pra essa turma,
  // não só os que foram criados especificamente pra ela. Somem depois de 7 dias.
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const avisos = await prisma.aviso.findMany({
    where: {
      nucleoId: matricula.turma.nucleoId,
      OR: [{ turmaId: matricula.turmaId }, { turmaId: null }],
      createdAt: { gte: seteDiasAtras },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return { ...matricula.turma, avisos };
}

export async function getMateriaisDoNucleo(nucleoId: string, estudanteId?: string) {
  return prisma.material.findMany({
    where: { nucleoId },
    include: {
      disciplina: true,
      favoritos: estudanteId ? { where: { estudanteId } } : false,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMonitoriasDaTurma(turmaId: string, nucleoId: string) {
  const monitorias = await prisma.monitoria.findMany({
    where: {
      OR: [{ turmaId }, { AND: [{ nucleoId }, { turmaId: null }] }, { global: true }],
    },
    include: { disciplina: true },
    orderBy: { horaInicio: "asc" },
  });
  return ordenarPorDiaSemana(monitorias);
}

export async function getProximaProva(nucleoId: string) {
  return prisma.prova.findFirst({
    where: { nucleoId, data: { gte: new Date() } },
    orderBy: { data: "asc" },
  });
}

export async function getProximasProvasPorTipo(nucleoId: string) {
  const provas = await prisma.prova.findMany({
    where: { nucleoId, data: { gte: new Date() } },
    orderBy: { data: "asc" },
  });

  const normalizar = (t: string) => t.toUpperCase();
  const enem = provas.find((p) => normalizar(p.nome).includes("ENEM")) ?? null;
  const uerj = provas.find((p) => normalizar(p.nome).includes("UERJ")) ?? null;
  const outras = provas.filter(
    (p) => !normalizar(p.nome).includes("ENEM") && !normalizar(p.nome).includes("UERJ")
  );

  return { enem, uerj, outras };
}
