"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { salvarArquivo, ArquivoInvalidoError } from "@/lib/upload";
import { parseCsv, parseDataBr } from "@/lib/csv";
import {
  classificarSituacaoEscolar,
  classificarProvas,
  classificarRendaFamiliar,
  classificarSimNao,
  classificarSexoGenero,
  classificarRacaCor,
} from "@/lib/estudante-opcoes";

const GESTAO_ROLES = ["PROFESSOR", "COORDENACAO", "ADMIN"];
const COORDENACAO_ROLES = ["COORDENACAO", "ADMIN"];

async function requireGestao() {
  const session = await auth();
  if (!session?.user || !GESTAO_ROLES.includes(session.user.role)) {
    throw new Error("Não autorizado.");
  }
  return session.user;
}

async function requireCoordenacao() {
  const session = await auth();
  if (!session?.user || !COORDENACAO_ROLES.includes(session.user.role)) {
    throw new Error("Não autorizado.");
  }
  return session.user;
}

const ACESSO_ESTUDANTE_ROLES = ["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

async function requireAcessoEstudante() {
  const session = await auth();
  if (!session?.user || !ACESSO_ESTUDANTE_ROLES.includes(session.user.role)) {
    throw new Error("Não autorizado.");
  }
  return session.user;
}

export async function atualizarEmailEstudante(
  _prevState: string | undefined,
  formData: FormData
) {
  const user = await requireAcessoEstudante();

  const estudanteId = formData.get("estudanteId") as string;
  const email = formData.get("email") as string;

  if (!email) return "Preencha o e-mail.";

  const estudante = await prisma.estudante.findUnique({
    where: { id: estudanteId },
    include: { user: true },
  });
  if (!estudante || (user.role !== "ADMIN" && estudante.user.nucleoId !== user.nucleoId)) {
    return "Estudante não encontrado neste núcleo.";
  }

  if (email !== estudante.user.email) {
    const emailExistente = await prisma.user.findUnique({ where: { email } });
    if (emailExistente) return "Já existe um usuário com esse e-mail.";
  }

  await prisma.user.update({ where: { id: estudante.userId }, data: { email } });

  revalidatePath("/gestao/estudantes");
  return "E-mail atualizado!";
}

export async function atualizarEstudante(
  _prevState: string | undefined,
  formData: FormData
) {
  const gestor = await requireAcessoEstudante();

  const estudanteId = formData.get("estudanteId") as string;
  const nome = formData.get("nome") as string;
  const status = formData.get("status") as string;
  const telefone = formData.get("telefone") as string;
  const dataNascimento = formData.get("dataNascimento") as string;
  const sexoGenero = formData.get("sexoGenero") as string;
  const racaCor = formData.get("racaCor") as string;
  const bairro = formData.get("bairro") as string;
  const municipio = formData.get("municipio") as string;
  const situacaoEscolar = formData.get("situacaoEscolar") as string;
  const escola = formData.get("escola") as string;
  const escolaPublica = formData.get("escolaPublica") as string;
  const cotista = formData.get("cotista") as string;
  const jaFezEnem = formData.get("jaFezEnem") as string;
  const cursoDesejado = formData.get("cursoDesejado") as string;
  const universidadeDesejada = formData.get("universidadeDesejada") as string;
  const provasQueVaiFazer = formData.get("provasQueVaiFazer") as string;
  const rendaFamiliar = formData.get("rendaFamiliar") as string;
  const pessoasEmCasa = formData.get("pessoasEmCasa") as string;
  const trabalha = formData.get("trabalha") as string;
  const motivacao = formData.get("motivacao") as string;
  const ultimoContatoObs = formData.get("ultimoContatoObs") as string;
  const observacoesInternas = formData.get("observacoesInternas") as string;
  const bolsista = formData.get("bolsista") as string;

  if (!estudanteId) return "Estudante não encontrado.";
  if (!nome) return "O nome não pode ficar em branco.";

  const boolOrNull = (v: string) => (v === "" ? undefined : v === "sim");

  const estudante = await prisma.estudante.findUnique({
    where: { id: estudanteId },
    include: { user: true },
  });
  if (!estudante) return "Estudante não encontrado.";
  if (gestor.role !== "ADMIN" && estudante.user.nucleoId !== gestor.nucleoId) {
    return "Estudante não encontrado neste núcleo.";
  }

  await prisma.user.update({
    where: { id: estudante.userId },
    data: { nome, telefone: telefone || null },
  });

  await prisma.estudante.update({
    where: { id: estudanteId },
    data: {
      status: status as
        | "EM_AVALIACAO"
        | "PRESENTE"
        | "FALTANTE"
        | "DESISTENTE",
      dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
      sexoGenero,
      racaCor,
      bairro,
      municipio,
      situacaoEscolar,
      escola,
      escolaPublica: boolOrNull(escolaPublica),
      cotista: boolOrNull(cotista),
      jaFezEnem: boolOrNull(jaFezEnem),
      cursoDesejado,
      universidadeDesejada,
      provasQueVaiFazer,
      rendaFamiliar,
      pessoasEmCasa: pessoasEmCasa ? Number(pessoasEmCasa) : undefined,
      trabalha: boolOrNull(trabalha),
      motivacao,
      ultimoContatoObs,
      ultimoContato: ultimoContatoObs ? new Date() : undefined,
      observacoesInternas,
      bolsista: boolOrNull(bolsista),
    },
  });

  revalidatePath("/gestao/estudantes");
  return "Dados atualizados!";
}

export async function atualizarStatusEstudante(
  _prevState: string | undefined,
  formData: FormData
) {
  const gestor = await requireAcessoEstudante();

  const estudanteId = formData.get("estudanteId") as string;
  const status = formData.get("status") as string;
  const ultimoContatoObs = formData.get("ultimoContatoObs") as string;

  if (!estudanteId) return "Estudante não encontrado.";

  const estudante = await prisma.estudante.findUnique({
    where: { id: estudanteId },
    include: { user: true },
  });
  if (!estudante) return "Estudante não encontrado.";
  if (gestor.role !== "ADMIN" && estudante.user.nucleoId !== gestor.nucleoId) {
    return "Estudante não encontrado neste núcleo.";
  }

  await prisma.estudante.update({
    where: { id: estudanteId },
    data: {
      status: status as "EM_AVALIACAO" | "PRESENTE" | "FALTANTE" | "DESISTENTE",
      ...(ultimoContatoObs
        ? { ultimoContatoObs, ultimoContato: new Date() }
        : {}),
    },
  });

  revalidatePath("/gestao/estudantes");
  revalidatePath(`/gestao/estudantes/${estudanteId}`);
  return "Status atualizado!";
}

export async function aprovarMatricula(matriculaId: string) {
  const user = await requireCoordenacao();

  const matricula = await prisma.matricula.findUnique({
    where: { id: matriculaId },
    include: { turma: true },
  });
  if (!matricula || matricula.turma.nucleoId !== user.nucleoId) {
    throw new Error("Matrícula não encontrada neste núcleo.");
  }

  await prisma.matricula.update({
    where: { id: matriculaId },
    data: { status: "APROVADA" },
  });

  revalidatePath("/gestao");
  revalidatePath("/gestao/inscricoes");
  revalidatePath("/gestao/estudantes");
  revalidatePath("/gestao/turmas");
}

export async function recusarMatricula(matriculaId: string) {
  const user = await requireCoordenacao();

  const matricula = await prisma.matricula.findUnique({
    where: { id: matriculaId },
    include: { turma: true },
  });
  if (!matricula || matricula.turma.nucleoId !== user.nucleoId) {
    throw new Error("Matrícula não encontrada neste núcleo.");
  }

  await prisma.matricula.update({
    where: { id: matriculaId },
    data: { status: "RECUSADA" },
  });

  revalidatePath("/gestao");
  revalidatePath("/gestao/inscricoes");
}

export async function criarAviso(_prevState: string | undefined, formData: FormData) {
  const user = await requireGestao();

  const titulo = formData.get("titulo") as string;
  const corpo = formData.get("corpo") as string;
  const turmaId = formData.get("turmaId") as string;

  if (!titulo || !corpo) return "Preencha título e mensagem.";

  const corpoFinal = user.role === "PROFESSOR" ? `${corpo}\n\n— Prof. ${user.name}` : corpo;

  await prisma.aviso.create({
    data: {
      titulo,
      corpo: corpoFinal,
      nucleoId: user.nucleoId,
      turmaId: turmaId || null,
    },
  });

  revalidatePath("/gestao");
  revalidatePath("/gestao/avisos");
  return undefined;
}

export async function criarMaterial(_prevState: string | undefined, formData: FormData) {
  const user = await requireGestao();

  const titulo = formData.get("titulo") as string;
  const descricao = formData.get("descricao") as string;
  const arquivo = formData.get("arquivo") as File | null;
  const linkVideo = formData.get("linkVideo") as string;
  const publico = formData.get("publico") === "on";
  const disciplinaId = formData.get("disciplinaId") as string;
  const aula = formData.get("aula") as string;
  const tipo = (formData.get("tipo") as string) || "OUTRO";

  if (!titulo || ((!arquivo || arquivo.size === 0) && !linkVideo)) {
    return "Preencha o título e selecione um arquivo ou cole o link do vídeo.";
  }

  let arquivoUrl: string | null = null;
  if (arquivo && arquivo.size > 0) {
    try {
      arquivoUrl = await salvarArquivo(arquivo, "materiais", "documento");
    } catch (error) {
      if (error instanceof ArquivoInvalidoError) return error.message;
      throw error;
    }
  }
  arquivoUrl = arquivoUrl ?? linkVideo;
  if (!arquivoUrl) return "Não foi possível enviar o material.";

  await prisma.material.create({
    data: {
      titulo,
      descricao,
      arquivoUrl,
      publico,
      tipo,
      aula: aula || null,
      disciplinaId: disciplinaId || null,
      nucleoId: user.nucleoId,
    },
  });

  revalidatePath("/gestao/materiais");
  revalidatePath("/");
  return undefined;
}

export async function apagarMaterial(materialId: string) {
  const user = await requireGestao();
  const material = await prisma.material.findUnique({ where: { id: materialId } });
  if (!material || material.nucleoId !== user.nucleoId) {
    throw new Error("Material não encontrado neste núcleo.");
  }
  await prisma.material.delete({ where: { id: materialId } });
  revalidatePath("/gestao/materiais");
  revalidatePath("/");
}

export async function criarEvento(_prevState: string | undefined, formData: FormData) {
  const user = await requireGestao();

  const titulo = formData.get("titulo") as string;
  const data = formData.get("data") as string;
  const local = formData.get("local") as string;
  const publico = formData.get("publico") === "on";

  if (!titulo || !data) return "Preencha título e data.";

  await prisma.evento.create({
    data: { titulo, data: new Date(data), local, publico, nucleoId: user.nucleoId },
  });

  revalidatePath("/gestao/eventos");
  revalidatePath("/");
  return undefined;
}

export async function apagarEvento(eventoId: string) {
  const user = await requireGestao();
  const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
  if (!evento || evento.nucleoId !== user.nucleoId) {
    throw new Error("Evento não encontrado neste núcleo.");
  }
  await prisma.evento.delete({ where: { id: eventoId } });
  revalidatePath("/gestao/eventos");
  revalidatePath("/");
}

export async function criarProva(_prevState: string | undefined, formData: FormData) {
  const user = await requireGestao();

  const nome = formData.get("nome") as string;
  const data = formData.get("data") as string;

  if (!nome || !data) return "Preencha nome e data da prova.";

  await prisma.prova.create({
    data: { nome, data: new Date(data), nucleoId: user.nucleoId },
  });

  revalidatePath("/gestao");
  revalidatePath("/aluno");
  return undefined;
}

export async function apagarProva(provaId: string) {
  const user = await requireGestao();
  const prova = await prisma.prova.findUnique({ where: { id: provaId } });
  if (!prova || prova.nucleoId !== user.nucleoId) {
    throw new Error("Prova não encontrada neste núcleo.");
  }
  await prisma.prova.delete({ where: { id: provaId } });
  revalidatePath("/gestao");
  revalidatePath("/aluno");
}

export async function criarMonitoria(_prevState: string | undefined, formData: FormData) {
  const user = await requireGestao();

  const escopo = formData.get("escopo") as string;
  const turmaId = formData.get("turmaId") as string;
  const diaSemana = formData.get("diaSemana") as string;
  const horaInicio = formData.get("horaInicio") as string;
  const horaFim = formData.get("horaFim") as string;
  const materiais = formData.get("materiais") as string;
  const link = formData.get("link") as string;
  const disciplinaId = formData.get("disciplinaId") as string;

  if (!diaSemana || !horaInicio || !horaFim) {
    return "Preencha dia e horário.";
  }
  if (escopo === "turma" && !turmaId) return "Escolha a turma.";

  await prisma.monitoria.create({
    data: {
      nucleoId: user.nucleoId!,
      global: escopo === "todos",
      turmaId: escopo === "turma" ? turmaId : null,
      professorId: user.role === "PROFESSOR" ? user.id : null,
      disciplinaId: disciplinaId || null,
      diaSemana,
      horaInicio,
      horaFim,
      materiais,
      link,
    },
  });

  revalidatePath("/gestao/monitorias");
  revalidatePath("/gestao");
  revalidatePath("/aluno/monitorias");
  return undefined;
}

export async function apagarMonitoria(monitoriaId: string) {
  const user = await requireGestao();
  const monitoria = await prisma.monitoria.findUnique({ where: { id: monitoriaId } });
  if (!monitoria || monitoria.nucleoId !== user.nucleoId) {
    throw new Error("Monitoria não encontrada neste núcleo.");
  }
  if (user.role === "PROFESSOR" && monitoria.professorId !== user.id) {
    throw new Error("Você só pode excluir monitorias vinculadas a você.");
  }
  await prisma.monitoria.delete({ where: { id: monitoriaId } });
  revalidatePath("/gestao/monitorias");
  revalidatePath("/gestao");
  revalidatePath("/aluno/monitorias");
}

export async function editarMonitoria(_prevState: string | undefined, formData: FormData) {
  const user = await requireGestao();

  const monitoriaId = formData.get("monitoriaId") as string;
  const diaSemana = formData.get("diaSemana") as string;
  const horaInicio = formData.get("horaInicio") as string;
  const horaFim = formData.get("horaFim") as string;
  const materiais = formData.get("materiais") as string;
  const link = formData.get("link") as string;
  const disciplinaId = formData.get("disciplinaId") as string;

  const monitoria = await prisma.monitoria.findUnique({ where: { id: monitoriaId } });
  if (!monitoria || monitoria.nucleoId !== user.nucleoId) return "Monitoria não encontrada neste núcleo.";
  if (user.role === "PROFESSOR" && monitoria.professorId !== user.id) {
    return "Você só pode editar monitorias vinculadas a você.";
  }
  if (!diaSemana || !horaInicio || !horaFim) return "Preencha dia e horário.";

  await prisma.monitoria.update({
    where: { id: monitoriaId },
    data: { diaSemana, horaInicio, horaFim, materiais, link, disciplinaId: disciplinaId || null },
  });

  revalidatePath("/gestao/monitorias");
  revalidatePath("/gestao");
  revalidatePath("/aluno/monitorias");
  return "Monitoria remarcada!";
}

export async function criarDisciplinaGrade(
  _prevState: string | undefined,
  formData: FormData
) {
  await requireCoordenacao();

  const turmaId = formData.get("turmaId") as string;
  const disciplinaNome = formData.get("disciplinaNome") as string;
  const professorId = formData.get("professorId") as string;
  const diaSemana = formData.get("diaSemana") as string;
  const horaInicio = formData.get("horaInicio") as string;
  const horaFim = formData.get("horaFim") as string;

  if (!turmaId || !disciplinaNome || !professorId || !diaSemana || !horaInicio || !horaFim) {
    return "Preencha todos os campos da grade.";
  }

  const disciplina = await prisma.disciplina.upsert({
    where: { nome: disciplinaNome },
    update: {},
    create: { nome: disciplinaNome },
  });

  await prisma.turmaDisciplina.create({
    data: {
      turmaId,
      disciplinaId: disciplina.id,
      professorId,
      diaSemana,
      horaInicio,
      horaFim,
    },
  });

  revalidatePath("/gestao/turmas");
  revalidatePath("/aluno");
  return undefined;
}

export async function apagarDisciplinaGrade(turmaDisciplinaId: string) {
  await requireCoordenacao();
  await prisma.turmaDisciplina.delete({ where: { id: turmaDisciplinaId } });
  revalidatePath("/gestao/turmas");
  revalidatePath("/aluno");
}

export async function criarDepoimento(_prevState: string | undefined, formData: FormData) {
  const user = await requireCoordenacao();

  const nome = formData.get("nome") as string;
  const curso = formData.get("curso") as string;
  const universidade = formData.get("universidade") as string;
  const foto = formData.get("foto") as File | null;
  const quote = formData.get("quote") as string;

  if (!nome || !quote) return "Preencha nome e depoimento.";

  let fotoUrl: string | null;
  try {
    fotoUrl = await salvarArquivo(foto, "depoimentos");
  } catch (error) {
    if (error instanceof ArquivoInvalidoError) return error.message;
    throw error;
  }

  await prisma.depoimento.create({
    data: { nome, curso, universidade, fotoUrl, quote, nucleoId: user.nucleoId },
  });

  revalidatePath("/gestao/historias");
  revalidatePath("/");
  return undefined;
}

export async function apagarDepoimento(depoimentoId: string) {
  const user = await requireCoordenacao();
  const depoimento = await prisma.depoimento.findUnique({ where: { id: depoimentoId } });
  if (!depoimento || depoimento.nucleoId !== user.nucleoId) {
    throw new Error("Depoimento não encontrado neste núcleo.");
  }
  await prisma.depoimento.delete({ where: { id: depoimentoId } });
  revalidatePath("/gestao/historias");
  revalidatePath("/");
}

export async function criarGaleriaEvento(_prevState: string | undefined, formData: FormData) {
  const user = await requireGestao();

  const legenda = formData.get("legenda") as string;
  const dataStr = formData.get("data") as string;
  const imagem = formData.get("imagem") as File | null;
  let instagramUrl = (formData.get("instagramUrl") as string).trim();

  if ((!imagem || imagem.size === 0) && !instagramUrl) {
    return "Envie uma foto ou cole o link do post do Instagram.";
  }

  if (instagramUrl && !/^https?:\/\//i.test(instagramUrl)) {
    instagramUrl = `https://${instagramUrl}`;
  }

  let imagemUrl: string | null = null;
  if (imagem && imagem.size > 0) {
    try {
      imagemUrl = await salvarArquivo(imagem, "galeria-eventos");
    } catch (error) {
      if (error instanceof ArquivoInvalidoError) return error.message;
      throw error;
    }
  }

  await prisma.galeriaEvento.create({
    data: {
      imagemUrl,
      instagramUrl: instagramUrl || null,
      legenda: legenda || null,
      data: dataStr ? new Date(dataStr) : new Date(),
      nucleoId: user.nucleoId,
    },
  });

  revalidatePath("/gestao/eventos");
  revalidatePath("/eventos");
  return undefined;
}

export async function apagarGaleriaEvento(itemId: string) {
  const user = await requireGestao();
  const item = await prisma.galeriaEvento.findUnique({ where: { id: itemId } });
  if (!item || item.nucleoId !== user.nucleoId) {
    throw new Error("Foto não encontrada neste núcleo.");
  }
  await prisma.galeriaEvento.delete({ where: { id: itemId } });
  revalidatePath("/gestao/eventos");
  revalidatePath("/eventos");
}

export async function criarProfessor(_prevState: string | undefined, formData: FormData) {
  const user = await requireCoordenacao();

  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const telefone = formData.get("telefone") as string;
  const materia = formData.get("materia") as string;
  const foto = formData.get("foto") as File | null;

  if (!nome || !email || !senha) return "Preencha nome, e-mail e senha.";
  if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) return "Já existe um usuário com este e-mail.";

  let fotoUrl: string | null;
  try {
    fotoUrl = await salvarArquivo(foto, "professores");
  } catch (error) {
    if (error instanceof ArquivoInvalidoError) return error.message;
    throw error;
  }
  const passwordHash = await bcrypt.hash(senha, 10);

  await prisma.user.create({
    data: {
      nome,
      email,
      passwordHash,
      role: "PROFESSOR",
      nucleoId: user.nucleoId,
      telefone: telefone || null,
      materia: materia || null,
      fotoUrl,
    },
  });

  revalidatePath("/gestao/professores");
  return undefined;
}

