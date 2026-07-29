import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRedacaoParaCorrigir } from "@/lib/queries/redacao";
import { CorrigirRedacaoForm } from "@/components/gestao/CorrigirRedacaoForm";
import { DiagnosticoIAButton } from "@/components/gestao/DiagnosticoIAButton";

const GESTAO_ROLES = ["PROFESSOR", "COORDENACAO", "ADMIN"];

export default async function CorrigirRedacaoPage({
  params,
}: {
  params: Promise<{ redacaoId: string }>;
}) {
  const { redacaoId } = await params;
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (!GESTAO_ROLES.includes(session.user.role)) redirect("/gestao");

  const redacao = await getRedacaoParaCorrigir(redacaoId, session.user.nucleoId);
  if (!redacao) notFound();

  return (
    <div>
      <Link href="/gestao/redacoes" className="text-sm font-bold text-ink-soft hover:text-ink">
        ← Redações
      </Link>
      <div className="mb-5 mt-3">
        <span className="font-mono text-[10px] font-bold uppercase text-terracotta">{redacao.tema.prova}</span>
        <h1 className="font-display text-2xl">{redacao.estudante.user.nome}</h1>
        <p className="text-sm text-ink-soft">{redacao.tema.titulo}</p>
      </div>

      {redacao.tema.textoMotivador && (
        <div className="bg-paper border border-border rounded-2xl p-4 mb-5 text-sm text-ink-soft whitespace-pre-line">
          {redacao.tema.textoMotivador}
        </div>
      )}

      {redacao.status === "CORRIGIDA" ? (
        <div className="bg-surface border border-border rounded-[18px] p-5">
          <p className="text-sm font-bold text-teal mb-2">
            Já corrigida — nota total {redacao.notaTotal}
          </p>
          <div className="text-sm whitespace-pre-line">{redacao.textoEnviado}</div>
          {redacao.comentarioGeral && (
            <p className="text-sm text-ink-soft mt-4 border-t border-border pt-3">
              {redacao.comentarioGeral}
            </p>
          )}
        </div>
      ) : (
        <>
          <DiagnosticoIAButton redacaoId={redacao.id} diagnosticoInicial={redacao.diagnosticoIA} />
          <CorrigirRedacaoForm
            redacaoId={redacao.id}
            textoEnviado={redacao.textoEnviado}
            prova={redacao.tema.prova}
          />
        </>
      )}
    </div>
  );
}
