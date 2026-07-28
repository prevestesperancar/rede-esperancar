"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireEstudante() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ESTUDANTE") {
    throw new Error("Não autorizado.");
  }
  const estudante = await prisma.estudante.findUnique({ where: { userId: session.user.id } });
  if (!estudante) throw new Error("Estudante não encontrado.");
  return estudante;
}

export async function alternarFavoritoMaterial(materialId: string) {
  const estudante = await requireEstudante();

  const existente = await prisma.materialFavorito.findUnique({
    where: { materialId_estudanteId: { materialId, estudanteId: estudante.id } },
  });

  if (existente) {
    await prisma.materialFavorito.delete({ where: { id: existente.id } });
  } else {
    await prisma.materialFavorito.create({ data: { materialId, estudanteId: estudante.id } });
  }

  revalidatePath("/aluno/materiais");
}
