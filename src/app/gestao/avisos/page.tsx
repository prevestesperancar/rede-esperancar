import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAvisosDoNucleo, getTurmasDoNucleo, getNucleoNome } from "@/lib/queries/gestao";
import { NovoAvisoForm } from "@/components/gestao/NovoAvisoForm";
import { ApagarAvisoButton } from "@/components/gestao/ApagarAvisoButton";

export default async function GestaoAvisosPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const [avisos, turmas, nucleoNome] = await Promise.all([
    getAvisosDoNucleo(session.user.nucleoId),
    getTurmasDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
            {nucleoNome}
          </div>
          <h1 className="font-display text-2xl">Avisos</h1>
        </div>
      </div>

      <NovoAvisoForm turmas={turmas.map((t) => ({ id: t.id, nome: t.nome }))} />

      <div className="bg-surface border border-border rounded-[18px] p-5">
        {avisos.map((a) => (
          <div key={a.id} className="flex items-start gap-2.5 py-3 border-b border-border last:border-b-0">
            <div className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm">
                <b>{a.titulo}</b> — {a.corpo}
              </div>
              <div className="text-[11px] text-ink-faint font-mono mt-0.5">
                {a.createdAt.toLocaleDateString("pt-BR")}
                {a.turma ? ` · ${a.turma.nome}` : ""}
              </div>
            </div>
            <ApagarAvisoButton avisoId={a.id} />
          </div>
        ))}
        {avisos.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum aviso ainda.</p>
        )}
      </div>
    </div>
  );
}
