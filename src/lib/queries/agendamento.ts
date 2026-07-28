import { prisma } from "@/lib/prisma";

export async function getSolicitacoesDoEstudante(estudanteId: string) {
  return prisma.solicitacaoAgendamento.findMany({
    where: { estudanteId },
    include: { professor: true },
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

export async function getSolicitacoesConfirmadasDoProfessor(professorId: string) {
  return prisma.solicitacaoAgendamento.findMany({
    where: { professorId, status: "CONFIRMADO" },
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

export async function getSolicitacoesApoioConfirmadas(nucleoId: string) {
  return prisma.solicitacaoAgendamento.findMany({
    where: { nucleoId, tipo: "APOIO", status: "CONFIRMADO" },
    include: { estudante: { include: { user: true } } },
    orderBy: { escolhaData: "asc" },
  });
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
