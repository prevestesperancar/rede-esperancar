"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function marcarNotificacaoLida(notificacaoId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado.");

  const notificacao = await prisma.notificacao.findUnique({ where: { id: notificacaoId } });
  if (!notificacao || notificacao.userId !== session.user.id) return;

  await prisma.notificacao.update({ where: { id: notificacaoId }, data: { lida: true } });
  revalidatePath("/aluno");
  revalidatePath("/gestao");
}

export async function marcarTodasNotificacoesLidas() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado.");

  await prisma.notificacao.updateMany({
    where: { userId: session.user.id, lida: false },
    data: { lida: true },
  });
  revalidatePath("/aluno");
  revalidatePath("/gestao");
}
