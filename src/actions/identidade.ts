"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLES_IDENTIDADE = ["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];
const MAX_FOTOS = 5;

async function requireIdentidade() {
  const session = await auth();
  if (!session?.user?.nucleoId || !ROLES_IDENTIDADE.includes(session.user.role)) {
    throw new Error("Não autorizado.");
  }
  return session.user.nucleoId;
}

export async function definirLogoNucleo(url: string) {
  const nucleoId = await requireIdentidade();
  await prisma.identidadeNucleo.upsert({
    where: { nucleoId },
    update: { logoUrl: url },
    create: { nucleoId, logoUrl: url },
  });
  revalidatePath("/gestao/identidade");
}

export async function adicionarFotoNucleo(url: string) {
  const nucleoId = await requireIdentidade();
  const atual = await prisma.identidadeNucleo.findUnique({ where: { nucleoId } });
  const fotos = atual?.fotos ?? [];
  if (fotos.length >= MAX_FOTOS) {
    throw new Error(`Limite de ${MAX_FOTOS} fotos. Remova uma antes de adicionar outra.`);
  }
  await prisma.identidadeNucleo.upsert({
    where: { nucleoId },
    update: { fotos: { push: url } },
    create: { nucleoId, fotos: [url] },
  });
  revalidatePath("/gestao/identidade");
}

export async function removerFotoNucleo(url: string) {
  const nucleoId = await requireIdentidade();
  const atual = await prisma.identidadeNucleo.findUnique({ where: { nucleoId } });
  if (!atual) return;
  await prisma.identidadeNucleo.update({
    where: { nucleoId },
    data: { fotos: atual.fotos.filter((f) => f !== url) },
  });
  revalidatePath("/gestao/identidade");
}

export async function definirPaletaNucleo(cores: string[]) {
  const nucleoId = await requireIdentidade();
  const HEX = /^#[0-9a-fA-F]{6}$/;
  const validas = cores.filter((c) => HEX.test(c)).slice(0, 5);
  if (validas.length === 0) throw new Error("Escolha pelo menos uma cor válida.");
  await prisma.identidadeNucleo.upsert({
    where: { nucleoId },
    update: { paleta: validas },
    create: { nucleoId, paleta: validas },
  });
  revalidatePath("/gestao/identidade");
}
