import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizarNome } from "@/lib/normalizar-nome";
import { corrigirComLingua } from "@/lib/simulado";
import type { ItemImportado, EstadoImportacao } from "@/lib/importar-cartoes-tipos";

// Lendo página por página (mais lento, bem mais preciso) precisamos de mais
// tempo do que o padrão do Vercel — por isso isso é uma rota, não uma server
// action ("use server" só permite exportar funções async, não essa config).
export const maxDuration = 60;

const COORDENACAO_ROLES = ["COORDENACAO", "ADMIN"];
const PAGINAS_EM_PARALELO = 6;

type CartaoLido = {
  nome: string;
  dataNascimento: string;
  respostas: string;
  lingua: string;
};

function extrairObjetoJson(texto: string): unknown {
  const semFences = texto
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(semFences);
  } catch {
    const inicio = semFences.indexOf("{");
    const fim = semFences.lastIndexOf("}");
    if (inicio === -1 || fim === -1 || fim < inicio) {
      throw new Error("Resposta da IA não contém um objeto JSON.");
    }
    return JSON.parse(semFences.slice(inicio, fim + 1));
  }
}

async function lerUmaPagina(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  paginaBase64: string,
  numeroQuestoes: number
): Promise<CartaoLido> {
  const resultado = await model.generateContent([
    { inlineData: { data: paginaBase64, mimeType: "application/pdf" } },
    {
      text: `Esta página contém UM ÚNICO cartão-resposta de simulado, preenchido à mão.

Olhe com bastante atenção cada bolha/marcação antes de responder. Extraia:
- "nome": o nome completo do estudante, exatamente como está escrito à mão no cartão. Leia letra por letra com cuidado.
- "dataNascimento": a data de nascimento, no formato AAAA-MM-DD. Se não achar ou não conseguir ler, use "".
- "respostas": a sequência das ${numeroQuestoes} respostas marcadas, uma letra (A, B, C, D ou E) por questão, na ordem das questões, separadas por vírgula. Confira cada bolha preenchida uma por uma, na ordem. Se uma questão estiver em branco, com dupla marcação, ou realmente ilegível, use "?" só naquela posição — não invente uma letra.
- "lingua": nas questões 23 a 27 (bloco de língua estrangeira), qual idioma o estudante marcou — "Inglês", "Espanhol" ou "Francês". Se não conseguir identificar, use "".

Responda APENAS com um objeto JSON válido, sem texto antes ou depois, sem markdown, no formato exato:
{"nome": "...", "dataNascimento": "AAAA-MM-DD", "respostas": "A,B,C,...", "lingua": "..."}`,
    },
  ]);

  const texto = resultado.response.text().trim();
  if (!texto) throw new Error("A IA não retornou conteúdo pra essa página.");
  const dados = extrairObjetoJson(texto);
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw new Error("Formato inesperado na resposta da IA.");
  }
  return dados as CartaoLido;
}

export async function POST(request: Request): Promise<NextResponse<EstadoImportacao>> {
  const session = await auth();
  if (!session?.user || !COORDENACAO_ROLES.includes(session.user.role)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 403 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      erro: "Leitura automática não está configurada (falta a chave da API de IA).",
    });
  }

  // O PDF já foi pro Vercel Blob direto do navegador (o corpo de uma
  // requisição de função no Vercel tem limite de 4.5MB, bem menor que
  // cartões-resposta escaneados costumam pesar) — aqui só recebemos a URL e
  // baixamos o arquivo a partir dela.
  const { simuladoId, url } = (await request.json()) as { simuladoId?: string; url?: string };

  if (!simuladoId) return NextResponse.json({ erro: "Escolha o simulado." });
  if (!url) return NextResponse.json({ erro: "Envie o PDF com os cartões-resposta." });

  const simulado = await prisma.simulado.findUnique({ where: { id: simuladoId } });
  if (!simulado) return NextResponse.json({ erro: "Simulado não encontrado." });

  const numeroQuestoes = simulado.gabarito.split(",").length;

  let paginasBase64: string[];
  try {
    const respostaArquivo = await fetch(url);
    if (!respostaArquivo.ok) throw new Error("Não foi possível baixar o PDF enviado.");
    const bytesOriginais = await respostaArquivo.arrayBuffer();
    const documentoOriginal = await PDFDocument.load(bytesOriginais);
    const totalPaginas = documentoOriginal.getPageCount();

    paginasBase64 = [];
    for (let i = 0; i < totalPaginas; i++) {
      const paginaDoc = await PDFDocument.create();
      const [pagina] = await paginaDoc.copyPages(documentoOriginal, [i]);
      paginaDoc.addPage(pagina);
      const bytes = await paginaDoc.save();
      paginasBase64.push(Buffer.from(bytes).toString("base64"));
    }
  } catch (error) {
    console.error("Erro ao dividir o PDF em páginas:", error);
    return NextResponse.json({
      erro: "Não foi possível abrir esse PDF. Confira se o arquivo não está corrompido.",
    });
  }

  if (paginasBase64.length === 0) {
    return NextResponse.json({ erro: "Esse PDF não tem nenhuma página." });
  }

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({ model: "gemini-3.6-flash" });

  const cartoesPorPagina: (CartaoLido | null)[] = new Array(paginasBase64.length).fill(null);
  const errosPorPagina: (string | null)[] = new Array(paginasBase64.length).fill(null);

  for (let inicio = 0; inicio < paginasBase64.length; inicio += PAGINAS_EM_PARALELO) {
    const lote = paginasBase64.slice(inicio, inicio + PAGINAS_EM_PARALELO);
    const resultadosLote = await Promise.all(
      lote.map((paginaBase64) => lerUmaPagina(model, paginaBase64, numeroQuestoes).catch((err) => err as Error))
    );
    resultadosLote.forEach((resultado, i) => {
      const indice = inicio + i;
      if (resultado instanceof Error) {
        errosPorPagina[indice] = resultado.message;
      } else {
        cartoesPorPagina[indice] = resultado;
      }
    });
  }

  const respostasExistentes = await prisma.simuladoResposta.findMany({ where: { simuladoId } });
  const itens: ItemImportado[] = [];

  for (let i = 0; i < cartoesPorPagina.length; i++) {
    const pagina = i + 1;
    const erroLeitura = errosPorPagina[i];
    if (erroLeitura) {
      itens.push({
        pagina,
        nomeLido: "",
        dataNascimentoLida: "",
        respostasLidas: "",
        linguaLida: "",
        erro: erroLeitura,
      });
      continue;
    }

    const cartao = cartoesPorPagina[i]!;
    const nomeLido = (cartao.nome ?? "").trim();
    const dataLidaStr = (cartao.dataNascimento ?? "").trim();
    const respostasLidas = (cartao.respostas ?? "").trim();
    const linguaLida = (cartao.lingua ?? "").trim();

    if (!nomeLido || !respostasLidas) {
      itens.push({
        pagina,
        nomeLido,
        dataNascimentoLida: dataLidaStr,
        respostasLidas,
        linguaLida,
        erro: "Não deu pra identificar nome e/ou respostas nessa página.",
      });
      continue;
    }

    // UTC (Z) — mesma data string tem que virar sempre o mesmo instante,
    // independente do fuso de onde o código roda (ver consulta.ts).
    const dataNascimento = /^\d{4}-\d{2}-\d{2}$/.test(dataLidaStr)
      ? new Date(`${dataLidaStr}T00:00:00Z`)
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

    itens.push({ pagina, nomeLido, dataNascimentoLida: dataLidaStr, respostasLidas, linguaLida, nota });
  }

  return NextResponse.json({ itens });
}
