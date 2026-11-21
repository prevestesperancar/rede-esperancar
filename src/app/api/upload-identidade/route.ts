import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { supabaseAdmin, SUPABASE_UPLOADS_BUCKET } from "@/lib/supabase";

const ROLES_IDENTIDADE = ["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

// Gera URL assinada pro navegador enviar a logo/foto direto pro Supabase.
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user || !ROLES_IDENTIDADE.includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { nomeArquivo, tipo } = (await request.json()) as { nomeArquivo?: string; tipo?: "logo" | "foto" };
  if (!nomeArquivo || !tipo) {
    return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  }

  const extensao = nomeArquivo.includes(".") ? nomeArquivo.split(".").pop() : "png";
  const caminho = `identidade/${session.user.nucleoId ?? "sem-nucleo"}/${tipo}-${randomUUID()}.${extensao}`;

  const { data, error } = await supabaseAdmin.storage
    .from(SUPABASE_UPLOADS_BUCKET)
    .createSignedUploadUrl(caminho);
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Erro ao gerar upload." }, { status: 400 });
  }

  const { data: pub } = supabaseAdmin.storage.from(SUPABASE_UPLOADS_BUCKET).getPublicUrl(caminho);
  return NextResponse.json({ path: data.path, token: data.token, publicUrl: pub.publicUrl });
}
