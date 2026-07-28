import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFImage } from "pdf-lib";
import { auth } from "@/lib/auth";
import { getEstudantesAtivosParaPresenca, getNucleoNome } from "@/lib/queries/gestao";

const PERMITIDOS = ["PROFESSOR", "COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

function sabadosDoMes(ano: number, mes: number) {
  const dias: number[] = [];
  const data = new Date(ano, mes, 1);
  while (data.getMonth() === mes) {
    if (data.getDay() === 6) dias.push(data.getDate());
    data.setDate(data.getDate() + 1);
  }
  return dias;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.nucleoId || !PERMITIDOS.includes(session.user.role)) {
    return new Response("Não autorizado.", { status: 403 });
  }

  const [matriculas, nucleoNome] = await Promise.all([
    getEstudantesAtivosParaPresenca(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  const hoje = new Date();
  const sabados = sabadosDoMes(hoje.getFullYear(), hoje.getMonth());
  const nomeMes = hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const pdf = await PDFDocument.create();
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);

  let logoImage: PDFImage | null;
  try {
    const logoBuffer = await readFile(path.join(process.cwd(), "public", "images", "logo-icon.png"));
    logoImage = await pdf.embedPng(logoBuffer);
  } catch {
    logoImage = null;
  }

  const pageWidth = 841.89; // A4 paisagem
  const pageHeight = 595.28;
  const margem = 36;
  const colNome = 200;
  const colTurma = 90;
  const colSabado = (pageWidth - margem * 2 - colNome - colTurma) / Math.max(sabados.length, 1);
  const alturaLinha = 22;
  const alturaCabecalho = 90;
  const linhasPorPagina = Math.floor((pageHeight - margem * 2 - alturaCabecalho) / alturaLinha);

  function desenharCabecalho(page: import("pdf-lib").PDFPage, topoY: number) {
    if (logoImage) {
      const escala = 28 / logoImage.height;
      page.drawImage(logoImage, {
        x: margem,
        y: topoY - 28,
        width: logoImage.width * escala,
        height: 28,
      });
    }
    page.drawText("Rede Esperançar — Lista de presença", {
      x: margem + (logoImage ? 40 : 0),
      y: topoY - 14,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(`${nucleoNome} · ${nomeMes}`, {
      x: margem + (logoImage ? 40 : 0),
      y: topoY - 30,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    const headerY = topoY - 55;
    page.drawLine({
      start: { x: margem, y: headerY - 4 },
      end: { x: pageWidth - margem, y: headerY - 4 },
      thickness: 1,
      color: rgb(0.75, 0.75, 0.75),
    });
    page.drawText("Nome", { x: margem, y: headerY, size: 9, font: fontBold });
    page.drawText("Turma", { x: margem + colNome, y: headerY, size: 9, font: fontBold });
    sabados.forEach((dia, i) => {
      const x = margem + colNome + colTurma + i * colSabado;
      page.drawText(`${String(dia).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}`, {
        x: x + colSabado / 2 - 12,
        y: headerY,
        size: 8,
        font: fontBold,
      });
    });
    return headerY - 10;
  }

  let pagina = pdf.addPage([pageWidth, pageHeight]);
  let y = desenharCabecalho(pagina, pageHeight - margem);
  let linhaAtual = 0;

  for (const m of matriculas) {
    if (linhaAtual >= linhasPorPagina) {
      pagina = pdf.addPage([pageWidth, pageHeight]);
      y = desenharCabecalho(pagina, pageHeight - margem);
      linhaAtual = 0;
    }

    y -= alturaLinha;
    linhaAtual++;

    pagina.drawText(m.estudante.user.nome, { x: margem, y: y + 6, size: 9, font: fontRegular });
    pagina.drawText(`${m.turma.nome} · ${m.turma.periodo}`, {
      x: margem + colNome,
      y: y + 6,
      size: 8,
      font: fontRegular,
      color: rgb(0.35, 0.35, 0.35),
    });

    sabados.forEach((_, i) => {
      const x = margem + colNome + colTurma + i * colSabado;
      const boxSize = 14;
      const boxX = x + colSabado / 2 - boxSize / 2;
      pagina.drawRectangle({
        x: boxX,
        y: y,
        width: boxSize,
        height: boxSize,
        borderColor: rgb(0.6, 0.6, 0.6),
        borderWidth: 0.75,
      });
    });

    pagina.drawLine({
      start: { x: margem, y },
      end: { x: pageWidth - margem, y },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
  }

  const bytes = await pdf.save();
  const nomeArquivo = `lista-presenca-${nucleoNome.toLowerCase().replace(/\s+/g, "-")}.pdf`;

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