export async function registrarFrequencia(
  estudanteId: string,
  turmaId: string,
  presente: boolean,
  dataISO?: string
) {
  await requireGestao();

  const data = dataISO ? new Date(`${dataISO}T00:00:00`) : new Date();
  data.setHours(0, 0, 0, 0);

  await prisma.frequencia.upsert({
    where: {
      estudanteId_turmaId_data: { estudanteId, turmaId, data },
    },
    update: { presente },
    create: { estudanteId, turmaId, data, presente },
  });

  revalidatePath("/gestao");
}

export async function criarTurma(_prevState: string | undefined, formData: FormData) {
  const user = await requireCoordenacao();

  const nome = formData.get("nome") as string;
  const periodo = formData.get("periodo") as string;
  const capacidade = formData.get("capacidade") as string;
  const whatsappLink = formData.get("whatsappLink") as string;

  if (!nome || !periodo || !capacidade) return "Preencha nome, período e capacidade.";

  const nucleo = await prisma.nucleo.findUnique({ where: { id: user.nucleoId! }, select: { slug: true } });

  await prisma.turma.create({
    data: {
      nome,
      periodo,
      capacidade: Number(capacidade),
      whatsappLink: whatsappLink || null,
      nucleoId: user.nucleoId!,
    },
  });

  revalidatePath("/gestao/turmas");
  revalidatePath("/");
  revalidatePath("/nucleos");
  if (nucleo) {
    revalidatePath(`/nucleos/${nucleo.slug}`);
    revalidatePath(`/nucleos/${nucleo.slug}/inscricao`);
  }
  return undefined;
}

