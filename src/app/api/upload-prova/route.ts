import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/auth";

const COORDENACAO_ROLES = ["COORDENACAO", "ADMIN"];

// Upload direto do navegador pro Vercel Blob — os PDFs de prova passam de
// 4.5MB, que é o limite de corpo de requisição das funções do Vercel. Um
// server action ou rota normal nunca recebe o arquivo inteiro; aqui só
// geramos um token de upload, e o navegador manda o arquivo direto pro Blob.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user || !COORDENACAO_ROLES.includes(session.user.role)) {
          throw new Error("Não autorizado.");
        }
        return {
          allowedContentTypes: ["application/pdf"],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Sem uso — o cliente salva a URL explicitamente depois do upload
        // (via server action), não dependemos do callback assíncrono do Blob.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro no upload." },
      { status: 400 }
    );
  }
}
