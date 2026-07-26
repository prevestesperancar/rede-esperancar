import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFormularioDetalhe } from "@/lib/queries/formularios";
import type { Campo } from "@/actions/formularios";

const PERMITIDOS = ["COORDENACAO", "ADMIN"];

function csvEscape(valor: string) {
  return `"${valor.replace(/"/g, '""')}"`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formularioId: string }> }
) {
  const { formularioId } = await params;
  const session = await auth();
  if (!session?.user?.nucleoId || !PERMITIDOS.includes(session.user.role)) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const formulario = await getFormularioDetalhe(formularioId, session.user.nucleoId);
  if (!formulario) {
    return new NextResponse("Formulário não encontrado.", { status: 404 });
  }

  const campos: Campo[] = JSON.parse(formulario.campos);
  const cabecalho = ["Enviado em", ...campos.map((c) => c.label)];
  const linhas = formulario.respostas.map((r) => {
    const dados: Record<string, string> = JSON.parse(r.respostas);
    return [r.createdAt.toISOString(), ...campos.map((c) => dados[c.id] ?? "")];
  });

  const csv = [cabecalho, ...linhas]
    .map((linha) => linha.map((v) => csvEscape(String(v))).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${formulario.titulo.replace(/[^a-z0-9]/gi, "-")}.csv"`,
    },
  });
}
