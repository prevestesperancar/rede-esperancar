import { prisma } from "@/lib/prisma";

export async function getConteudoSite() {
  return prisma.conteudoSite.findFirst();
}

export async function getUsuariosAdmin(filtros?: { role?: string; nucleoId?: string }) {
  return prisma.user.findMany({
    where: {
      ...(filtros?.role ? { role: filtros.role as "ESTUDANTE" | "PROFESSOR" | "COORDENACAO" | "APOIO_PSICOSSOCIAL" | "ADMIN" } : {}),
      ...(filtros?.nucleoId ? { nucleoId: filtros.nucleoId } : {}),
    },
    include: {
      nucleo: true,
      estudante: { include: { matriculas: { orderBy: { createdAt: "desc" }, take: 1 } } },
    },
    orderBy: [{ role: "asc" }, { nome: "asc" }],
  });
}

export async function getNucleoAdminById(nucleoId: string) {
  return prisma.nucleo.findUnique({ where: { id: nucleoId } });
}

export async function getNucleosAdmin() {
  return prisma.nucleo.findMany({
    include: {
      coordenador: true,
      turmas: true,
      _count: { select: { turmas: true } },
    },
    orderBy: { nome: "asc" },
  });
}
