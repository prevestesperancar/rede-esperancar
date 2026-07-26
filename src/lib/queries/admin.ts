import { prisma } from "@/lib/prisma";

export async function getConteudoSite() {
  return prisma.conteudoSite.findFirst();
}

export async function getUsuariosAdmin() {
  return prisma.user.findMany({
    where: { role: { not: "ESTUDANTE" } },
    include: { nucleo: true },
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
