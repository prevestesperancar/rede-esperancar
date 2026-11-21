import { ImageResponse } from "next/og";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MODELOS, type Modelo, LIMITE_TITULO, LIMITE_SUBTITULO, LIMITE_DATA } from "@/lib/arte";

export const dynamic = "force-dynamic";

const ROLES_ARTE = ["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];
const INK = "#14161f";
const PAPER = "#f6f7f2";
const PAPER_SOFT = "#c9ccd6";
const DESTAQUE_PADRAO = "#f19700";

// Escolhe texto claro ou escuro conforme a luminosidade da cor de fundo.
function textoSobre(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminosidade = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminosidade > 0.6 ? INK : PAPER;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.nucleoId || !ROLES_ARTE.includes(session.user.role)) {
    return new Response("Não autorizado.", { status: 403 });
  }

  const url = new URL(request.url);
  const modelo = (url.searchParams.get("modelo") ?? "post") as Modelo;
  const formato = MODELOS[modelo];
  if (!formato) return new Response("Modelo inválido.", { status: 400 });

  const titulo = (url.searchParams.get("titulo") ?? "").slice(0, LIMITE_TITULO);
  const subtitulo = (url.searchParams.get("subtitulo") ?? "").slice(0, LIMITE_SUBTITULO);
  const data = (url.searchParams.get("data") ?? "").slice(0, LIMITE_DATA);
  const indiceFoto = Number(url.searchParams.get("foto") ?? 0);

  const [identidade, nucleo] = await Promise.all([
    prisma.identidadeNucleo.findUnique({ where: { nucleoId: session.user.nucleoId } }),
    prisma.nucleo.findUnique({ where: { id: session.user.nucleoId }, select: { nome: true } }),
  ]);

  // Só usa imagens cadastradas na identidade do próprio núcleo.
  const logo = identidade?.logoUrl ?? null;
  const foto = Number.isInteger(indiceFoto) ? identidade?.fotos[indiceFoto] ?? null : null;
  const destaque = identidade?.paleta?.[0] ?? DESTAQUE_PADRAO;
  const ehStory = modelo === "story";

  const margem = ehStory ? 90 : 64;
  const tituloTamanho = ehStory ? 120 : 84;
  const subtituloTamanho = ehStory ? 50 : 36;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: INK,
          padding: `${margem}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: ehStory ? 180 : 130,
            flexShrink: 0,
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} style={{ height: "100%", objectFit: "contain", objectPosition: "left center" }} />
          ) : (
            <div style={{ display: "flex", fontSize: 48, fontWeight: 800, color: PAPER }}>
              {nucleo?.nome ?? "Esperançar"}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            minHeight: 0,
            marginTop: ehStory ? 60 : 40,
            borderRadius: 36,
            overflow: "hidden",
            background: "#1f2230",
          }}
        >
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, marginTop: ehStory ? 64 : 40 }}>
          <div style={{ display: "flex", width: ehStory ? 120 : 90, height: 10, borderRadius: 5, background: destaque }} />
          {titulo ? (
            <div
              style={{
                display: "flex",
                marginTop: ehStory ? 36 : 26,
                fontSize: tituloTamanho,
                fontWeight: 800,
                color: PAPER,
                lineHeight: 1.02,
              }}
            >
              {titulo}
            </div>
          ) : null}
          {subtitulo ? (
            <div
              style={{
                display: "flex",
                marginTop: ehStory ? 28 : 18,
                fontSize: subtituloTamanho,
                color: PAPER_SOFT,
                lineHeight: 1.3,
              }}
            >
              {subtitulo}
            </div>
          ) : null}
        </div>

        {data ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: ehStory ? 52 : 32,
              background: destaque,
              borderRadius: 999,
              padding: ehStory ? "26px 52px" : "16px 36px",
              fontSize: ehStory ? 52 : 36,
              fontWeight: 800,
              color: textoSobre(destaque),
            }}
          >
            {data}
          </div>
        ) : null}
      </div>
    ),
    { width: formato.width, height: formato.height }
  );
}
