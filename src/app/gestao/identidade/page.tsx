import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNucleoNome } from "@/lib/queries/gestao";
import { IdentidadeForm } from "@/components/gestao/IdentidadeForm";

export default async function IdentidadePage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (!["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"].includes(session.user.role)) redirect("/gestao");

  const [identidade, nucleoNome] = await Promise.all([
    prisma.identidadeNucleo.findUnique({ where: { nucleoId: session.user.nucleoId } }),
    getNucleoNome(session.user.nucleoId),
  ]);

  return (
    <div>
      <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">{nucleoNome}</div>
      <h1 className="font-display text-2xl mb-1">Identidade do núcleo</h1>
      <p className="text-sm text-ink-soft mb-7">
        Logo e fotos do pré-vestibular, usadas pra montar as artes das redes sociais.
      </p>
      <IdentidadeForm logoUrl={identidade?.logoUrl ?? null} fotos={identidade?.fotos ?? []} />
    </div>
  );
}
