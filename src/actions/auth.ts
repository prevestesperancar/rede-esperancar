"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { salvarArquivo, ArquivoInvalidoError } from "@/lib/upload";
import { validarSenhaForte } from "@/lib/senha";

export async function login(_prevState: string | undefined, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return "E-mail ou senha inválidos.";
    }
    throw error;
  }

  // Não usamos auth() aqui: o cookie de sessão que signIn() acabou de definir
  // só fica visível numa requisição seguinte, então lemos o papel direto do banco.
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  if (user?.role === "ESTUDANTE") {
    redirect("/aluno");
  }
  if (user?.role === "ADMIN") {
    redirect("/admin");
  }
  if (user?.role === "VISUALIZADOR_SIMULADO") {
    redirect("/visualizador");
  }
  redirect("/gestao");
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function alterarSenha(
  _prevState: string | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const senhaAtual = formData.get("senhaAtual") as string;
  const senhaNova = formData.get("senhaNova") as string;

  if (!senhaAtual || !senhaNova) return "Preencha os dois campos.";
  const erroSenha = validarSenhaForte(senhaNova);
  if (erroSenha) return erroSenha;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return "Usuário não encontrado.";

  const valida = await bcrypt.compare(senhaAtual, user.passwordHash);
  if (!valida) return "Senha atual incorreta.";

  const passwordHash = await bcrypt.hash(senhaNova, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return "Senha alterada com sucesso!";
}

export async function trocarSenhaObrigatoria(
  _prevState: string | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const senhaNova = formData.get("senhaNova") as string;
  if (!senhaNova) return "Preencha a nova senha.";
  const erroSenha = validarSenhaForte(senhaNova);
  if (erroSenha) return erroSenha;

  const passwordHash = await bcrypt.hash(senhaNova, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash, precisaTrocarSenha: false },
  });

  // Sessão JWT não se atualiza sozinha — pede login de novo com a senha nova.
  await signOut({ redirectTo: "/login" });
}

export async function editarPerfil(
  _prevState: string | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const nome = formData.get("nome") as string;
  const telefone = formData.get("telefone") as string;
  const email = formData.get("email") as string | null;
  const foto = formData.get("foto") as File | null;

  if (!nome) return "O nome não pode ficar em branco.";

  if (email) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (email !== user?.email) {
      const emailExistente = await prisma.user.findUnique({ where: { email } });
      if (emailExistente) return "Já existe um usuário com esse e-mail.";
    }
  }

  let fotoUrl: string | null = null;
  if (foto && foto.size > 0) {
    try {
      fotoUrl = await salvarArquivo(foto, "perfis");
    } catch (error) {
      if (error instanceof ArquivoInvalidoError) return error.message;
      throw error;
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      nome,
      telefone: telefone || null,
      ...(email ? { email } : {}),
      ...(fotoUrl ? { fotoUrl } : {}),
    },
  });

  revalidatePath("/aluno");
  revalidatePath("/aluno/perfil");
  revalidatePath("/gestao");
  revalidatePath("/gestao/perfil");

  if (email && email !== session.user.email) {
    await signOut({ redirectTo: "/login" });
  }

  return "Perfil atualizado!";
}

export async function removerFotoPropria() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { fotoUrl: null },
  });

  revalidatePath("/aluno");
  revalidatePath("/aluno/perfil");
  revalidatePath("/gestao");
  revalidatePath("/gestao/perfil");
}
