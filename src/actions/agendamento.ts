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
  return { session, estudante };
}

export async function solicitarMonitoria(
  _prevState: string | undefined,
  formData: FormData
) {
  const { session, estudante } = await requireEstudante();
  if (!session.user.nucleoId) return "Núcleo não encontrado.";

  const professorId = formData.get("professorId") as string;
  const mensagem = formData.get("mensagem") as string;

  if (!professorId) return "Escolha um professor.";

  const professor = await prisma.user.findUnique({ where: { id: professorId } });
  if (!professor || professor.nucleoId !== session.user.nucleoId || professor.role !== "PROFESSOR") {
    return "Professor não encontrado neste núcleo.";
  }

  await prisma.solicitacaoAgendamento.create({
    data: {
      tipo: "MONITORIA",
      estudanteId: estudante.id,
      professorId,
      nucleoId: session.user.nucleoId,
      mensagem: mensagem || null,
    },
  });

  revalidatePath("/aluno/monitorias");
  revalidatePath("/gestao/monitorias");
  return "Solicitação enviada! O professor vai sugerir horários.";
}

export async function solicitarApoio(
  _prevState: string | undefined,
  formData: FormData
) {
  const { session, estudante } = await requireEstudante();
  if (!session.user.nucleoId) return "Núcleo não encontrado.";

  const mensagem = formData.get("mensagem") as string;

  await prisma.solicitacaoAgendamento.create({
    data: {
      tipo: "APOIO",
      estudanteId: estudante.id,
      nucleoId: session.user.nucleoId,
      mensagem: mensagem || null,
    },
  });

  revalidatePath("/aluno/apoio");
  revalidatePath("/gestao");
  return "Solicitação enviada! O apoio psicossocial vai sugerir horários.";
}

export async function responderSolicitacao(
  _prevState: string | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user || !["PROFESSOR", "APOIO_PSICOSSOCIAL", "ADMIN"].includes(session.user.role)) {
    return "Não autorizado.";
  }

  const solicitacaoId = formData.get("solicitacaoId") as string;
  const opcao1 = formData.get("opcao1") as string;
  const opcao2 = formData.get("opcao2") as string;
  const opcao3 = formData.get("opcao3") as string;

  if (!opcao1 || !opcao2 || !opcao3) return "Sugira os 3 horários.";

  const solicitacao = await prisma.solicitacaoAgendamento.findUnique({ where: { id: solicitacaoId } });
  if (!solicitacao || solicitacao.status !== "PENDENTE") return "Solicitação não encontrada.";

  if (solicitacao.tipo === "MONITORIA" && solicitacao.professorId !== session.user.id) {
    return "Essa solicitação não é sua.";
  }
  if (solicitacao.tipo === "APOIO") {
    if (session.user.role !== "APOIO_PSICOSSOCIAL" && session.user.role !== "ADMIN") return "Não autorizado.";
    if (solicitacao.nucleoId !== session.user.nucleoId && session.user.role !== "ADMIN") {
      return "Solicitação não encontrada neste núcleo.";
    }
  }

  const opcoes = [new Date(opcao1), new Date(opcao2), new Date(opcao3)];
  const jaMarcados = await prisma.solicitacaoAgendamento.findMany({
    where: {
      nucleoId: solicitacao.nucleoId,
      tipo: solicitacao.tipo,
      status: "CONFIRMADO",
      escolhaData: { in: opcoes },
    },
    select: { escolhaData: true },
  });
  if (jaMarcados.length > 0) {
    return "Um dos horários sugeridos já está ocupado por outro agendamento confirmado. Escolha outro horário.";
  }

  await prisma.solicitacaoAgendamento.update({
    where: { id: solicitacaoId },
    data: {
      status: "AGUARDANDO_ESCOLHA",
      opcao1: opcoes[0],
      opcao2: opcoes[1],
      opcao3: opcoes[2],
      respondidoEm: new Date(),
      respondidoPorId: session.user.id,
    },
  });

  revalidatePath("/gestao/monitorias");
  revalidatePath("/gestao");
  revalidatePath("/aluno/monitorias");
  revalidatePath("/aluno/apoio");
  return "Horários enviados ao estudante!";
}

export async function escolherHorarioSolicitacao(
  solicitacaoId: string,
  escolha: 1 | 2 | 3
): Promise<string | undefined> {
  const { estudante } = await requireEstudante();

  const solicitacao = await prisma.solicitacaoAgendamento.findUnique({ where: { id: solicitacaoId } });
  if (!solicitacao || solicitacao.estudanteId !== estudante.id) return "Solicitação não encontrada.";
  if (solicitacao.status !== "AGUARDANDO_ESCOLHA") return "Essa solicitação não está mais aguardando escolha.";

  const escolhaData = escolha === 1 ? solicitacao.opcao1 : escolha === 2 ? solicitacao.opcao2 : solicitacao.opcao3;
  if (!escolhaData) return "Horário inválido.";

  const conflito = await prisma.solicitacaoAgendamento.findFirst({
    where: {
      nucleoId: solicitacao.nucleoId,
      tipo: solicitacao.tipo,
      status: "CONFIRMADO",
      escolhaData,
      id: { not: solicitacao.id },
    },
  });
  if (conflito) {
    return "Esse horário já foi confirmado por outra pessoa nesse mesmo link. Escolha outra opção ou peça novos horários.";
  }

  await prisma.solicitacaoAgendamento.update({
    where: { id: solicitacaoId },
    data: { status: "CONFIRMADO", escolhaData, confirmadoEm: new Date() },
  });

  revalidatePath("/aluno/monitorias");
  revalidatePath("/aluno/apoio");
  revalidatePath("/gestao/monitorias");
  revalidatePath("/gestao");
  return undefined;
}

export async function atualizarLinksAgendamento(
  _prevState: string | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user || !["COORDENACAO", "ADMIN"].includes(session.user.role) || !session.user.nucleoId) {
    return "Não autorizado.";
  }

  const linkMonitoriaProfessor = formData.get("linkMonitoriaProfessor") as string;
  const linkApoioPsicossocial = formData.get("linkApoioPsicossocial") as string;

  await prisma.nucleo.update({
    where: { id: session.user.nucleoId },
    data: {
      linkMonitoriaProfessor: linkMonitoriaProfessor || null,
      linkApoioPsicossocial: linkApoioPsicossocial || null,
    },
  });

  revalidatePath("/gestao/perfil");
  return "Links atualizados!";
}
