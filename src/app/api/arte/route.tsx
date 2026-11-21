import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MODELOS, type Modelo, LIMITE_TITULO, LIMITE_SUBTITULO, LIMITE_DATA } from "@/lib/arte";
import { ArteCartaz, ArteFoto, type Estilo } from "@/lib/arte-layout";

export const dynamic = "force-dynamic";

const ROLES_ARTE = ["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

async function carregarFontes() {
  const [m700, m900] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/Montserrat-700.woff")),
    readFile(path.join(process.cwd(), "public/fonts/Montserrat-900.woff")),
  ]);
  return [
    { name: "Montserrat", data: m700, weight: 700 as const, style: "normal" as const },
    { name: "Montserrat", data: m900, weight: 900 as const, style: "normal" as const },
  ];
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
  const estilo: Estilo = url.searchParams.get("estilo") === "foto" ? "foto" : "cartaz";

  const titulo = (url.searchParams.get("titulo") ?? "").slice(0, LIMITE_TITULO);
  const subtitulo = (url.searchParams.get("subtitulo") ?? "").slice(0, LIMITE_SUBTITULO);
  const data = (url.searchParams.get("data") ?? "").slice(0, LIMITE_DATA);
  const indiceFoto = Number(url.searchParams.get("foto") ?? 0);

  const [identidade, nucleo, fontes] = await Promise.all([
    prisma.identidadeNucleo.findUnique({ where: { nucleoId: session.user.nucleoId } }),
    prisma.nucleo.findUnique({ where: { id: session.user.nucleoId }, select: { nome: true } }),
    carregarFontes(),
  ]);

  // Só usa imagens cadastradas na identidade do próprio núcleo.
  const dados = {
    largura: formato.width,
    altura: formato.height,
    estilo,
    titulo,
    subtitulo,
    data,
    nomeNucleo: nucleo?.nome ?? "Esperançar",
    logo: identidade?.logoUrl ?? null,
    foto: Number.isInteger(indiceFoto) ? identidade?.fotos[indiceFoto] ?? null : null,
  };

  const arte = estilo === "foto" ? ArteFoto(dados) : ArteCartaz(dados);
  return new ImageResponse(arte as React.ReactElement, { width: formato.width, height: formato.height, fonts: fontes });
}
