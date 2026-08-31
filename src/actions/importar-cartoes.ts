"use server";

import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizarNome } from "@/lib/normalizar-nome";
import { corrigirAutomaticamente } from "@/lib/simulado";
import { TAMANHO_MAXIMO_DOCUMENTO } from "@/lib/upload-limits";

const COORDENACAO_ROLES = ["COORDENACAO", "ADMIN"];

async function requireCoordenacao() {
  const session = await auth();
  if (!session?.user || !COORDENACAO_ROLES.includes(session.user.role)) {
    throw new Error("Não autorizado.");
  }
  return session.user;
}

type CartaoLido = {
  nome: string;
  dataNascimento: string;
  respostas: string;
};

export type ItemImportado = {
  nomeLido: string;
  dataNascimentoLida: string;
  respostasLidas: string;
  encontrado: boolean;
  nomeEstudante?: string;
  nota?: number;
};

export type EstadoImportacao = {
  erro?: string;
  itens?: ItemImportado[];
};

export async function importarCartoesResposta(
  _prevState: EstadoImportacao | undefined,
  formData: FormData
): Promise<EstadoImportacao> {
  await requireCoordenacao();

  if (!process.env.GEMINI_API_KEY) {
    return { erro: "Leitura automática não está configurada (falta a chave da API de IA)." };
  }

  const simuladoId = formData.get("simuladoId") as string;
  const arquivo = formData.get("arquivo") as File | null;

  if (!simuladoId) return { erro: "Escolha o simulado." };
  if (!arquivo || arquivo.size === 0) return { erro: "Envie o PDF com os cartões-resposta." };
  if (arquivo.size > TAMANHO_MAXIMO_DOCUMENTO) {
    return {
      erro: `O arquivo tem ${(arquivo.size / (1024 * 1024)).toFixed(1)}MB — o máximo aceito é ${
        TAMANHO_MAXIMO_DOCUMENTO / (1024 * 1024)
      }MB. Divida em lotes menores.`,
    };
  }

  const simulado = await prisma.simulado.findUnique({ where: { id: simuladoId } });
  if (!simulado) return { erro: "Simulado não encontrado." };

  const numeroQuestoes = simulado.gabarito.split(",").length;
  const base64 = Buffer.from(await arquivo.arrayBuffer()).toString("base64");

  let cartoes: CartaoLido[];
  try {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const resultado = await model.generateContent([
      {
        inlineData: { data: base64, mimeType: "application/pdf" },
      },
      {
        text: `Este PDF contém folhas de cartão-resposta de um simulado, escaneadas — uma folha por estudante (pode haver mais de uma folha por página ou uma folha por página).

Para CADA cartão-resposta que você encontrar, extraia:
- "nome": o nome completo do estudante, exatamente como está escrito no cartão.
- "dataNascimento": a data de nascimento, no formato AAAA-MM-DD.
- "respostas": a sequência das ${numeroQuestoes} respostas marcadas, uma letra (A, B, C, D ou E) por questão, na ordem das questões, separadas por vírgula. Se uma questão estiver em branco, com dupla marcação, ou ilegível, use "?" naquela posição.

Responda APENAS com um array JSON válido, sem nenhum texto antes ou depois, no formato exato:
[{"nome": "...", "dataNascimento": "AAAA-MM-DD", "respostas": "A,B,C,..."}]

Se não conseguir identificar nome ou data de nascimento em algum cartão, ainda assim inclua o item com o campo em branco ("").`,
      },
    ]);

    const texto = resultado.response.text().trim();
    const jsonLimpo = texto.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
    const dados = JSON.parse(jsonLimpo);
    if (!Array.isArray(dados)) throw new Error("Formato inesperado.");
    cartoes = dados;
  } catch (error) {
    console.error("Erro ao ler cartões-resposta com IA:", error);
    return {
      erro: "Não foi possível ler o PDF automaticamente. Confira se o arquivo está legível e tente de novo.",
    };
  }

  if (cartoes.length === 0) {
    return { erro: "Não identificamos nenhum cartão-resposta nesse PDF." };
  }

  const estudantesComData = await prisma.estudante.findMany({
    where: { dataNascimento: { not: null } },
    include: { user: true },
  });

  const itens: ItemImportado[] = [];

  for (const cartao of cartoes) {
    const nomeLido = (cartao.nome ?? "").trim();
    const dataLida = (cartao.dataNascimento ?? "").trim();
    const respostasLidas = (cartao.respostas ?? "").trim();

    const estudante = estudantesComData.find((e) => {
      if (normalizarNome(e.user.nome) !== normalizarNome(nomeLido)) return false;
      if (!e.dataNascimento) return false;
      const dataFormatada = e.dataNascimento.toISOString().slice(0, 10);
      return dataFormatada === dataLida;
    });

    if (!estudante || !respostasLidas) {
      itens.push({ nomeLido, dataNascimentoLida: dataLida, respostasLidas, encontrado: false });
      continue;
    }

    const nota = corrigirAutomaticamente(simulado.gabarito, respostasLidas);
    await prisma.simuladoResposta.upsert({
      where: { simuladoId_estudanteId: { simuladoId, estudanteId: estudante.id } },
      update: { respostas: respostasLidas, nota, corrigidoManualmente: false },
      create: { simuladoId, estudanteId: estudante.id, respostas: respostasLidas, nota },
    });

    itens.push({
      nomeLido,
      dataNascimentoLida: dataLida,
      respostasLidas,
      encontrado: true,
      nomeEstudante: estudante.user.nome,
      nota,
    });
  }

  revalidatePath("/gestao/simulados");
  return { itens };
}
