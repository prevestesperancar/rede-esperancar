import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { prisma } from "@/lib/prisma";

export default async function AlunoMateriaisPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const materiais = session.user.nucleoId
    ? await prisma.material.findMany({
        where: { nucleoId: session.user.nucleoId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Materiais</h1>
      <p className="text-sm font-semibold text-ink-soft mb-6">
        Tudo liberado pra sua turma
      </p>

      <div className="flex flex-col gap-3.5">
        {materiais.map((m) => (
          <a
            key={m.id}
            href={m.arquivoUrl}
            className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-extrabold text-sm">{m.titulo}</div>
              <div className="text-xs text-ink-soft mt-0.5">
                {m.descricao}
              </div>
            </div>
            <span className="font-bold text-xs bg-ink text-paper px-3.5 py-2 rounded-full flex-shrink-0">
              Abrir
            </span>
          </a>
        ))}
        {materiais.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum material ainda.</p>
        )}
      </div>
    </div>
  );
}
