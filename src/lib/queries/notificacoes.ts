import { prisma } from "@/lib/prisma";

export async function getNotificacoesDoUsuario(userId: string, limit = 15) {
  return prisma.notificacao.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getContagemNaoLidas(userId: string) {
  return prisma.notificacao.count({ where: { userId, lida: false } });
}
