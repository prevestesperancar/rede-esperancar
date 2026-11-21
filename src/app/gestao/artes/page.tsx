import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNucleoNome } from "@/lib/queries/gestao";
import { GeradorArteForm } from "@/components/gestao/GeradorArteForm";

export default async function ArtesPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (!["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"].includes(session.user.role)) redirect("/gestao");

  const [identidade, nucleoNome] = await Promise.all([
    prisma.identidadeNucleo.findUnique({ where: { nucleoId: session.user.nucleoId } }),
    getNucleoNome(session.user.nucleoId),
  ]);

  const semIdentidade = !identidade?.logoUrl && (identidade?.fotos.length ?? 0) === 0;

  return (
    <div>
      <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">{nucleoNome}</div>
      <h1 className="font-display text-2xl mb-1">Gerar arte</h1>
      <p className="text-sm text-ink-soft mb-7">
        Monte uma arte de post ou story com a logo e as fotos do núcleo.
      </p>

      {semIdentidade ? (
        <p className="text-sm text-ink-faint">
          Antes, suba a logo e as fotos do núcleo em Gestão → Identidade.
        </p>
      ) : (
        <GeradorArteForm quantidadeFotos={identidade?.fotos.length ?? 0} />
      )}
    </div>
  );
}
