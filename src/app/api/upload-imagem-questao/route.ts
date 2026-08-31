import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/auth";

const GESTAO_ROLES = ["PROFESSOR", "COORDENACAO", "ADMIN"];

// Upload direto do navegador pro Vercel Blob, igual /api/upload-prova — só que
// aceitando imagens (foto/gráfico/mapa de uma questão do Banco de Questões).
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user || !GESTAO_ROLES.includes(session.user.role)) {
          throw new Error("Não autorizado.");
        }
        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro no upload." },
      { status: 400 }
    );
  }
}