export async function atualizarTurmaWhatsapp(
  _prevState: string | undefined,
  formData: FormData
) {
  const user = await requireCoordenacao();

  const turmaId = formData.get("turmaId") as string;
  const whatsappLink = formData.get("whatsappLink") as string;

  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
  if (!turma || turma.nucleoId !== user.nucleoId) return "Turma não encontrada.";

  await prisma.turma.update({
    where: { id: turmaId },
    data: { whatsappLink: whatsappLink || null },
  });

  revalidatePath("/gestao/turmas");
  revalidatePath("/aluno");
  return "Link salvo!";
}

export async function editarTurma(_prevState: string | undefined, formData: FormData) {
  const user = await requireCoordenacao();

  const turmaId = formData.get("turmaId") as string;
  const nome = formData.get("nome") as string;
  const periodo = formData.get("periodo") as string;
  const capacidade = formData.get("capacidade") as string;

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: { nucleo: { select: { slug: true } } },
  });
  if (!turma || turma.nucleoId !== user.nucleoId) return "Turma não encontrada.";
  if (!nome || !periodo || !capacidade) return "Preencha nome, período e capacidade.";

  await prisma.turma.update({
    where: { id: turmaId },
    data: { nome, periodo, capacidade: Number(capacidade) },
  });

  revalidatePath("/gestao/turmas");
  revalidatePath("/");
  revalidatePath("/nucleos");
  revalidatePath(`/nucleos/${turma.nucleo.slug}`);
  revalidatePath(`/nucleos/${turma.nucleo.slug}/inscricao`);
  return "Turma atualizada!";
}

