import { readFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";

const COR_TERRACOTA = "FFB5533C";
const COR_TEXTO_CLARO = "FFFFFFFF";
const COR_FAIXA = "FFF3EEE7";

// Cria uma planilha com o padrão visual da Rede Esperançar: logo no topo,
// título/subtítulo e cabeçalho de colunas estilizado — usado em todo export
// para Excel do sistema.
export async function criarPlanilhaComCabecalho({
  titulo,
  subtitulo,
  colunas,
}: {
  titulo: string;
  subtitulo: string;
  colunas: { header: string; width?: number }[];
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Rede Esperançar";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Dados", {
    views: [{ state: "frozen", ySplit: 5 }],
  });

  sheet.columns = colunas.map((c) => ({ width: c.width ?? 22 }));

  try {
    const logoBuffer = await readFile(path.join(process.cwd(), "public", "images", "logo-icon.png"));
    const imageId = workbook.addImage({
      buffer: logoBuffer as unknown as ExcelJS.Buffer,
      extension: "png",
    });
    sheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 40, height: 34 } });
  } catch {
    // segue sem logo se o arquivo não existir no ambiente
  }

  sheet.mergeCells("B1:E2");
  const tituloCell = sheet.getCell("B1");
  tituloCell.value = titulo;
  tituloCell.font = { bold: true, size: 14, color: { argb: "FF1A1A1A" } };
  tituloCell.alignment = { vertical: "middle" };

  sheet.mergeCells("B3:E4");
  const subtituloCell = sheet.getCell("B3");
  subtituloCell.value = subtitulo;
  subtituloCell.font = { size: 10, color: { argb: "FF666666" } };
  subtituloCell.alignment = { vertical: "middle" };

  const headerRow = sheet.getRow(5);
  headerRow.values = colunas.map((c) => c.header);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: COR_TEXTO_CLARO } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR_TERRACOTA } };
    cell.alignment = { vertical: "middle" };
  });
  headerRow.height = 20;

  return { workbook, sheet, primeiraLinhaDeDados: 6, corFaixa: COR_FAIXA };
}

export function zebrarLinhas(sheet: ExcelJS.Worksheet, primeiraLinha: number, ultimaLinha: number, corFaixa: string) {
  for (let i = primeiraLinha; i <= ultimaLinha; i++) {
    if ((i - primeiraLinha) % 2 === 1) {
      sheet.getRow(i).eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: corFaixa } };
      });
    }
  }
}
