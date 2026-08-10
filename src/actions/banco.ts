"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

const OBJETIVOS_VALIDOS = [
  "PASSAR_ENEM_ANO",
  "PASSAR_UERJ_ANO",
  "TREINO_ENEM",
  "MANDAR_BEM_ESCOLA",
  "AINDA_NAO_SEI",
];

export async function salvarObjetivoEstudo(_prevState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const nome = formData.get("nome") as string;
  const objetivoEstudo = formData.get("objetivoEstudo") as string;

  if (!nome) return "Preencha seu nome.";
  if (!OBJETIVOS_VALIDOS.includes(objetivoEstudo)) return "Escolha um objetivo.";

  const estudante = await requireEstudante();
  await Promise.all([
    prisma.estudante.update({ where: { id: estudante.id }, data: { objetivoEstudo } }),
    prisma.user.update({ where: { id: session.user.id }, data: { nome } }),
  ]);

  revalidatePath("/aluno");
  redirect("/aluno");
}

export async function salvarPerfilBanco(_prevState: string | undefined, formData: FormData) {
  const estudante = await requireEstudante();

  const perfilIntensidade = formData.get("perfilIntensidade") as string;
  const linguaEstrangeira = formData.get("linguaEstrangeira") as string;
  const questoesPorDia = Number(formData.get("questoesPorDia"));
  const cursoDesejado = formData.get("cursoDesejado") as string;
  const universidadeDesejada = formData.get("universidadeDesejada") as string;

  if (!["SEM_PRESSAO", "EQUILIBRISTA", "MONSTRAO"].includes(perfilIntensidade)) {
    return "Escolha um perfil de intensidade.";
  }
  if (!linguaEstrangeira) return "Escolha a língua estrangeira.";
  if (!questoesPorDia || questoesPorDia < 1) return "Escolha quantas questões por dia.";

  await prisma.estudante.update({
    where: { id: estudante.id },
    data: {
      perfilIntensidade,
      linguaEstrangeira,
      questoesPorDia,
      cursoDesejado: cursoDesejado || undefined,
      universidadeDesejada: universidadeDesejada || undefined,
    },
  });

  revalidatePath("/aluno/questoes");
  redirect("/aluno/questoes");
}

export async function salvarTentativasBanco(
  respostas: { questaoId: string; respostaEscolhida: string; correta: boolean }[]
) {
  const estudante = await requireEstudante();
  if (respostas.length === 0) return;

  await prisma.tentativaQuestaoBanco.createMany({
    data: respostas.map((r) => ({
      estudanteId: estudante.id,
      questaoId: r.questaoId,
      respostaEscolhida: r.respostaEscolhida,
      correta: r.correta,
    })),
  });

  revalidatePath("/aluno/questoes");
  revalidatePath("/aluno/questoes/desempenho");
  revalidatePath("/aluno/questoes/revisao");
}
