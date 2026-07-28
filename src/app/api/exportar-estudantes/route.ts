import { readFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import { auth } from "@/lib/auth";
import { getEstudantesDoNucleo, getNucleoNome } from "@/lib/queries/gestao";

const PERMITIDOS = ["PROFESSOR", "COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.nucleoId || !PERMITIDOS.includes(session.user.role)) {
    return new Response("Não autorizado.", { status: 403 });
  }

  const [matriculas, nucleoNome] = await Promise.all([
    getEstudantesDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Lista de presença");

  sheet.columns = [
    { width: 4 },
    { width: 34 },
    { width: 22 },
    { width: 28 },
  ];

  try {
    const logoBuffer = await readFile(
      path.join(process.cwd(), "public", "images", "logo-icon.png")
    );
    const imageId = workbook.addImage({
      buffer: logoBuffer as unknown as ExcelJS.Buffer,
      extension: "png",
    });
    sheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 48, height: 48 } });
  } catch {
    // segue sem a logo se o arquivo não existir
  }

  sheet.mergeCells("B1:D1");
  sheet.getCell("B1").value = "Rede Esperançar — Lista de presença";
  sheet.getCell("B1").font = { bold: true, size: 14 };

  sheet.mergeCells("B2:D2");
  sheet.getCell("B2").value = nucleoNome;
  sheet.getCell("B2").font = { size: 11, color: { argb: "FF666666" } };

  sheet.mergeCells("B3:D3");
  sheet.getCell("B3").value = `Data: ______ / ______ / __________`;
  sheet.getCell("B3").font = { size: 11 };

  sheet.addRow([]);

  const headerRow = sheet.addRow(["", "Nome", "Turma", "Assinatura"]);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.border = { bottom: { style: "thin" } };
  });

  matriculas.forEach((m) => {
    const row = sheet.addRow(["", m.estudante.user.nome, `${m.turma.nome} · ${m.turma.periodo}`, ""]);
    row.getCell(4).border = { bottom: { style: "thin", color: { argb: "FFCCCCCC" } } };
    row.height = 22;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const nomeArquivo = `lista-presenca-${nucleoNome.toLowerCase().replace(/\s+/g, "-")}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
