"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { salvarArquivo } from "@/lib/upload";

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
  const gestor = await requireCoordenacao();

  const estudanteId = formData.get("estudanteId") as string;
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

  if (!estudanteId) return "Estudante não encontrado.";

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
    data: { telefone: telefone || null },
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
  const publico = formData.get("publico") === "on";

  if (!titulo || !arquivo || arquivo.size === 0) return "Preencha título e selecione o arquivo.";

  const arquivoUrl = await salvarArquivo(arquivo, "materiais");
  if (!arquivoUrl) return "Não foi possível enviar o arquivo.";

  await prisma.material.create({
    data: { titulo, descricao, arquivoUrl, publico, nucleoId: user.nucleoId },
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

  const fotoUrl = await salvarArquivo(foto, "depoimentos");

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

  const fotoUrl = await salvarArquivo(foto, "professores");
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

  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
  if (!turma || turma.nucleoId !== user.nucleoId) return "Turma não encontrada.";
  if (!nome || !periodo || !capacidade) return "Preencha nome, período e capacidade.";

  await prisma.turma.update({
    where: { id: turmaId },
    data: { nome, periodo, capacidade: Number(capacidade) },
  });

  revalidatePath("/gestao/turmas");
  revalidatePath("/");
  revalidatePath("/nucleos");
  return "Turma atualizada!";
}

export async function alternarTurmaAtiva(turmaId: string) {
  const user = await requireCoordenacao();

  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
  if (!turma || turma.nucleoId !== user.nucleoId) throw new Error("Turma não encontrada.");

  await prisma.turma.update({
    where: { id: turmaId },
    data: { ativo: !turma.ativo },
  });

  revalidatePath("/gestao/turmas");
  revalidatePath("/");
  revalidatePath("/nucleos");
}

export async function atualizarProfessor(_prevState: string | undefined, formData: FormData) {
  const user = await requireCoordenacao();

  const professorId = formData.get("professorId") as string;
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const materia = formData.get("materia") as string;
  const foto = formData.get("foto") as File | null;
  const removerFoto = formData.get("removerFoto") === "on";

  const professor = await prisma.user.findUnique({ where: { id: professorId } });
  if (!professor || professor.nucleoId !== user.nucleoId) return "Professor não encontrado neste núcleo.";

  if (!nome) return "Preencha o nome.";
  if (!email) return "Preencha o e-mail.";

  if (email !== professor.email) {
    const emailExistente = await prisma.user.findUnique({ where: { email } });
    if (emailExistente) return "Já existe um usuário com esse e-mail.";
  }

  const fotoUrl = await salvarArquivo(foto, "professores");

  await prisma.user.update({
    where: { id: professorId },
    data: {
      nome,
      email,
      telefone: telefone || null,
      materia: materia || null,
      ...(fotoUrl ? { fotoUrl } : removerFoto ? { fotoUrl: null } : {}),
    },
  });

  revalidatePath("/gestao/professores");
  revalidatePath("/gestao/historias");
  revalidatePath(`/gestao/professores/${professorId}`);
  return "Dados atualizados!";
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

  const fotoUrl = await salvarArquivo(foto, "nucleos");

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