export async function alternarTurmaAtiva(turmaId: string) {
  const user = await requireCoordenacao();

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: { nucleo: { select: { slug: true } } },
  });
  if (!turma || turma.nucleoId !== user.nucleoId) throw new Error("Turma não encontrada.");

  await prisma.turma.update({
    where: { id: turmaId },
    data: { ativo: !turma.ativo },
  });

  revalidatePath("/gestao/turmas");
  revalidatePath("/");
  revalidatePath("/nucleos");
  revalidatePath(`/nucleos/${turma.nucleo.slug}`);
  revalidatePath(`/nucleos/${turma.nucleo.slug}/inscricao`);
}

export async function atualizarProfessor(_prevState: string | undefined, formData: FormData) {
  const user = await requireCoordenacao();

  const professorId = formData.get("professorId") as string;
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const materia = formData.get("materia") as string;
  const foto = formData.get("foto") as File | null;

  const professor = await prisma.user.findUnique({ where: { id: professorId } });
  if (!professor || professor.nucleoId !== user.nucleoId) return "Professor não encontrado neste núcleo.";

  if (!nome) return "Preencha o nome.";
  if (!email) return "Preencha o e-mail.";

  if (email !== professor.email) {
    const emailExistente = await prisma.user.findUnique({ where: { email } });
    if (emailExistente) return "Já existe um usuário com esse e-mail.";
  }

  let fotoUrl: string | null;
  try {
    fotoUrl = await salvarArquivo(foto, "professores");
  } catch (error) {
    if (error instanceof ArquivoInvalidoError) return error.message;
    throw error;
  }

  await prisma.user.update({
    where: { id: professorId },
    data: {
      nome,
      email,
      telefone: telefone || null,
      materia: materia || null,
      ...(fotoUrl ? { fotoUrl } : {}),
    },
  });

  revalidatePath("/gestao/professores");
  revalidatePath("/gestao/historias");
  revalidatePath(`/gestao/professores/${professorId}`);
  return "Dados atualizados!";
}

