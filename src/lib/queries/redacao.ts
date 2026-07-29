import { prisma } from "@/lib/prisma";

export async function getTemasAtivos(prova?: string) {
  return prisma.temaRedacao.findMany({
    where: {
      ativo: true,
      OR: [{ prazoEnvio: null }, { prazoEnvio: { gte: new Date() } }],
      ...(prova ? { prova } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTodosTemas() {
  return prisma.temaRedacao.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redacoes: true } } },
  });
}

export async function getRedacoesPendentes(nucleoId: string) {
  return prisma.redacao.findMany({
    where: { status: "ENVIADA", estudante: { user: { nucleoId } } },
    include: { estudante: { include: { user: true } }, tema: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getRedacoesCorrigidas(nucleoId: string, limit = 20) {
  return prisma.redacao.findMany({
    where: { status: "CORRIGIDA", estudante: { user: { nucleoId } } },
    include: { estudante: { include: { user: true } }, tema: true },
    orderBy: { corrigidoEm: "desc" },
    take: limit,
  });
}

export async function getRedacaoParaCorrigir(redacaoId: string, nucleoId: string) {
  return prisma.redacao.findFirst({
    where: { id: redacaoId, estudante: { user: { nucleoId } } },
    include: { estudante: { include: { user: true } }, tema: true },
  });
}

export async function getRedacoesDoEstudante(estudanteId: string) {
  return prisma.redacao.findMany({
    where: { estudanteId },
    include: { tema: true, corrigidoPor: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRedacaoDoEstudantePorId(redacaoId: string, estudanteId: string) {
  return prisma.redacao.findFirst({
    where: { id: redacaoId, estudanteId },
    include: { tema: true, corrigidoPor: true },
  });
}
