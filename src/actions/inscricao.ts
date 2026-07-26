"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { registrarDadoSensivel } from "@/lib/dados-sensiveis";

const InscricaoSchema = z.object({
  nome: z.string().trim().min(2, "Digite seu nome completo."),
  cpf: z.string().trim().min(11, "Digite um CPF válido."),
  rg: z.string().trim().min(4, "Digite um RG válido."),
  email: z.email("Digite um e-mail válido.").trim(),
  telefone: z.string().trim().min(8, "Digite um telefone válido."),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  turmaId: z.string().min(1, "Escolha uma turma."),
  dataNascimento: z.string().min(1, "Informe sua data de nascimento."),
  sexoGenero: z.string().trim().min(1, "Escolha uma opção."),
  racaCor: z.string().trim().min(1, "Escolha uma opção."),
  bairro: z.string().trim().min(1, "Informe seu bairro."),
  municipio: z.string().trim().min(1, "Informe seu município."),
  situacaoEscolarOpcao: z.string().trim().min(1, "Escolha uma opção."),
  situacaoEscolarOutro: z.string().trim().optional(),
  escola: z.string().trim().min(1, "Informe o nome da sua escola."),
  escolaPublica: z.string().min(1, "Escolha uma opção."),
  jaFezEnem: z.string().min(1, "Escolha uma opção."),
  cursoDesejado: z.string().trim().min(1, "Informe o curso desejado."),
  universidadeDesejada: z.string().trim().optional(),
  rendaFamiliar: z.string().trim().min(1, "Escolha uma opção."),
  pessoasEmCasa: z.string().min(1, "Informe quantas pessoas moram com você."),
  trabalha: z.string().min(1, "Escolha uma opção."),
  disponibilidadeSabado: z.string().min(1, "Escolha uma opção."),
  motivacao: z.string().trim().min(10, "Conte um pouco mais (mínimo 10 caracteres)."),
  termos: z.string().refine((v) => v === "on", "Você precisa aceitar os termos."),
});

export type InscricaoState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export async function inscrever(
  _prevState: InscricaoState,
  formData: FormData
): Promise<InscricaoState> {
  const raw = Object.fromEntries(formData.entries());
  const validated = InscricaoSchema.safeParse(raw);

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  const data = validated.data;

  const turma = await prisma.turma.findUnique({
    where: { id: data.turmaId },
    include: { nucleo: true },
  });
  if (!turma) {
    return { message: "Turma não encontrada." };
  }

  const existente = await prisma.user.findUnique({ where: { email: data.email } });
  if (existente) {
    return {
      errors: {
        email: ["Já existe uma inscrição com este e-mail."],
      },
    };
  }

  const situacaoEscolar =
    data.situacaoEscolarOpcao === "Outro"
      ? data.situacaoEscolarOutro || "Outro"
      : data.situacaoEscolarOpcao;

  const passwordHash = await bcrypt.hash(data.senha, 10);

  const user = await prisma.user.create({
    data: {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      passwordHash,
      role: "ESTUDANTE",
      nucleoId: turma.nucleoId,
    },
  });

  const estudante = await prisma.estudante.create({
    data: { userId: user.id },
  });

  await prisma.matricula.create({
    data: {
      estudanteId: estudante.id,
      turmaId: turma.id,
      status: "PENDENTE",
    },
  });

  await prisma.estudante.update({
    where: { id: estudante.id },
    data: {
      dataNascimento: new Date(data.dataNascimento),
      sexoGenero: data.sexoGenero,
      racaCor: data.racaCor,
      bairro: data.bairro,
      municipio: data.municipio,
      situacaoEscolar,
      escola: data.escola,
      escolaPublica: data.escolaPublica === "sim",
      jaFezEnem: data.jaFezEnem === "sim",
      cursoDesejado: data.cursoDesejado,
      universidadeDesejada: data.universidadeDesejada || null,
      rendaFamiliar: data.rendaFamiliar,
      pessoasEmCasa: Number(data.pessoasEmCasa),
      trabalha: data.trabalha !== "nao",
      disponibilidadeSabado: data.disponibilidadeSabado === "sim",
      motivacao: data.motivacao,
    },
  });

  // CPF/RG nunca vão para o banco do site — ficam só num arquivo privado no
  // servidor até a integração real com a planilha (Google Sheets API) estar
  // configurada. A coordenação exporta esse arquivo manualmente por enquanto.
  await registrarDadoSensivel({
    nome: data.nome,
    email: data.email,
    cpf: data.cpf,
    rg: data.rg,
    nucleo: turma.nucleo.nome,
  });

  redirect("/inscricao-recebida");
}