export async function removerFotoProfessor(professorId: string) {
  const user = await requireCoordenacao();

  const professor = await prisma.user.findUnique({ where: { id: professorId } });
  if (!professor || professor.nucleoId !== user.nucleoId) throw new Error("Professor não encontrado neste núcleo.");

  await prisma.user.update({
    where: { id: professorId },
    data: { fotoUrl: null },
  });

  revalidatePath("/gestao/professores");
  revalidatePath("/gestao/historias");
  revalidatePath(`/gestao/professores/${professorId}`);
}

export async function apagarProfessor(professorId: string) {
  const user = await requireCoordenacao();

  const professor = await prisma.user.findUnique({ where: { id: professorId } });
  if (!professor || professor.nucleoId !== user.nucleoId) {
    throw new Error("Professor não encontrado neste núcleo.");
  }

  await prisma.turmaDisciplina.deleteMany({ where: { professorId } });
  await prisma.user.delete({ where: { id: professorId } });

  revalidatePath("/gestao/professores");
  revalidatePath("/gestao/turmas");
}

export async function atualizarFotoNucleo(_prevState: string | undefined, formData: FormData) {
  const user = await requireCoordenacao();
  if (!user.nucleoId) return "Núcleo não encontrado.";

  const foto = formData.get("foto") as File | null;
  if (!foto || foto.size === 0) return "Selecione uma foto.";

  let fotoUrl: string | null;
  try {
    fotoUrl = await salvarArquivo(foto, "nucleos");
  } catch (error) {
    if (error instanceof ArquivoInvalidoError) return error.message;
    throw error;
  }

  await prisma.nucleo.update({
    where: { id: user.nucleoId },
    data: { fotoUrl },
  });

  revalidatePath("/gestao/perfil");
  revalidatePath("/");
  return "Foto de capa atualizada!";
}

export async function atualizarInstagramNucleo(
  _prevState: string | undefined,
  formData: FormData
) {
  const user = await requireCoordenacao();
  if (!user.nucleoId) return "Núcleo não encontrado.";

  const instagram = formData.get("instagram") as string;

  await prisma.nucleo.update({
    where: { id: user.nucleoId },
    data: { instagram: instagram || null },
  });

  revalidatePath("/gestao/perfil");
  revalidatePath("/nucleos");
  return "Instagram atualizado!";
}

export async function atualizarGoogleSheetsNucleo(
  _prevState: string | undefined,
  formData: FormData
) {
  const user = await requireCoordenacao();
  if (!user.nucleoId) return "Núcleo não encontrado.";

  const googleSheetsUrl = formData.get("googleSheetsUrl") as string;

  await prisma.nucleo.update({
    where: { id: user.nucleoId },
    data: { googleSheetsUrl: googleSheetsUrl || null },
  });

  revalidatePath("/gestao/perfil");
  revalidatePath("/gestao/estudantes");
  return "Link da planilha atualizado!";
}

function corrigirAutomaticamente(gabarito: string, respostas: string) {
  const certas = gabarito.split(",").map((s) => s.trim().toUpperCase());
  const dadas = respostas.split(",").map((s) => s.trim().toUpperCase());
  let acertos = 0;
  certas.forEach((c, i) => {
    if (c && dadas[i] === c) acertos++;
  });
  return Math.round((acertos / certas.length) * 1000) / 100;
}

