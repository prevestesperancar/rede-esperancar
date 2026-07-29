"use server";

import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { criteriosDaProva } from "@/lib/redacao-criterios";

const GESTAO_ROLES = ["PROFESSOR", "COORDENACAO", "ADMIN"];

async function requireGestao() {
  const session = await auth();
  if (!session?.user || !GESTAO_ROLES.includes(session.user.role)) {
    throw new Error("Não autorizado.");
  }
  return session.user;
}

async function requireEstudante() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ESTUDANTE") {
    throw new Error("Não autorizado.");
  }
  const estudante = await prisma.estudante.findUnique({ where: { userId: session.user.id } });
  if (!estudante) throw new Error("Estudante não encontrado.");
  return estudante;
}

export async function criarTemaRedacao(_prevState: string | undefined, formData: FormData) {
  const user = await requireGestao();

  const prova = formData.get("prova") as string;
  const titulo = formData.get("titulo") as string;
  const textoMotivador = formData.get("textoMotivador") as string;
  const prazoEnvio = formData.get("prazoEnvio") as string;

  if (!prova || !titulo) return "Escolha a prova e o título do tema.";

  await prisma.temaRedacao.create({
    data: {
      prova,
      titulo,
      textoMotivador: textoMotivador || null,
      prazoEnvio: prazoEnvio ? new Date(prazoEnvio) : null,
      criadoPorId: user.id,
    },
  });

  revalidatePath("/gestao/redacoes");
  revalidatePath("/aluno/redacao");
  return undefined;
}

export async function alternarTemaAtivo(temaId: string) {
  await requireGestao();
  const tema = await prisma.temaRedacao.findUnique({ where: { id: temaId } });
  if (!tema) throw new Error("Tema não encontrado.");
  await prisma.temaRedacao.update({ where: { id: temaId }, data: { ativo: !tema.ativo } });
  revalidatePath("/gestao/redacoes");
  revalidatePath("/aluno/redacao");
}

export async function enviarRedacao(_prevState: string | undefined, formData: FormData) {
  const estudante = await requireEstudante();

  const temaId = formData.get("temaId") as string;
  const textoEnviado = formData.get("textoEnviado") as string;

  if (!temaId || !textoEnviado || textoEnviado.trim().length < 50) {
    return "Escolha um tema e escreva o texto completo (pelo menos 50 caracteres).";
  }

  const tema = await prisma.temaRedacao.findUnique({ where: { id: temaId } });
  if (!tema || !tema.ativo) return "Tema não encontrado ou não está mais disponível.";
  if (tema.prazoEnvio && tema.prazoEnvio.getTime() < Date.now()) {
    return "O prazo de envio desse tema já passou.";
  }

  await prisma.redacao.create({
    data: { estudanteId: estudante.id, temaId, textoEnviado },
  });

  revalidatePath("/aluno/redacao");
  revalidatePath("/gestao/redacoes");
  return "Redação enviada! A professora vai corrigir em breve.";
}

export async function gerarDiagnosticoIA(redacaoId: string): Promise<string> {
  await requireGestao();

  if (!process.env.GEMINI_API_KEY) {
    return "Diagnóstico por IA não está configurado (falta a chave da API). Peça pro time técnico configurar GEMINI_API_KEY.";
  }

  const redacao = await prisma.redacao.findUnique({
    where: { id: redacaoId },
    include: { tema: true },
  });
  if (!redacao) return "Redação não encontrada.";

  const criterios = criteriosDaProva(redacao.tema.prova);
  const listaCriterios = criterios.map((c) => `- ${c.label} (0 a ${c.max} pontos)`).join("\n");

  let texto: string;
  try {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
    const resultado = await model.generateContent(
      `Você é um assistente que ajuda uma professora de redação a corrigir textos de estudantes de um pré-vestibular social para o ${redacao.tema.prova}.

Tema proposto: "${redacao.tema.titulo}"
${redacao.tema.textoMotivador ? `Texto motivador: ${redacao.tema.textoMotivador}\n` : ""}
Critérios oficiais de avaliação:
${listaCriterios}

Texto do estudante:
"""
${redacao.textoEnviado}
"""

Faça um diagnóstico BREVE (máximo 200 palavras) para ajudar a professora a corrigir mais rápido — não é a nota final, é só um rascunho de apoio. Aponte: pontos fortes, principais problemas por critério, e 1-2 sugestões de melhoria. Seja direto, em português, sem enrolação.`
    );
    texto = resultado.response.text().trim();
  } catch (error) {
    console.error("Erro ao gerar diagnóstico IA:", error);
    return "Não foi possível gerar o diagnóstico agora (erro na API de IA). Tente novamente em alguns segundos.";
  }

  await prisma.redacao.update({ where: { id: redacaoId }, data: { diagnosticoIA: texto || null } });
  revalidatePath(`/gestao/redacoes/${redacaoId}`);
  return texto || "Não foi possível gerar o diagnóstico.";
}

export async function corrigirRedacao(_prevState: string | undefined, formData: FormData) {
  const user = await requireGestao();

  const redacaoId = formData.get("redacaoId") as string;
  const notasComponentes = formData.get("notasComponentes") as string;
  const notaTotal = Number(formData.get("notaTotal"));
  const comentarioGeral = formData.get("comentarioGeral") as string;
  const marcacoes = formData.get("marcacoes") as string;

  if (!redacaoId || !notasComponentes || Number.isNaN(notaTotal)) {
    return "Preencha as notas por competência antes de salvar.";
  }

  const redacao = await prisma.redacao.findUnique({
    where: { id: redacaoId },
    include: { estudante: true, tema: true },
  });
  if (!redacao) return "Redação não encontrada.";

  await prisma.redacao.update({
    where: { id: redacaoId },
    data: {
      status: "CORRIGIDA",
      notasComponentes,
      notaTotal,
      comentarioGeral: comentarioGeral || null,
      marcacoes: marcacoes || null,
      corrigidoPorId: user.id,
      corrigidoEm: new Date(),
    },
  });

  await prisma.notificacao.create({
    data: {
      userId: redacao.estudante.userId,
      tipo: "REDACAO",
      mensagem: `Sua redação "${redacao.tema.titulo}" foi corrigida — nota ${notaTotal}.`,
      link: `/aluno/redacao/${redacaoId}`,
    },
  });

  revalidatePath("/gestao/redacoes");
  revalidatePath("/aluno/redacao");
  return "Correção salva!";
}
