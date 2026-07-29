import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getSolicitacoesApoioPendentes,
  getSolicitacoesApoioAguardandoEscolha,
  getSolicitacoesApoioConfirmadas,
} from "@/lib/queries/agendamento";
import { getNucleoNome } from "@/lib/queries/gestao";
import { SolicitacoesPendentesCard } from "@/components/gestao/SolicitacoesPendentesCard";
import { SolicitacoesAguardandoEscolhaCard } from "@/components/gestao/SolicitacoesAguardandoEscolhaCard";
import { SolicitacoesConfirmadasCard } from "@/components/gestao/SolicitacoesConfirmadasCard";

const PERMITIDOS = ["APOIO_PSICOSSOCIAL", "ADMIN"];

export default async function SolicitacoesApoioPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (!PERMITIDOS.includes(session.user.role)) redirect("/gestao");

  const [pendentes, aguardando, confirmadas, nucleoNome, nucleo] = await Promise.all([
    getSolicitacoesApoioPendentes(session.user.nucleoId),
    getSolicitacoesApoioAguardandoEscolha(session.user.nucleoId),
    getSolicitacoesApoioConfirmadas(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
    prisma.nucleo.findUnique({ where: { id: session.user.nucleoId }, select: { linkApoioPsicossocial: true } }),
  ]);

  return (
    <div>
      <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
        {nucleoNome}
      </div>
      <h1 className="font-display text-2xl mb-6">Solicitações de apoio psicossocial</h1>

      <SolicitacoesPendentesCard titulo="Aguardando sua resposta" solicitacoes={pendentes} />
      <SolicitacoesAguardandoEscolhaCard
        titulo="Aguardando o estudante escolher um horário"
        solicitacoes={aguardando}
      />
      <SolicitacoesConfirmadasCard
        titulo="Conversas confirmadas"
        solicitacoes={confirmadas}
        link={nucleo?.linkApoioPsicossocial ?? null}
      />

      {pendentes.length === 0 && aguardando.length === 0 && confirmadas.length === 0 && (
        <p className="text-sm text-ink-faint">Nenhuma solicitação por enquanto.</p>
      )}
    </div>
  );
}
