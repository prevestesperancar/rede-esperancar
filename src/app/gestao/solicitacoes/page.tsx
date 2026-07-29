import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getSolicitacoesApoioPendentes,
  getSolicitacoesApoioAguardandoEscolha,
  getSolicitacoesApoioConfirmadas,
  getSolicitacoesPendentesDoProfessor,
  getSolicitacoesAguardandoEscolhaDoProfessor,
  getSolicitacoesConfirmadasDoProfessor,
} from "@/lib/queries/agendamento";
import { getNucleoNome } from "@/lib/queries/gestao";
import { SolicitacoesPendentesCard } from "@/components/gestao/SolicitacoesPendentesCard";
import { SolicitacoesAguardandoEscolhaCard } from "@/components/gestao/SolicitacoesAguardandoEscolhaCard";
import { SolicitacoesConfirmadasCard } from "@/components/gestao/SolicitacoesConfirmadasCard";

const PERMITIDOS = ["APOIO_PSICOSSOCIAL", "PROFESSOR", "ADMIN"];

export default async function SolicitacoesPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (!PERMITIDOS.includes(session.user.role)) redirect("/gestao");

  const isProfessor = session.user.role === "PROFESSOR";

  const [pendentes, aguardando, confirmadas, nucleoNome, nucleo] = await Promise.all([
    isProfessor
      ? getSolicitacoesPendentesDoProfessor(session.user.id)
      : getSolicitacoesApoioPendentes(session.user.nucleoId),
    isProfessor
      ? getSolicitacoesAguardandoEscolhaDoProfessor(session.user.id)
      : getSolicitacoesApoioAguardandoEscolha(session.user.nucleoId),
    isProfessor
      ? getSolicitacoesConfirmadasDoProfessor(session.user.id)
      : getSolicitacoesApoioConfirmadas(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
    prisma.nucleo.findUnique({
      where: { id: session.user.nucleoId },
      select: { linkApoioPsicossocial: true, linkMonitoriaProfessor: true },
    }),
  ]);

  const link = isProfessor ? nucleo?.linkMonitoriaProfessor ?? null : nucleo?.linkApoioPsicossocial ?? null;

  return (
    <div>
      <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
        {nucleoNome}
      </div>
      <h1 className="font-display text-2xl mb-6">
        Solicitações de {isProfessor ? "monitoria" : "apoio psicossocial"}
      </h1>

      <SolicitacoesPendentesCard titulo="Aguardando sua resposta" solicitacoes={pendentes} />
      <SolicitacoesAguardandoEscolhaCard
        titulo="Aguardando o estudante escolher um horário"
        solicitacoes={aguardando}
      />
      <SolicitacoesConfirmadasCard
        titulo={isProfessor ? "Monitorias confirmadas" : "Conversas confirmadas"}
        solicitacoes={confirmadas}
        link={link}
      />

      {pendentes.length === 0 && aguardando.length === 0 && confirmadas.length === 0 && (
        <p className="text-sm text-ink-faint">Nenhuma solicitação por enquanto.</p>
      )}
    </div>
  );
}
