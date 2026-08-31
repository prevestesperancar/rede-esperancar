import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { supabaseAdmin, SUPABASE_UPLOADS_BUCKET } from "@/lib/supabase";

const GESTAO_ROLES = ["PROFESSOR", "COORDENACAO", "ADMIN"];

// Upload direto do navegador pro Supabase Storage, igual /api/upload-prova —
// só que pra imagens (foto/gráfico/mapa de uma questão do Banco de Questões).
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user || !GESTAO_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { nomeArquivo } = (await request.json()) as { nomeArquivo?: string };
  if (!nomeArquivo) {
    return NextResponse.json({ error: "Nome do arquivo é obrigatório." }, { status: 400 });
  }

  const extensao = nomeArquivo.includes(".") ? nomeArquivo.split(".").pop() : "png";
  const caminho = `questoes/${randomUUID()}.${extensao}`;

  const { data, error } = await supabaseAdmin.storage
    .from(SUPABASE_UPLOADS_BUCKET)
    .createSignedUploadUrl(caminho);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Erro ao gerar upload." }, { status: 400 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(SUPABASE_UPLOADS_BUCKET)
    .getPublicUrl(caminho);

  return NextResponse.json({
    path: data.path,
    token: data.token,
    publicUrl: publicUrlData.publicUrl,
  });
}
