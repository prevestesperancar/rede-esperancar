"use server";

import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizarNome } from "@/lib/normalizar-nome";
import { corrigirComLingua } from "@/lib/simulado";
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
  lingua: string;
};

export type ItemImportado = {
  nomeLido: string;
  dataNascimentoLida: string;
  respostasLidas: string;
  linguaLida: string;
  nota?: number;
};

export type EstadoImportacao = {
  erro?: string;
  itens?: ItemImportado[];
};

function extrairArrayJson(texto: string): unknown {
  const semFences = texto
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(semFences);
  } catch {
    // O modelo às vezes escreve uma frase antes/depois do array — pega só o
    // trecho entre o primeiro "[" e o último "]".
    const inicio = semFences.indexOf("[");
    const fim = semFences.lastIndexOf("]");
    if (inicio === -1 || fim === -1 || fim < inicio) {
      throw new Error("Resposta da IA não contém um array JSON.");
    }
    return JSON.parse(semFences.slice(inicio, fim + 1));
  }
}

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
  let textoBruto = "";
  try {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: "gemini-3.6-flash" });

    const resultado = await model.generateContent([
      {
        inlineData: { data: base64, mimeType: "application/pdf" },
      },
      {
        text: `Este PDF contém folhas de cartão-resposta de um simulado, escaneadas — uma folha por estudante, uma folha por página.

Para CADA página/folha, extraia:
- "nome": o nome completo do estudante, exatamente como está escrito no cartão.
- "dataNascimento": a data de nascimento, no formato AAAA-MM-DD. Se não achar, use "".
- "respostas": a sequência das ${numeroQuestoes} respostas marcadas, uma letra (A, B, C, D ou E) por questão, na ordem das questões, separadas por vírgula. Se uma questão estiver em branco, com dupla marcação, ou ilegível, use "?" naquela posição. Nas questões 23 a 27 (bloco de língua estrangeira), marque só as respostas do idioma que o estudante escolheu — não invente respostas pros idiomas que ele não marcou.
- "lingua": qual idioma o estudante escolheu no bloco de língua estrangeira (questões 23 a 27) — "Inglês", "Espanhol" ou "Francês". Se não conseguir identificar, use "".

Processe TODAS as páginas do documento, mesmo que sejam muitas. Responda APENAS com um array JSON válido, sem nenhum texto antes ou depois, sem markdown, no formato exato:
[{"nome": "...", "dataNascimento": "AAAA-MM-DD", "respostas": "A,B,C,...", "lingua": "..."}]`,
      },
    ]);

    textoBruto = resultado.response.text().trim();
    if (!textoBruto) {
      return { erro: "A IA não retornou nenhum conteúdo pra esse PDF. Tente novamente." };
    }
    const dados = extrairArrayJson(textoBruto);
    if (!Array.isArray(dados)) throw new Error("Formato inesperado.");
    cartoes = dados as CartaoLido[];
  } catch (error) {
    console.error("Erro ao ler cartões-resposta com IA:", error, "\nResposta bruta:", textoBruto);
    const detalhe = error instanceof Error ? error.message : String(error);
    return {
      erro: `Não foi possível ler o PDF automaticamente (${detalhe}). Confira se o arquivo está legível, se tem no máximo umas 30-40 páginas por lote, e tente de novo.`,
    };
  }

  if (cartoes.length === 0) {
    return { erro: "Não identificamos nenhum cartão-resposta nesse PDF." };
  }

  const respostasExistentes = await prisma.simuladoResposta.findMany({ where: { simuladoId } });

  const itens: ItemImportado[] = [];

  for (const cartao of cartoes) {
    const nomeLido = (cartao.nome ?? "").trim();
    const dataLidaStr = (cartao.dataNascimento ?? "").trim();
    const respostasLidas = (cartao.respostas ?? "").trim();
    const linguaLida = (cartao.lingua ?? "").trim();

    if (!nomeLido || !respostasLidas) continue;

    const dataNascimento = /^\d{4}-\d{2}-\d{2}$/.test(dataLidaStr)
      ? new Date(`${dataLidaStr}T00:00:00`)
      : null;
    const linguaEscolhida = ["Inglês", "Espanhol", "Francês"].includes(linguaLida) ? linguaLida : null;

    const nota = corrigirComLingua(simulado, respostasLidas, linguaEscolhida);

    const existente = respostasExistentes.find(
      (r) => normalizarNome(r.nomeCompleto) === normalizarNome(nomeLido)
    );

    if (existente) {
      await prisma.simuladoResposta.update({
        where: { id: existente.id },
        data: { respostas: respostasLidas, linguaEscolhida, nota, dataNascimento, corrigidoManualmente: false },
      });
    } else {
      await prisma.simuladoResposta.create({
        data: {
          simuladoId,
          nomeCompleto: nomeLido,
          dataNascimento,
          respostas: respostasLidas,
          linguaEscolhida,
          nota,
        },
      });
    }

    itens.push({ nomeLido, dataNascimentoLida: dataLidaStr, respostasLidas, linguaLida, nota });
  }

  revalidatePath("/gestao/simulados");
  return { itens };
}