export async function criarSimulado(_prevState: string | undefined, formData: FormData) {
  const user = await requireCoordenacao();

  const nome = formData.get("nome") as string;
  const data = formData.get("data") as string;
  const gabarito = formData.get("gabarito") as string;

  if (!nome || !data || !gabarito) return "Preencha nome, data e gabarito.";

  await prisma.simulado.create({
    data: { nome, data: new Date(data), gabarito: gabarito.trim(), nucleoId: user.nucleoId! },
  });

  revalidatePath("/gestao/simulados");
  return undefined;
}

export async function apagarSimulado(simuladoId: string) {
  await requireCoordenacao();
  await prisma.simuladoResposta.deleteMany({ where: { simuladoId } });
  await prisma.simulado.delete({ where: { id: simuladoId } });
  revalidatePath("/gestao/simulados");
}

export async function lancarResposta(_prevState: string | undefined, formData: FormData) {
  await requireGestao();

  const simuladoId = formData.get("simuladoId") as string;
  const estudanteId = formData.get("estudanteId") as string;
  const respostas = formData.get("respostas") as string;

  if (!respostas) return "Digite as respostas marcadas.";

  const simulado = await prisma.simulado.findUnique({ where: { id: simuladoId } });
  if (!simulado) return "Simulado não encontrado.";

  const nota = corrigirAutomaticamente(simulado.gabarito, respostas);

  await prisma.simuladoResposta.upsert({
    where: { simuladoId_estudanteId: { simuladoId, estudanteId } },
    update: { respostas: respostas.trim(), nota, corrigidoManualmente: false },
    create: { simuladoId, estudanteId, respostas: respostas.trim(), nota },
  });

  revalidatePath("/gestao/simulados");
  return undefined;
}

export async function corrigirRespostaManual(
  _prevState: string | undefined,
  formData: FormData
) {
  await requireGestao();

  const respostaId = formData.get("respostaId") as string;
  const nota = formData.get("nota") as string;

  if (nota === "") return "Informe a nota.";

  await prisma.simuladoResposta.update({
    where: { id: respostaId },
    data: { nota: Number(nota), corrigidoManualmente: true },
  });

  revalidatePath("/gestao/simulados");
  return undefined;
}

export async function apagarAviso(avisoId: string) {
  const user = await requireGestao();

  const aviso = await prisma.aviso.findUnique({ where: { id: avisoId } });
  if (!aviso || aviso.nucleoId !== user.nucleoId) {
    throw new Error("Aviso não encontrado neste núcleo.");
  }

  await prisma.aviso.delete({ where: { id: avisoId } });

  revalidatePath("/gestao");
  revalidatePath("/gestao/avisos");
}

const PAPEIS_NUCLEO_EDITAVEIS = ["PROFESSOR", "APOIO_PSICOSSOCIAL"];

export async function criarUsuarioNucleo(_prevState: string | undefined, formData: FormData) {
  const gestor = await requireCoordenacao();

  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const role = formData.get("role") as string;

  if (!nome || !email || !senha) return "Preencha nome, e-mail e senha.";
  if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
  if (!PAPEIS_NUCLEO_EDITAVEIS.includes(role)) return "Papel inválido.";

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) return "Já existe um usuário com esse e-mail.";

  const passwordHash = await bcrypt.hash(senha, 10);

  await prisma.user.create({
    data: {
      nome,
      email,
      passwordHash,
      role: role as "PROFESSOR" | "APOIO_PSICOSSOCIAL",
      nucleoId: gestor.nucleoId!,
    },
  });

  revalidatePath("/gestao/usuarios");
  return "Usuário criado!";
}

export async function alterarAcessoUsuarioNucleo(
  _prevState: string | undefined,
  formData: FormData
) {
  const gestor = await requireCoordenacao();

  const userId = formData.get("userId") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!email) return "Preencha o e-mail.";
  if (!PAPEIS_NUCLEO_EDITAVEIS.includes(role)) return "Papel inválido.";

  const usuario = await prisma.user.findUnique({ where: { id: userId } });
  if (!usuario || usuario.nucleoId !== gestor.nucleoId) return "Usuário não encontrado neste núcleo.";
  if (!PAPEIS_NUCLEO_EDITAVEIS.includes(usuario.role)) {
    return "Esse usuário não pode ser editado por aqui.";
  }

  if (email !== usuario.email) {
    const emailExistente = await prisma.user.findUnique({ where: { email } });
    if (emailExistente) return "Já existe um usuário com esse e-mail.";
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email, role: role as "PROFESSOR" | "APOIO_PSICOSSOCIAL" },
  });

  revalidatePath("/gestao/usuarios");
  return "Acesso atualizado!";
}

