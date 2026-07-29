"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const COORDENACAO_ROLES = ["COORDENACAO", "ADMIN"];

async function requireCoordenacao() {
  const session = await auth();
  if (!session?.user || !COORDENACAO_ROLES.includes(session.user.role)) {
    throw new Error("Não autorizado.");
  }
  return session.user;
}

export type Campo = {
  id: string;
  label: string;
  tipo: "texto" | "textarea" | "select" | "radio" | "checkboxes" | "checkbox" | "data" | "hora";
  opcoes?: string[];
  obrigatorio: boolean;
};

const TIPOS_MULTIPLOS = ["checkboxes"];

export async function criarFormulario(_prevState: string | undefined, formData: FormData) {
  const user = await requireCoordenacao();

  const titulo = formData.get("titulo") as string;
  const descricao = formData.get("descricao") as string;
  const camposJson = formData.get("campos") as string;

  if (!titulo) return "Preencha o título do formulário.";

  let campos: Campo[];
  try {
    campos = JSON.parse(camposJson);
  } catch {
    return "Erro ao ler os campos do formulário.";
  }
  if (!Array.isArray(campos) || campos.length === 0) {
    return "Adicione pelo menos um campo.";
  }

  const formulario = await prisma.formularioCustom.create({
    data: {
      titulo,
      descricao: descricao || null,
      campos: JSON.stringify(campos),
      nucleoId: user.nucleoId!,
    },
  });

  revalidatePath("/gestao/formularios");
  redirect(`/gestao/formularios/${formulario.id}`);
}

export async function apagarFormulario(formularioId: string) {
  const user = await requireCoordenacao();
  const formulario = await prisma.formularioCustom.findUnique({ where: { id: formularioId } });
  if (!formulario || formulario.nucleoId !== user.nucleoId) {
    throw new Error("Formulário não encontrado neste núcleo.");
  }
  await prisma.formularioResposta.deleteMany({ where: { formularioId } });
  await prisma.formularioCustom.delete({ where: { id: formularioId } });
  revalidatePath("/gestao/formularios");
}

export async function alternarFormularioAtivo(formularioId: string) {
  const user = await requireCoordenacao();
  const formulario = await prisma.formularioCustom.findUnique({ where: { id: formularioId } });
  if (!formulario || formulario.nucleoId !== user.nucleoId) {
    throw new Error("Formulário não encontrado neste núcleo.");
  }
  await prisma.formularioCustom.update({
    where: { id: formularioId },
    data: { ativo: !formulario.ativo },
  });
  revalidatePath("/gestao/formularios");
  revalidatePath(`/gestao/formularios/${formularioId}`);
}

export async function responderFormulario(
  formularioId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  const formulario = await prisma.formularioCustom.findUnique({ where: { id: formularioId } });
  if (!formulario || !formulario.ativo) return "Formulário não encontrado ou encerrado.";

  const campos: Campo[] = JSON.parse(formulario.campos);
  const respostas: Record<string, string> = {};

  for (const campo of campos) {
    if (TIPOS_MULTIPLOS.includes(campo.tipo)) {
      const valores = formData.getAll(campo.id) as string[];
      if (campo.obrigatorio && valores.length === 0) {
        return `Preencha o campo "${campo.label}".`;
      }
      respostas[campo.id] = valores.join(", ");
      continue;
    }
    const valor = formData.get(campo.id) as string | null;
    if (campo.obrigatorio && !valor) {
      return `Preencha o campo "${campo.label}".`;
    }
    respostas[campo.id] = valor ?? "";
  }

  await prisma.formularioResposta.create({
    data: { formularioId, respostas: JSON.stringify(respostas) },
  });

  redirect(`/formularios/${formularioId}/enviado`);
}
