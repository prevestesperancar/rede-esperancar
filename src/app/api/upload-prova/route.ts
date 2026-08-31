import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { supabaseAdmin, SUPABASE_UPLOADS_BUCKET } from "@/lib/supabase";

const COORDENACAO_ROLES = ["COORDENACAO", "ADMIN"];

// Upload direto do navegador pro Supabase Storage — os PDFs de prova passam
// de 4.5MB, que é o limite de corpo de requisição das funções do Vercel. Um
// server action ou rota normal nunca recebe o arquivo inteiro; aqui só
// geramos uma URL assinada, e o navegador manda o arquivo direto pro Storage.
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user || !COORDENACAO_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { nomeArquivo } = (await request.json()) as { nomeArquivo?: string };
  if (!nomeArquivo) {
    return NextResponse.json({ error: "Nome do arquivo é obrigatório." }, { status: 400 });
  }

  const extensao = nomeArquivo.includes(".") ? nomeArquivo.split(".").pop() : "pdf";
  const caminho = `provas/${randomUUID()}.${extensao}`;

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
