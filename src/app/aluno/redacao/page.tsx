import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { getTemasAtivos, getRedacoesDoEstudante } from "@/lib/queries/redacao";
import { EnviarRedacaoForm } from "@/components/aluno/EnviarRedacaoForm";

export default async function AlunoRedacaoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const [temas, minhasRedacoes] = await Promise.all([
    getTemasAtivos(),
    getRedacoesDoEstudante(estudante.id),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Redação</h1>
      <p className="text-sm font-semibold text-ink-soft mb-6">
        Escreva, envie e receba a correção da professora
      </p>

      <div className="mb-7">
        <EnviarRedacaoForm temas={temas} />
      </div>

      <div className="font-bold text-sm mb-3">Minhas redações</div>
      <div className="flex flex-col gap-3">
        {minhasRedacoes.map((r) => (
          <Link
            key={r.id}
            href={`/aluno/redacao/${r.id}`}
            className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between gap-3"
          >
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-terracotta">{r.tema.prova}</span>
              <div className="font-bold text-sm">{r.tema.titulo}</div>
              <div className="text-xs text-ink-faint">{r.createdAt.toLocaleDateString("pt-BR")}</div>
            </div>
            {r.status === "CORRIGIDA" ? (
              <span className="font-mono font-bold text-lg text-teal flex-shrink-0">{r.notaTotal}</span>
            ) : (
              <span className="text-[11px] font-bold uppercase text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-full flex-shrink-0">
                Aguardando correção
              </span>
            )}
          </Link>
        ))}
        {minhasRedacoes.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhuma redação enviada ainda.</p>
        )}
      </div>
    </div>
  );
}
