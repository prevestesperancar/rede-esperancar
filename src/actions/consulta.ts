"use server";

import { prisma } from "@/lib/prisma";
import { normalizarNome } from "@/lib/normalizar-nome";
import { montarGabaritoEfetivo } from "@/lib/simulado";

export type ResultadoConsulta = {
  simulado: string;
  data: string;
  nota: number | null;
  gabarito: string;
  respostas: string | null;
  linguaEscolhida: string | null;
};

export type EstadoConsultaSimulado = {
  erro?: string;
  nomeEncontrado?: string;
  resultados?: ResultadoConsulta[];
};

// Usada no perfil do aluno logado — mesma lógica de casamento por
// nome+data de nascimento da consulta pública, só que sem formulário
// (os dados já vêm do cadastro do próprio aluno).
export async function getResultadosSimuladosPorEstudante(
  nomeCompleto: string,
  dataNascimento: Date | null
): Promise<ResultadoConsulta[]> {
  if (!dataNascimento) return [];

  const candidatos = await prisma.simuladoResposta.findMany({
    where: { dataNascimento },
    include: { simulado: true },
    orderBy: { simulado: { data: "desc" } },
  });

  const encontrados = candidatos.filter(
    (r) => normalizarNome(r.nomeCompleto) === normalizarNome(nomeCompleto)
  );

  return encontrados.map((r) => ({
    simulado: r.simulado.nome,
    data: r.simulado.data.toLocaleDateString("pt-BR"),
    nota: r.nota,
    gabarito: montarGabaritoEfetivo(r.simulado, r.linguaEscolhida),
    respostas: r.respostas,
    linguaEscolhida: r.linguaEscolhida,
  }));
}

export type ResultadoConsultaComNome = ResultadoConsulta & { nomeAluno: string; simuladoId: string };

// Usada pela conta VISUALIZADOR_SIMULADO — mesma lógica de casamento por
// nome, mas pra uma lista de vários alunos de uma vez (não um só).
export async function getResultadosSimuladosPorNomes(
  nomesFiltro: string[]
): Promise<ResultadoConsultaComNome[]> {
  if (nomesFiltro.length === 0) return [];
  const permitidos = new Set(nomesFiltro.map(normalizarNome));

  const candidatos = await prisma.simuladoResposta.findMany({
    include: { simulado: true },
    orderBy: { simulado: { data: "desc" } },
  });

  return candidatos
    .filter((r) => permitidos.has(normalizarNome(r.nomeCompleto)))
    .map((r) => ({
      nomeAluno: r.nomeCompleto,
      simuladoId: r.simuladoId,
      simulado: r.simulado.nome,
      data: r.simulado.data.toLocaleDateString("pt-BR"),
      nota: r.nota,
      gabarito: montarGabaritoEfetivo(r.simulado, r.linguaEscolhida),
      respostas: r.respostas,
      linguaEscolhida: r.linguaEscolhida,
    }));
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

  const candidatos = await prisma.simuladoResposta.findMany({
    where: { dataNascimento },
    include: { simulado: true },
    orderBy: { simulado: { data: "desc" } },
  });

  const encontrados = candidatos.filter(
    (r) => normalizarNome(r.nomeCompleto) === normalizarNome(nomeCompleto)
  );

  if (encontrados.length === 0) {
    return { erro: "Não encontramos nenhum resultado com esse nome e data de nascimento." };
  }

  return {
    nomeEncontrado: encontrados[0].nomeCompleto,
    resultados: encontrados.map((r) => ({
      simulado: r.simulado.nome,
      data: r.simulado.data.toLocaleDateString("pt-BR"),
      nota: r.nota,
      gabarito: montarGabaritoEfetivo(r.simulado, r.linguaEscolhida),
      respostas: r.respostas,
      linguaEscolhida: r.linguaEscolhida,
    })),
  };
}
