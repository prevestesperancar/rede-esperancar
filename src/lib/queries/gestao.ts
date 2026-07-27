import { prisma } from "@/lib/prisma";

export async function getUsuariosDoNucleo(nucleoId: string, role?: string) {
  return prisma.user.findMany({
    where: {
      nucleoId,
      ...(role ? { role: role as "ESTUDANTE" | "PROFESSOR" | "COORDENACAO" | "APOIO_PSICOSSOCIAL" } : {}),
    },
    include: {
      estudante: { include: { matriculas: { orderBy: { createdAt: "desc" }, take: 1 } } },
    },
    orderBy: [{ role: "asc" }, { nome: "asc" }],
  });
}

export async function getNucleoNome(nucleoId: string) {
  const nucleo = await prisma.nucleo.findUnique({
    where: { id: nucleoId },
    select: { nome: true },
  });
  return nucleo?.nome ?? "";
}

export async function getNucleoInfo(nucleoId: string) {
  return prisma.nucleo.findUnique({
    where: { id: nucleoId },
    select: { nome: true, googleSheetsUrl: true },
  });
}

export async function getGestaoStats(nucleoId: string) {
  const [estudantesAtivos, turmas, professores, matriculas] = await Promise.all([
    prisma.matricula.count({
      where: { status: "APROVADA", turma: { nucleoId } },
    }),
    prisma.turma.count({ where: { nucleoId, ativo: true } }),
    prisma.user.count({ where: { nucleoId, role: "PROFESSOR" } }),
    prisma.matricula.findMany({
      where: { turma: { nucleoId } },
      select: { status: true },
    }),
  ]);

  return { estudantesAtivos, turmas, professores };
}

