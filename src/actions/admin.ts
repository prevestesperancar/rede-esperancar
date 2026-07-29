"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geocodificarEndereco } from "@/lib/geocoding";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado.");
  }
  return session.user;
}

export async function criarNucleo(
  _prevState: string | undefined,
  formData: FormData
) {
  await requireAdmin();

  const nome = formData.get("nome") as string;
  const slug = formData.get("slug") as string;
  const cidade = formData.get("cidade") as string;
  const estado = formData.get("estado") as string;
  const bairro = formData.get("bairro") as string;
  const endereco = formData.get("endereco") as string;
  const descricao = formData.get("descricao") as string;
  const coordNome = formData.get("coordNome") as string;
  const coordEmail = formData.get("coordEmail") as string;
  const coordSenha = formData.get("coordSenha") as string;

  if (!nome || !slug || !cidade || !estado || !bairro) {
    return "Preencha nome, slug, bairro, cidade e estado do núcleo.";
  }
  if (!coordNome || !coordEmail || !coordSenha) {
    return "Preencha os dados do coordenador responsável.";
  }
  if (coordSenha.length < 6) {
    return "A senha do coordenador precisa ter pelo menos 6 caracteres.";
  }

  const slugExistente = await prisma.nucleo.findUnique({ where: { slug } });
  if (slugExistente) return "Já existe um núcleo com esse slug.";

  const emailExistente = await prisma.user.findUnique({ where: { email: coordEmail } });
  if (emailExistente) return "Já existe um usuário com esse e-mail.";

  const passwordHash = await bcrypt.hash(coordSenha, 10);

  const coordenadas = await geocodificarEndereco(
    `${endereco || bairro}, ${bairro}, ${cidade}, ${estado}, Brasil`,
    `${bairro}, ${cidade}, ${estado}, Brasil`,
    `${cidade}, ${estado}, Brasil`
  );

  const nucleo = await prisma.nucleo.create({
    data: {
      nome,
      slug,
      cidade,
      estado,
      bairro,
      endereco,
      descricao,
      latitude: coordenadas?.lat ?? null,
      longitude: coordenadas?.lon ?? null,
    },
  });

  const coordenador = await prisma.user.create({
    data: {
      nome: coordNome,
      email: coordEmail,
      passwordHash,
      role: "COORDENACAO",
      nucleoId: nucleo.id,
    },
  });

  await prisma.nucleo.update({
    where: { id: nucleo.id },
    data: { coordenadorId: coordenador.id },
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function editarNucleoAdmin(
  _prevState: string | undefined,
  formData: FormData
) {
  await requireAdmin();

  const nucleoId = formData.get("nucleoId") as string;
  const nome = formData.get("nome") as string;
  const cidade = formData.get("cidade") as string;
  const estado = formData.get("estado") as string;
  const bairro = formData.get("bairro") as string;
  const endereco = formData.get("endereco") as string;
  const descricao = formData.get("descricao") as string;
  const ativo = formData.get("ativo") === "on";

  if (!nome || !cidade || !estado || !bairro)
    return "Preencha nome, bairro, cidade e estado.";

  const nucleoAtual = await prisma.nucleo.findUnique({ where: { id: nucleoId } });
  const enderecoCompleto = `${endereco || bairro}, ${bairro}, ${cidade}, ${estado}, Brasil`;
  const enderecoMudou =
    endereco !== nucleoAtual?.endereco || bairro !== nucleoAtual?.bairro || cidade !== nucleoAtual?.cidade;
  const semCoordenadas = !nucleoAtual?.latitude || !nucleoAtual?.longitude;

  let latitude = nucleoAtual?.latitude ?? null;
  let longitude = nucleoAtual?.longitude ?? null;
  if (enderecoMudou || semCoordenadas) {
    const coordenadas = await geocodificarEndereco(
      enderecoCompleto,
      `${bairro}, ${cidade}, ${estado}, Brasil`,
      `${cidade}, ${estado}, Brasil`
    );
    latitude = coordenadas?.lat ?? null;
    longitude = coordenadas?.lon ?? null;
  }

  await prisma.nucleo.update({
    where: { id: nucleoId },
    data: { nome, cidade, estado, bairro, endereco, descricao, ativo, latitude, longitude },
  });

  revalidatePath("/admin");
  revalidatePath("/nucleos");
  revalidatePath("/");
  redirect("/admin");
}

export async function atualizarConteudoSite(
  _prevState: string | undefined,
  formData: FormData
) {
  await requireAdmin();

  const quemSomosTexto = formData.get("quemSomosTexto") as string;
  const contatoEmail = formData.get("contatoEmail") as string;
  const contatoTelefone = formData.get("contatoTelefone") as string;
  const contatoEndereco = formData.get("contatoEndereco") as string;
  const monitoriaTexto = formData.get("monitoriaTexto") as string;
  const cotasTexto = formData.get("cotasTexto") as string;

  const existente = await prisma.conteudoSite.findFirst();

  const data = {
    quemSomosTexto: quemSomosTexto || null,
    contatoEmail: contatoEmail || null,
    contatoTelefone: contatoTelefone || null,
    contatoEndereco: contatoEndereco || null,
    monitoriaTexto: monitoriaTexto || null,
    cotasTexto: cotasTexto || null,
  };

  if (existente) {
    await prisma.conteudoSite.update({ where: { id: existente.id }, data });
  } else {
    await prisma.conteudoSite.create({ data });
  }

  revalidatePath("/admin/conteudo");
  revalidatePath("/quem-somos");
  revalidatePath("/contato");
  revalidatePath("/monitoria");
  revalidatePath("/cotas-e-permanencia");
  return "Conteúdo atualizado!";
}

const ROLES_EDITAVEIS = ["PROFESSOR", "COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

export async function criarUsuarioAdmin(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();

  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const role = formData.get("role") as string;
  const nucleoId = formData.get("nucleoId") as string;

  if (!nome || !email || !senha) return "Preencha nome, e-mail e senha.";
  if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
  if (!ROLES_EDITAVEIS.includes(role)) return "Papel inválido.";
  if (role !== "ADMIN" && !nucleoId) return "Escolha o núcleo desse usuário.";

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) return "Já existe um usuário com esse e-mail.";

  const passwordHash = await bcrypt.hash(senha, 10);

  await prisma.user.create({
    data: {
      nome,
      email,
      passwordHash,
      role: role as "PROFESSOR" | "COORDENACAO" | "APOIO_PSICOSSOCIAL" | "ADMIN",
      nucleoId: role === "ADMIN" ? null : nucleoId,
    },
  });

  revalidatePath("/admin/usuarios");
  return "Usuário criado!";
}

export async function alterarAcessoUsuario(
  _prevState: string | undefined,
  formData: FormData
) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  const nucleoId = formData.get("nucleoId") as string;
  const email = formData.get("email") as string;

  if (!ROLES_EDITAVEIS.includes(role)) return "Papel inválido.";
  if (!email) return "Preencha o e-mail.";

  const usuario = await prisma.user.findUnique({ where: { id: userId } });
  if (!usuario) return "Usuário não encontrado.";

  if (email !== usuario.email) {
    const emailExistente = await prisma.user.findUnique({ where: { email } });
    if (emailExistente) return "Já existe um usuário com esse e-mail.";
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      role: role as "PROFESSOR" | "COORDENACAO" | "APOIO_PSICOSSOCIAL" | "ADMIN",
      nucleoId: role === "ADMIN" ? null : nucleoId || null,
    },
  });

  revalidatePath("/admin/usuarios");
  return "Acesso atualizado!";
}

export async function redefinirSenhaUsuario(
  _prevState: string | undefined,
  formData: FormData
) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const novaSenha = formData.get("novaSenha") as string;

  if (!novaSenha || novaSenha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";

  const passwordHash = await bcrypt.hash(novaSenha, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/admin/usuarios");
  return "Senha redefinida!";
}
