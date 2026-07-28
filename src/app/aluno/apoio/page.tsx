import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { getApoioDoNucleo, getSolicitacoesDoEstudante } from "@/lib/queries/agendamento";
import { SolicitarApoioForm } from "@/components/aluno/SolicitarApoioForm";
import { MinhasSolicitacoesList } from "@/components/aluno/MinhasSolicitacoesList";

export default async function AlunoApoioPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const [apoios, solicitacoes, nucleo] = session.user.nucleoId
    ? await Promise.all([
        getApoioDoNucleo(session.user.nucleoId),
        getSolicitacoesDoEstudante(estudante.id),
        prisma.nucleo.findUnique({
          where: { id: session.user.nucleoId },
          select: { linkApoioPsicossocial: true },
        }),
      ])
    : [[], [], null];

  const solicitacoesApoio = solicitacoes.filter((s) => s.tipo === "APOIO");

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Apoio psicossocial</h1>
      <p className="text-sm font-semibold text-ink-soft mb-6">
        Um espaço para conversar sobre o que estiver pesando
      </p>

      <div className="bg-surface border border-border rounded-2xl p-4 mb-5">
        <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-2">Contato</div>
        {apoios.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum contato de apoio cadastrado ainda.</p>
        )}
        {apoios.map((a) => (
          <div key={a.id} className="text-sm mb-1">
            <span className="font-bold">{a.nome}</span>
            {a.telefone && <span className="text-ink-soft"> · {a.telefone}</span>}
          </div>
        ))}
      </div>

      <SolicitarApoioForm />

      {solicitacoesApoio.length > 0 && (
        <div className="mt-5">
          <div className="font-bold text-sm mb-3">Minhas solicitações</div>
          <MinhasSolicitacoesList
            solicitacoes={solicitacoesApoio}
            link={nucleo?.linkApoioPsicossocial ?? null}
          />
        </div>
      )}
    </div>
  );
}
