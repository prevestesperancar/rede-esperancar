import { auth } from "@/lib/auth";
import { getFrequenciaDetalhadaDoNucleo, getNucleoNome } from "@/lib/queries/gestao";
import { toCsv } from "@/lib/csv";

const PERMITIDOS = ["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.nucleoId || !PERMITIDOS.includes(session.user.role)) {
    return new Response("Não autorizado.", { status: 403 });
  }

  const [estudantes, nucleoNome] = await Promise.all([
    getFrequenciaDetalhadaDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  const linhas = [
    ["Nome", "Turma", "Frequência geral (%)", "Frequência no mês (%)", "Total de aulas registradas"],
    ...estudantes.map((e) => [
      e.nome,
      e.turmaNome,
      e.percentual ?? "",
      e.percentualMes ?? "",
      e.registros.length,
    ]),
  ];

  const csv = "﻿" + toCsv(linhas);
  const nomeArquivo = `frequencia-${nucleoNome.toLowerCase().replace(/\s+/g, "-")}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
