import { ImageResponse } from "next/og";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MODELOS, type Modelo, LIMITE_TITULO, LIMITE_SUBTITULO, LIMITE_DATA } from "@/lib/arte";

export const dynamic = "force-dynamic";

const ROLES_ARTE = ["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];
const INK = "#14161f";
const PAPER = "#f6f7f2";
const YELLOW = "#f19700";
const INK_SOFT = "#3a3d4a";

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
  const ehStory = modelo === "story";
  // Cor de destaque vem da paleta do núcleo (primeira cor); se não houver, usa o amarelo padrão.
  const destaque = identidade?.paleta?.[0] ?? YELLOW;

  const fotoAltura = ehStory ? 1040 : 600;
  const tituloTamanho = ehStory ? 104 : 84;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          padding: ehStory ? "110px 70px 120px" : "56px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: ehStory ? 170 : 120 }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} style={{ height: "100%", objectFit: "contain" }} />
          ) : (
            <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: INK }}>
              {nucleo?.nome ?? "Esperançar"}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            height: fotoAltura,
            marginTop: ehStory ? 50 : 36,
            borderRadius: 36,
            overflow: "hidden",
            background: INK,
          }}
        >
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: ehStory ? 60 : 40, flex: 1 }}>
          {titulo ? (
            <div style={{ display: "flex", fontSize: tituloTamanho, fontWeight: 800, color: INK, lineHeight: 1.05 }}>
              {titulo}
            </div>
          ) : null}
          {subtitulo ? (
            <div style={{ display: "flex", marginTop: 20, fontSize: ehStory ? 44 : 36, color: INK_SOFT, lineHeight: 1.25 }}>
              {subtitulo}
            </div>
          ) : null}
        </div>

        {data ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: destaque,
              borderRadius: 20,
              padding: "18px 32px",
              fontSize: 36,
              fontWeight: 800,
              color: INK,
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
