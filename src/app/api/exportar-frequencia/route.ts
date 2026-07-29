import { auth } from "@/lib/auth";
import { getFrequenciaDetalhadaDoNucleo, getNucleoNome } from "@/lib/queries/gestao";
import { criarPlanilhaComCabecalho, zebrarLinhas } from "@/lib/excel";

const PERMITIDOS = ["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

function corDoPercentual(p: number | null) {
  if (p === null) return undefined;
  if (p >= 75) return "FF1E8E7A"; // teal
  if (p >= 50) return "FFB08900"; // amarelo escuro
  return "FFB5533C"; // terracota
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.nucleoId || !PERMITIDOS.includes(session.user.role)) {
    return new Response("Não autorizado.", { status: 403 });
  }

  const [estudantes, nucleoNome] = await Promise.all([
    getFrequenciaDetalhadaDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const { workbook, sheet, primeiraLinhaDeDados, corFaixa } = await criarPlanilhaComCabecalho({
    titulo: "Rede Esperançar — Frequência detalhada",
    subtitulo: `${nucleoNome} · gerado em ${hoje}`,
    colunas: [
      { header: "Nome", width: 34 },
      { header: "Turma", width: 26 },
      { header: "Frequência geral", width: 16 },
      { header: "Frequência no mês", width: 18 },
      { header: "Aulas registradas", width: 16 },
    ],
  });

  estudantes.forEach((e) => {
    const row = sheet.addRow([
      e.nome,
      e.turmaNome,
      e.percentual !== null ? e.percentual / 100 : null,
      e.percentualMes !== null ? e.percentualMes / 100 : null,
      e.registros.length,
    ]);
    const celulaGeral = row.getCell(3);
    const celulaMes = row.getCell(4);
    celulaGeral.numFmt = "0%";
    celulaMes.numFmt = "0%";
    const corGeral = corDoPercentual(e.percentual);
    if (corGeral) celulaGeral.font = { bold: true, color: { argb: corGeral } };
    const corMes = corDoPercentual(e.percentualMes);
    if (corMes) celulaMes.font = { bold: true, color: { argb: corMes } };
  });

  zebrarLinhas(sheet, primeiraLinhaDeDados, primeiraLinhaDeDados + estudantes.length - 1, corFaixa);

  const bytes = await workbook.xlsx.writeBuffer();
  const nomeArquivo = `frequencia-${nucleoNome.toLowerCase().replace(/\s+/g, "-")}.xlsx`;

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
