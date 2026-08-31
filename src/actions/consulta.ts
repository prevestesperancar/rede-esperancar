"use server";

import { prisma } from "@/lib/prisma";

export type ResultadoConsulta = {
  simulado: string;
  data: string;
  nota: number | null;
  gabarito: string;
  respostas: string | null;
};

export type EstadoConsultaSimulado = {
  erro?: string;
  nomeEncontrado?: string;
  resultados?: ResultadoConsulta[];
};

function normalizar(texto: string) {
  return texto.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export async function consultarNotaSimulado(
  _prevState: EstadoConsultaSimulado | undefined,
  formData: FormData
): Promise<EstadoConsultaSimulado> {
  const nomeCompleto = (formData.get("nomeCompleto") as string) ?? "";
  const dataNascimentoStr = (formData.get("dataNascimento") as string) ?? "";

  if (!nomeCompleto.trim() || !dataNascimentoStr) {
    return { erro: "Preencha seu nome completo e data de nascimento." };
  }

  const dataNascimento = new Date(`${dataNascimentoStr}T00:00:00`);
  if (Number.isNaN(dataNascimento.getTime())) {
    return { erro: "Data de nascimento inválida." };
  }

  const candidatos = await prisma.estudante.findMany({
    where: { dataNascimento },
    include: {
      user: true,
      simulados: {
        include: { simulado: true },
        orderBy: { simulado: { data: "desc" } },
      },
    },
  });

  const estudante = candidatos.find((c) => normalizar(c.user.nome) === normalizar(nomeCompleto));

  if (!estudante) {
    return { erro: "Não encontramos nenhum estudante com esse nome e data de nascimento." };
  }

  return {
    nomeEncontrado: estudante.user.nome,
    resultados: estudante.simulados.map((r) => ({
      simulado: r.simulado.nome,
      data: r.simulado.data.toLocaleDateString("pt-BR"),
      nota: r.nota,
      gabarito: r.simulado.gabarito,
      respostas: r.respostas,
    })),
  };
}
