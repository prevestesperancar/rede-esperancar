import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTodosTemas, getRedacoesPendentes, getRedacoesCorrigidas } from "@/lib/queries/redacao";
import { alternarTemaAtivo } from "@/actions/redacao";
import { NovoTemaRedacaoForm } from "@/components/gestao/NovoTemaRedacaoForm";

const GESTAO_ROLES = ["PROFESSOR", "COORDENACAO", "ADMIN"];

export default async function GestaoRedacoesPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (!GESTAO_ROLES.includes(session.user.role)) redirect("/gestao");

  const [temas, pendentes, corrigidas] = await Promise.all([
    getTodosTemas(),
    getRedacoesPendentes(session.user.nucleoId),
    getRedacoesCorrigidas(session.user.nucleoId),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Redação</h1>
      <p className="text-sm text-ink-soft mb-6">
        Crie temas de redação (ENEM ou UERJ) e corrija os textos enviados pelos estudantes.
      </p>

      <NovoTemaRedacaoForm />

      <div className="bg-surface border border-border rounded-[18px] p-5 mb-6">
        <h3 className="font-extrabold text-[15px] mb-3">Temas cadastrados</h3>
        <div className="flex flex-col gap-2">
          {temas.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-b-0">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-terracotta">{t.prova}</span>
                <div className="font-bold text-sm">{t.titulo}</div>
                <div className="text-xs text-ink-faint">{t._count.redacoes} redação(ões) recebida(s)</div>
              </div>
              <form action={async () => { "use server"; await alternarTemaAtivo(t.id); }}>
                <button
                  type="submit"
                  className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    t.ativo ? "bg-teal/10 text-teal" : "bg-ink-faint/10 text-ink-faint"
                  }`}
                >
                  {t.ativo ? "Ativo" : "Inativo"}
                </button>
              </form>
            </div>
          ))}
          {temas.length === 0 && <p className="text-sm text-ink-faint">Nenhum tema criado ainda.</p>}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-5 mb-6">
        <h3 className="font-extrabold text-[15px] mb-3">
          Redações pendentes de correção
          {pendentes.length > 0 && (
            <span className="ml-2 text-[11px] font-bold uppercase text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-full">
              {pendentes.length}
            </span>
          )}
        </h3>
        <div className="flex flex-col gap-2">
          {pendentes.map((r) => (
            <Link
              key={r.id}
              href={`/gestao/redacoes/${r.id}`}
              className="flex items-center justify-between gap-3 py-2.5 px-3 -mx-1 rounded-xl border-b border-border last:border-b-0 hover:bg-paper"
            >
              <div>
                <div className="font-bold text-sm">{r.estudante.user.nome}</div>
                <div className="text-xs text-ink-faint">
                  {r.tema.prova} · {r.tema.titulo} · {r.createdAt.toLocaleDateString("pt-BR")}
                </div>
              </div>
              <span className="text-xs font-bold text-terracotta">Corrigir →</span>
            </Link>
          ))}
          {pendentes.length === 0 && <p className="text-sm text-ink-faint">Nenhuma redação pendente.</p>}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-5">
        <h3 className="font-extrabold text-[15px] mb-3">Últimas corrigidas</h3>
        <div className="flex flex-col gap-2">
          {corrigidas.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-b-0">
              <div>
                <div className="font-bold text-sm">{r.estudante.user.nome}</div>
                <div className="text-xs text-ink-faint">{r.tema.prova} · {r.tema.titulo}</div>
              </div>
              <span className="font-mono font-bold text-sm text-teal">{r.notaTotal}</span>
            </div>
          ))}
          {corrigidas.length === 0 && <p className="text-sm text-ink-faint">Nenhuma redação corrigida ainda.</p>}
        </div>
      </div>
    </div>
  );
}
