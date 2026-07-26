import { prisma } from "@/lib/prisma";

export async function getFormulariosDoNucleo(nucleoId: string) {
  return prisma.formularioCustom.findMany({
    where: { nucleoId },
    include: { _count: { select: { respostas: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFormularioDetalhe(formularioId: string, nucleoId: string) {
  return prisma.formularioCustom.findFirst({
    where: { id: formularioId, nucleoId },
    include: { respostas: { orderBy: { createdAt: "desc" } } },
  });
}

export async function getFormularioPublico(formularioId: string) {
  return prisma.formularioCustom.findUnique({ where: { id: formularioId } });
}