export async function redefinirSenhaUsuarioNucleo(
  _prevState: string | undefined,
  formData: FormData
) {
  const gestor = await requireCoordenacao();

  const userId = formData.get("userId") as string;
  const novaSenha = formData.get("novaSenha") as string;

  if (!novaSenha || novaSenha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";

  const usuario = await prisma.user.findUnique({ where: { id: userId } });
  if (!usuario || usuario.nucleoId !== gestor.nucleoId) return "Usuário não encontrado neste núcleo.";

  const passwordHash = await bcrypt.hash(novaSenha, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/gestao/usuarios");
  return "Senha redefinida!";
}

export async function criarQuestaoBanco(_prevState: string | undefined, formData: FormData) {
  await requireGestao();

  const prova = formData.get("prova") as string;
  const materia = formData.get("materia") as string;
  const anoStr = formData.get("ano") as string;
  const enunciado = formData.get("enunciado") as string;
  const opcaoA = formData.get("opcaoA") as string;
  const opcaoB = formData.get("opcaoB") as string;
  const opcaoC = formData.get("opcaoC") as string;
  const opcaoD = formData.get("opcaoD") as string;
  const opcaoE = formData.get("opcaoE") as string;
  const respostaCorreta = formData.get("respostaCorreta") as string;
  const subtema = formData.get("subtema") as string;

  if (!prova || !materia || !enunciado || !opcaoA || !opcaoB || !opcaoC || !opcaoD || !respostaCorreta) {
    return "Preencha prova, matéria, enunciado, as alternativas e a resposta correta.";
  }

  await prisma.questaoBanco.create({
    data: {
      prova,
      materia,
      ano: anoStr ? Number(anoStr) : null,
      enunciado,
      opcaoA,
      opcaoB,
      opcaoC,
      opcaoD,
      opcaoE: opcaoE || null,
      respostaCorreta,
      subtema: subtema || null,
    },
  });

  revalidatePath("/admin/questoes");
  revalidatePath("/gestao/questoes");
  return "Questão adicionada!";
}

export async function apagarQuestaoBanco(questaoId: string) {
  await requireGestao();
  await prisma.questaoBanco.delete({ where: { id: questaoId } });
  revalidatePath("/admin/questoes");
  revalidatePath("/gestao/questoes");
}

export async function importarEstudantesPlanilha(
  _prevState: string | undefined,
  formData: FormData
) {
  const user = await requireCoordenacao();
  if (!user.nucleoId) return "Núcleo não encontrado.";

  const turmaId = formData.get("turmaId") as string;
  if (!turmaId) return "Escolha a turma em que os alunos importados vão entrar.";

  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
  if (!turma || turma.nucleoId !== user.nucleoId) return "Turma não encontrada neste núcleo.";

  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) return "Selecione o arquivo CSV exportado da planilha.";

  const mapeamentoTexto = formData.get("mapeamento") as string;
  if (!mapeamentoTexto) return "Mapeie as colunas da planilha antes de importar.";
  let mapeamento: Record<string, string>;
  try {
    mapeamento = JSON.parse(mapeamentoTexto);
  } catch {
    return "Mapeamento de colunas inválido.";
  }

  const idxDe = (campo: string) => {
    const entrada = Object.entries(mapeamento).find(([, v]) => v === campo);
    return entrada ? Number(entrada[0]) : -1;
  };

  const idxEmail = idxDe("email");
  const idxNome = idxDe("nome");
  const idxTelefone = idxDe("telefone");
  const idxNascimento = idxDe("dataNascimento");
  const idxSituacaoEscolar = idxDe("situacaoEscolar");
  const idxEscola = idxDe("escola");
  const idxEscolaPublica = idxDe("escolaPublica");
  const idxCidade = idxDe("municipio");
  const idxBairro = idxDe("bairro");
  const idxSexo = idxDe("sexoGenero");
  const idxRacaCor = idxDe("racaCor");
  const idxCursoDesejado = idxDe("cursoDesejado");
  const idxProvas = idxDe("provasQueVaiFazer");
  const idxJaFezEnem = idxDe("jaFezEnem");
  const idxRendaFamiliar = idxDe("rendaFamiliar");
  const idxPessoasEmCasa = idxDe("pessoasEmCasa");
  const idxTrabalha = idxDe("trabalha");
  const idxMotivacao = idxDe("motivacao");

  if (idxEmail === -1 || idxNome === -1) {
    return "Mapeie ao menos as colunas de nome e e-mail antes de importar.";
  }

  const csvText = await arquivo.text();
  const linhas = parseCsv(csvText);
  if (linhas.length < 2) return "A planilha parece vazia.";

  const senhaPadrao = await bcrypt.hash("esperancar123", 10);

  let criados = 0;
  let matriculados = 0;
  let ignorados = 0;

  for (const linha of linhas.slice(1)) {
    const email = (linha[idxEmail] ?? "").trim().toLowerCase();
    const nome = (linha[idxNome] ?? "").trim();
    const telefone = idxTelefone !== -1 ? (linha[idxTelefone] ?? "").trim() : "";
    const dataNascimento = idxNascimento !== -1 ? parseDataBr(linha[idxNascimento] ?? "") : null;
    const situacaoEscolar =
      idxSituacaoEscolar !== -1 ? classificarSituacaoEscolar(linha[idxSituacaoEscolar] ?? "") : undefined;
    const escola = idxEscola !== -1 ? (linha[idxEscola] ?? "").trim() : "";
    const escolaPublica = idxEscolaPublica !== -1 ? classificarSimNao(linha[idxEscolaPublica] ?? "") : undefined;
    const municipio = idxCidade !== -1 ? (linha[idxCidade] ?? "").trim() : "";
    const bairro = idxBairro !== -1 ? (linha[idxBairro] ?? "").trim() : "";
    const sexoGenero = idxSexo !== -1 ? classificarSexoGenero(linha[idxSexo] ?? "") ?? "" : "";
    const racaCor = idxRacaCor !== -1 ? classificarRacaCor(linha[idxRacaCor] ?? "") ?? "" : "";
    const cursoDesejado = idxCursoDesejado !== -1 ? (linha[idxCursoDesejado] ?? "").trim() : "";
    const provasQueVaiFazer = idxProvas !== -1 ? classificarProvas(linha[idxProvas] ?? "") : undefined;
    const jaFezEnem = idxJaFezEnem !== -1 ? classificarSimNao(linha[idxJaFezEnem] ?? "") : undefined;
    const rendaFamiliar =
      idxRendaFamiliar !== -1 ? classificarRendaFamiliar(linha[idxRendaFamiliar] ?? "") : undefined;
    const pessoasEmCasaTexto = idxPessoasEmCasa !== -1 ? (linha[idxPessoasEmCasa] ?? "").trim() : "";
    const pessoasEmCasa = pessoasEmCasaTexto ? Number(pessoasEmCasaTexto.replace(/\D/g, "")) : undefined;
    const trabalha = idxTrabalha !== -1 ? classificarSimNao(linha[idxTrabalha] ?? "") : undefined;
    const motivacao = idxMotivacao !== -1 ? (linha[idxMotivacao] ?? "").trim() : "";

    if (!email || !nome) {
      ignorados++;
      continue;
    }

    let usuario = await prisma.user.findUnique({ where: { email } });

    if (!usuario) {
      usuario = await prisma.user.create({
        data: {
          email,
          nome,
          telefone: telefone || null,
          passwordHash: senhaPadrao,
          role: "ESTUDANTE",
          nucleoId: user.nucleoId,
        },
      });
      criados++;
    } else if (usuario.role !== "ESTUDANTE") {
      ignorados++;
      continue;
    }

    const estudanteExistente = await prisma.estudante.findUnique({ where: { userId: usuario.id } });
    // A reimportação deve corrigir dados errados: o valor novo da planilha
    // prevalece quando presente, mantendo o valor atual só se a planilha vier vazia.
    const preencher = <T,>(atual: T | null | undefined, novo: T | undefined) =>
      novo ?? atual ?? undefined;

    let estudante;
    if (estudanteExistente) {
      const dadosAtualizacao = {
          dataNascimento: preencher(estudanteExistente.dataNascimento, dataNascimento),
          situacaoEscolar: preencher(estudanteExistente.situacaoEscolar, situacaoEscolar),
          escola: preencher(estudanteExistente.escola, escola || undefined),
          escolaPublica: preencher(estudanteExistente.escolaPublica, escolaPublica),
          municipio: preencher(estudanteExistente.municipio, municipio || undefined),
          bairro: preencher(estudanteExistente.bairro, bairro || undefined),
          sexoGenero: preencher(estudanteExistente.sexoGenero, sexoGenero || undefined),
          racaCor: preencher(estudanteExistente.racaCor, racaCor || undefined),
          cursoDesejado: preencher(estudanteExistente.cursoDesejado, cursoDesejado || undefined),
          provasQueVaiFazer: preencher(estudanteExistente.provasQueVaiFazer, provasQueVaiFazer),
          jaFezEnem: preencher(estudanteExistente.jaFezEnem, jaFezEnem),
          rendaFamiliar: preencher(estudanteExistente.rendaFamiliar, rendaFamiliar),
          pessoasEmCasa: preencher(estudanteExistente.pessoasEmCasa, pessoasEmCasa),
          trabalha: preencher(estudanteExistente.trabalha, trabalha),
          motivacao: preencher(estudanteExistente.motivacao, motivacao || undefined),
      };
      estudante = await prisma.estudante.update({
        where: { userId: usuario.id },
        data: dadosAtualizacao,
      });
    } else {
      estudante = await prisma.estudante.create({
        data: {
          userId: usuario.id,
          status: "PRESENTE",
          dataNascimento: dataNascimento ?? undefined,
          situacaoEscolar,
          escola: escola || undefined,
          escolaPublica,
          municipio: municipio || undefined,
          bairro: bairro || undefined,
          sexoGenero: sexoGenero || undefined,
          racaCor: racaCor || undefined,
          cursoDesejado: cursoDesejado || undefined,
          provasQueVaiFazer,
          jaFezEnem,
          rendaFamiliar,
          pessoasEmCasa,
          trabalha,
          motivacao: motivacao || undefined,
        },
      });
    }

    const matriculaExistente = await prisma.matricula.findUnique({
      where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId } },
    });

    if (!matriculaExistente) {
      await prisma.matricula.create({
        data: { estudanteId: estudante.id, turmaId, status: "APROVADA" },
      });
      matriculados++;
    }
  }

  revalidatePath("/gestao/estudantes");
  revalidatePath("/gestao/turmas");
  return `Importação concluída: ${criados} aluno(s) novo(s) criado(s), ${matriculados} matrícula(s) adicionada(s), ${ignorados} linha(s) ignorada(s). A senha padrão para quem foi criado agora é "esperancar123" — avise os alunos para trocarem no perfil.`;
}

