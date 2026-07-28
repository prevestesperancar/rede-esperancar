import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { getRedacaoDoEstudantePorId } from "@/lib/queries/redacao";
import { RedacaoCorrigidaView } from "@/components/aluno/RedacaoCorrigidaView";

export default async function AlunoRedacaoDetalhePage({
  params,
}: {
  params: Promise<{ redacaoId: string }>;
}) {
  const { redacaoId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const redacao = await getRedacaoDoEstudantePorId(redacaoId, estudante.id);
  if (!redacao) notFound();

  return (
    <div>
      <div className="mb-5">
        <span className="font-mono text-[10px] font-bold uppercase text-terracotta">{redacao.tema.prova}</span>
        <h1 className="font-display text-2xl">{redacao.tema.titulo}</h1>
      </div>

      {redacao.status === "ENVIADA" ? (
        <div className="bg-surface border border-border rounded-[18px] p-5">
          <p className="text-sm font-bold text-terracotta mb-3">Aguardando correção da professora.</p>
          <div className="text-sm whitespace-pre-line">{redacao.textoEnviado}</div>
        </div>
      ) : (
        <RedacaoCorrigidaView
          textoEnviado={redacao.textoEnviado}
          notasComponentes={redacao.notasComponentes}
          notaTotal={redacao.notaTotal}
          comentarioGeral={redacao.comentarioGeral}
          marcacoes={redacao.marcacoes}
        />
      )}
    </div>
  );
}
