import { prisma } from "@/lib/prisma";

export async function getSolicitacoesDoEstudante(estudanteId: string) {
  return prisma.solicitacaoAgendamento.findMany({
    where: {
      estudanteId,
      OR: [{ status: { not: "CONFIRMADO" } }, { escolhaData: { gte: new Date() } }],
    },
    include: { professor: true, respondidoPor: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProfessoresDoNucleoParaSolicitacao(nucleoId: string) {
  return prisma.user.findMany({
    where: { nucleoId, role: "PROFESSOR" },
    orderBy: { nome: "asc" },
  });
}

export async function getApoioDoNucleo(nucleoId: string) {
  return prisma.user.findMany({
    where: { nucleoId, role: "APOIO_PSICOSSOCIAL" },
    orderBy: { nome: "asc" },
  });
}

export async function getSolicitacoesPendentesDoProfessor(professorId: string) {
  return prisma.solicitacaoAgendamento.findMany({
    where: { professorId, status: "PENDENTE" },
    include: { estudante: { include: { user: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getSolicitacoesAguardandoEscolhaDoProfessor(professorId: string) {
  return prisma.solicitacaoAgendamento.findMany({
    where: { professorId, status: "AGUARDANDO_ESCOLHA" },
    include: { estudante: { include: { user: true } } },
    orderBy: { respondidoEm: "asc" },
  });
}

export async function getSolicitacoesConfirmadasDoProfessor(professorId: string) {
  return prisma.solicitacaoAgendamento.findMany({
    where: { professorId, status: "CONFIRMADO", escolhaData: { gte: new Date() } },
    include: { estudante: { include: { user: true } } },
    orderBy: { escolhaData: "asc" },
  });
}

export async function getSolicitacoesApoioPendentes(nucleoId: string) {
  return prisma.solicitacaoAgendamento.findMany({
    where: { nucleoId, tipo: "APOIO", status: "PENDENTE" },
    include: { estudante: { include: { user: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getSolicitacoesApoioAguardandoEscolha(nucleoId: string) {
  return prisma.solicitacaoAgendamento.findMany({
    where: { nucleoId, tipo: "APOIO", status: "AGUARDANDO_ESCOLHA" },
    include: { estudante: { include: { user: true } } },
    orderBy: { respondidoEm: "asc" },
  });
}

export async function getSolicitacoesApoioConfirmadas(nucleoId: string) {
  return prisma.solicitacaoAgendamento.findMany({
    where: { nucleoId, tipo: "APOIO", status: "CONFIRMADO", escolhaData: { gte: new Date() } },
    include: { estudante: { include: { user: true } } },
    orderBy: { escolhaData: "asc" },
  });
}

export async function getContagemMonitoriaPendentes(professorId: string) {
  return prisma.solicitacaoAgendamento.count({
    where: { professorId, status: { in: ["PENDENTE", "AGUARDANDO_ESCOLHA"] } },
  });
}

export async function getContagemApoioPendentes(nucleoId: string) {
  return prisma.solicitacaoAgendamento.count({
    where: { nucleoId, tipo: "APOIO", status: { in: ["PENDENTE", "AGUARDANDO_ESCOLHA"] } },
  });
}

export async function getContagemAtendimentosSemana(nucleoId: string) {
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const agora = new Date();

  const [monitorias, apoios] = await Promise.all([
    prisma.solicitacaoAgendamento.count({
      where: {
        nucleoId,
        tipo: "MONITORIA",
        status: "CONFIRMADO",
        escolhaData: { gte: seteDiasAtras, lte: agora },
      },
    }),
    prisma.solicitacaoAgendamento.count({
      where: {
        nucleoId,
        tipo: "APOIO",
        status: "CONFIRMADO",
        escolhaData: { gte: seteDiasAtras, lte: agora },
      },
    }),
  ]);

  return { monitorias, apoios };
}

export async function getSolicitacoesAtrasadas(nucleoId: string) {
  const tresDiasAtras = new Date();
  tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

  return prisma.solicitacaoAgendamento.findMany({
    where: { nucleoId, status: "PENDENTE", createdAt: { lte: tresDiasAtras } },
    include: { estudante: { include: { user: true } }, professor: true },
    orderBy: { createdAt: "asc" },
  });
}