export async function getInscricoesPendentes(nucleoId: string) {
  return prisma.matricula.findMany({
    where: { status: "PENDENTE", turma: { nucleoId } },
    include: { estudante: { include: { user: true } }, turma: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getTurmasDoNucleo(nucleoId: string) {
  return prisma.turma.findMany({
    where: { nucleoId },
    include: {
      matriculas: {
        where: { status: "APROVADA" },
        include: { estudante: { include: { user: true } } },
      },
      disciplinas: { include: { disciplina: true, professor: true } },
    },
    orderBy: { nome: "asc" },
  });
}

export async function getEstudantesDoNucleo(nucleoId: string) {
  return prisma.matricula.findMany({
    where: {
      status: "APROVADA",
      turma: { nucleoId },
      estudante: { status: { notIn: ["DESISTENTE", "TRANSFERIDO"] } },
    },
    include: { estudante: { include: { user: true } }, turma: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProfessoresDoNucleo(nucleoId: string) {
  return prisma.user.findMany({
    where: { nucleoId, role: "PROFESSOR" },
    include: {
      disciplinasQueLeciona: { include: { disciplina: true } },
    },
    orderBy: { nome: "asc" },
  });
}

export async function getMateriaisDoNucleoGestao(nucleoId: string) {
  return prisma.material.findMany({
    where: { nucleoId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAvisosDoNucleo(nucleoId: string) {
  return prisma.aviso.findMany({
    where: { nucleoId },
    include: { turma: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEventosDoNucleo(nucleoId: string) {
  return prisma.evento.findMany({
    where: { nucleoId },
    orderBy: { data: "asc" },
  });
}

export async function getProvasDoNucleo(nucleoId: string) {
  return prisma.prova.findMany({
    where: { nucleoId },
    orderBy: { data: "asc" },
  });
}

export async function getMonitoriasDoNucleo(nucleoId: string) {
  return prisma.monitoria.findMany({
    where: { OR: [{ nucleoId }, { global: true }] },
    include: { turma: true, disciplina: true, professor: true },
    orderBy: { diaSemana: "asc" },
  });
}

export async function getDisciplinasDoNucleo(nucleoId: string) {
  const registros = await prisma.turmaDisciplina.findMany({
    where: { turma: { nucleoId } },
    select: { disciplina: true },
    distinct: ["disciplinaId"],
  });
  return registros.map((r) => r.disciplina);
}

export async function getDisciplinasDoProfessor(professorId: string) {
  const registros = await prisma.turmaDisciplina.findMany({
    where: { professorId },
    select: { disciplina: true },
    distinct: ["disciplinaId"],
  });
  return registros.map((r) => r.disciplina);
}

export async function getDepoimentosDoNucleo(nucleoId: string) {
  return prisma.depoimento.findMany({
    where: { nucleoId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFrequenciaGeralTurma(turmaId: string) {
  const registros = await prisma.frequencia.findMany({ where: { turmaId } });
  const total = registros.length;
  const presentes = registros.filter((r) => r.presente).length;
  return {
    total,
    presentes,
    percentual: total > 0 ? Math.round((presentes / total) * 100) : null,
  };
}

export async function getGradeDoProfessor(professorId: string) {
  return prisma.turmaDisciplina.findMany({
    where: { professorId },
    include: { disciplina: true, turma: true },
    orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
  });
}

export async function getMonitoriasDoProfessor(professorId: string) {
  const turmaIds = await getTurmasDoProfessor(professorId);
  return prisma.monitoria.findMany({
    where: {
      OR: [{ turmaId: { in: turmaIds } }, { professorId }],
    },
    include: { turma: true, disciplina: true },
    orderBy: { diaSemana: "asc" },
  });
}

export async function getTurmasDoProfessor(professorId: string) {
  const disciplinas = await prisma.turmaDisciplina.findMany({
    where: { professorId },
    select: { turmaId: true },
    distinct: ["turmaId"],
  });
  return disciplinas.map((d) => d.turmaId);
}

export async function getFrequenciaResumoDoNucleo(
  nucleoId: string,
  dataSelecionada?: string,
  turmaIds?: string[]
) {
  const turmas = await prisma.turma.findMany({
    where: { nucleoId, ...(turmaIds ? { id: { in: turmaIds } } : {}) },
    include: {
      matriculas: {
        where: { status: "APROVADA" },
        include: {
          estudante: {
            include: {
              user: true,
              frequencias: true,
            },
          },
        },
      },
    },
    orderBy: { nome: "asc" },
  });

  const dataISO = dataSelecionada ?? new Date().toISOString().slice(0, 10);

  return turmas.map((turma) => {
    const estudantes = turma.matriculas.map((m) => {
      const registros = m.estudante.frequencias.filter(
        (f) => f.turmaId === turma.id
      );
      const total = registros.length;
      const presentes = registros.filter((r) => r.presente).length;
      const registroDia = registros.find(
        (r) => r.data.toISOString().slice(0, 10) === dataISO
      );
      return {
        estudanteId: m.estudante.id,
        nome: m.estudante.user.nome,
        total,
        percentual: total > 0 ? Math.round((presentes / total) * 100) : null,
        statusHoje: (registroDia ? (registroDia.presente ? "presente" : "falta") : null) as
          | "presente"
          | "falta"
          | null,
      };
    });

    const totalGeral = estudantes.reduce((acc, e) => acc + e.total, 0);
    const presentesGeral = turma.matriculas.reduce(
      (acc, m) =>
        acc +
        m.estudante.frequencias.filter((f) => f.turmaId === turma.id && f.presente).length,
      0
    );

    return {
      turmaId: turma.id,
      turmaNome: `${turma.nome} — ${turma.periodo}`,
      percentualGeral: totalGeral > 0 ? Math.round((presentesGeral / totalGeral) * 100) : null,
      estudantes,
    };
  });
}

export async function getProfessorDetalhe(professorId: string, nucleoId: string) {
  return prisma.user.findFirst({
    where: { id: professorId, nucleoId, role: "PROFESSOR" },
    include: {
      disciplinasQueLeciona: { include: { disciplina: true, turma: true } },
    },
  });
}

export async function getSimuladosDoNucleo(nucleoId: string) {
  return prisma.simulado.findMany({
    where: { nucleoId },
    include: {
      respostas: { include: { estudante: { include: { user: true } } } },
    },
    orderBy: { data: "desc" },
  });
}

export async function getEstudantesParaSimulado(nucleoId: string) {
  const matriculas = await prisma.matricula.findMany({
    where: { status: "APROVADA", turma: { nucleoId } },
    include: { estudante: { include: { user: true } } },
    orderBy: { createdAt: "asc" },
  });
  return matriculas.map((m) => ({ id: m.estudante.id, nome: m.estudante.user.nome }));
}

export async function getFrequenciaDetalhadaDoNucleo(nucleoId: string) {
  const matriculas = await prisma.matricula.findMany({
    where: { status: "APROVADA", turma: { nucleoId } },
    include: {
      estudante: {
        include: {
          user: true,
          frequencias: { orderBy: { data: "desc" } },
        },
      },
      turma: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const hoje = new Date();

  return matriculas.map((m) => {
    const registros = m.estudante.frequencias.filter((f) => f.turmaId === m.turmaId);
    const total = registros.length;
    const presentes = registros.filter((r) => r.presente).length;

    const registrosDoMes = registros.filter(
      (r) => r.data.getMonth() === hoje.getMonth() && r.data.getFullYear() === hoje.getFullYear()
    );
    const totalMes = registrosDoMes.length;
    const presentesMes = registrosDoMes.filter((r) => r.presente).length;

    return {
      estudanteId: m.estudante.id,
      nome: m.estudante.user.nome,
      turmaNome: `${m.turma.nome} — ${m.turma.periodo}`,
      percentual: total > 0 ? Math.round((presentes / total) * 100) : null,
      percentualMes: totalMes > 0 ? Math.round((presentesMes / totalMes) * 100) : null,
      registros: registros.map((r) => ({ data: r.data, presente: r.presente })),
    };
  });
}

export async function getEstudanteDetalhe(matriculaId: string, nucleoId?: string) {
  return prisma.matricula.findFirst({
    where: { id: matriculaId, ...(nucleoId ? { turma: { nucleoId } } : {}) },
    include: {
      estudante: { include: { user: true } },
      turma: { include: { nucleo: true } },
    },
  });
}