export async function apagarEstudante(estudanteId: string) {
  const user = await requireCoordenacao();

  const estudante = await prisma.estudante.findUnique({
    where: { id: estudanteId },
    include: { user: true },
  });
  if (!estudante || (user.role !== "ADMIN" && estudante.user.nucleoId !== user.nucleoId)) {
    throw new Error("Estudante não encontrado neste núcleo.");
  }

  await prisma.frequencia.deleteMany({ where: { estudanteId } });
  await prisma.simuladoResposta.deleteMany({ where: { estudanteId } });
  await prisma.redacao.deleteMany({ where: { estudanteId } });
  await prisma.matricula.deleteMany({ where: { estudanteId } });
  await prisma.estudante.delete({ where: { id: estudanteId } });
  await prisma.user.delete({ where: { id: estudante.userId } });

  revalidatePath("/gestao/estudantes");
  revalidatePath("/gestao/turmas");
}

export async function apagarTurma(turmaId: string) {
  const user = await requireCoordenacao();

  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
  if (!turma || turma.nucleoId !== user.nucleoId) {
    throw new Error("Turma não encontrada neste núcleo.");
  }

  await prisma.aviso.updateMany({ where: { turmaId }, data: { turmaId: null } });
  await prisma.monitoria.updateMany({ where: { turmaId }, data: { turmaId: null } });
  await prisma.frequencia.deleteMany({ where: { turmaId } });
  await prisma.matricula.deleteMany({ where: { turmaId } });
  await prisma.turmaDisciplina.deleteMany({ where: { turmaId } });
  await prisma.turma.delete({ where: { id: turmaId } });

  revalidatePath("/gestao/turmas");
  revalidatePath("/gestao/estudantes");
  revalidatePath("/");
  revalidatePath("/nucleos");
}
