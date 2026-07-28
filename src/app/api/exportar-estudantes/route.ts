import { auth } from "@/lib/auth";
import { getEstudantesDoNucleo, getNucleoNome } from "@/lib/queries/gestao";
import { toCsv } from "@/lib/csv";

const STATUS_LABEL: Record<string, string> = {
  EM_AVALIACAO: "Em avaliação",
  PRESENTE: "Ativo",
  FALTANTE: "Faltante",
  DESISTENTE: "Desistente",
  TRANSFERIDO: "Transferido",
};

const PERMITIDOS = ["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.nucleoId || !PERMITIDOS.includes(session.user.role)) {
    return new Response("Não autorizado.", { status: 403 });
  }

  const [matriculas, nucleoNome] = await Promise.all([
    getEstudantesDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  const linhas = [
    ["Nome", "E-mail", "Telefone", "Turma", "Período", "Status", "Curso desejado"],
    ...matriculas.map((m) => [
      m.estudante.user.nome,
      m.estudante.user.email,
      m.estudante.user.telefone ?? "",
      m.turma.nome,
      m.turma.periodo,
      STATUS_LABEL[m.estudante.status] ?? m.estudante.status,
      m.estudante.cursoDesejado ?? "",
    ]),
  ];

  const csv = "﻿" + toCsv(linhas);
  const nomeArquivo = `estudantes-${nucleoNome.toLowerCase().replace(/\s+/g, "-")}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
