import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { getSolicitacoesDoEstudante } from "@/lib/queries/agendamento";
import { MinhasSolicitacoesList } from "@/components/aluno/MinhasSolicitacoesList";

export default async function AlunoReunioesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const [solicitacoes, nucleo] = session.user.nucleoId
    ? await Promise.all([
        getSolicitacoesDoEstudante(estudante.id),
        prisma.nucleo.findUnique({
          where: { id: session.user.nucleoId },
          select: { linkMonitoriaProfessor: true, linkApoioPsicossocial: true },
        }),
      ])
    : [[], null];

  const solicitacoesMonitoria = solicitacoes.filter((s) => s.tipo === "MONITORIA");
  const solicitacoesApoio = solicitacoes.filter((s) => s.tipo === "APOIO");

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Minhas reuniões</h1>
      <p className="text-sm font-semibold text-ink-soft mb-6">
        Monitorias e conversas com o apoio psicossocial que você solicitou
      </p>

      <div className="font-bold text-sm mb-3">Monitorias</div>
      <MinhasSolicitacoesList
        solicitacoes={solicitacoesMonitoria}
        link={nucleo?.linkMonitoriaProfessor ?? null}
        permitirRemarcar
      />

      <div className="font-bold text-sm mb-3 mt-7">Apoio psicossocial</div>
      <MinhasSolicitacoesList
        solicitacoes={solicitacoesApoio}
        link={nucleo?.linkApoioPsicossocial ?? null}
        permitirRemarcar
      />
    </div>
  );
}
