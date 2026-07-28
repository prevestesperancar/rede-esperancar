"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function alternarConclusaoCronograma(chave: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ESTUDANTE") throw new Error("Não autorizado.");

  const estudante = await prisma.estudante.findUnique({ where: { userId: session.user.id } });
  if (!estudante) throw new Error("Estudante não encontrado.");

  const existente = await prisma.cronogramaConclusao.findUnique({
    where: { estudanteId_chave: { estudanteId: estudante.id, chave } },
  });

  if (existente) {
    await prisma.cronogramaConclusao.delete({ where: { id: existente.id } });
  } else {
    await prisma.cronogramaConclusao.create({ data: { estudanteId: estudante.id, chave } });
  }

  revalidatePath("/aluno/cronograma");
}
