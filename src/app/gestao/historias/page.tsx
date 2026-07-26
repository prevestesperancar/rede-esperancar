import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDepoimentosDoNucleo, getNucleoNome } from "@/lib/queries/gestao";
import { apagarDepoimento } from "@/actions/gestao";
import { NovoDepoimentoForm } from "@/components/gestao/NovoDepoimentoForm";
import { ApagarItemButton } from "@/components/gestao/ApagarItemButton";

export default async function GestaoHistoriasPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const [depoimentos, nucleoNome] = await Promise.all([
    getDepoimentosDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
            {nucleoNome}
          </div>
          <h1 className="font-display text-2xl">Histórias da rede</h1>
          <p className="text-sm text-ink-soft mt-1">
            Aparecem na Home do site público.
          </p>
        </div>
      </div>

      <NovoDepoimentoForm />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {depoimentos.map((d) => (
          <div key={d.id} className="bg-surface border border-border rounded-[18px] p-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-ink text-paper flex items-center justify-center font-display text-xs flex-shrink-0">
                {d.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.fotoUrl} alt={d.nome} className="w-full h-full object-cover" />
                ) : (
                  d.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()
                )}
              </div>
              <div>
                <div className="font-extrabold text-sm">{d.nome}</div>
                <div className="text-xs text-ink-faint">
                  {[d.curso, d.universidade].filter(Boolean).join(" · ")}
                </div>
              </div>
            </div>
            <p className="text-sm text-ink-soft">&ldquo;{d.quote}&rdquo;</p>
            <div className="mt-2.5 text-right">
              <ApagarItemButton
                id={d.id}
                action={apagarDepoimento}
                confirmMessage="Apagar esta história?"
              />
            </div>
          </div>
        ))}
        {depoimentos.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhuma história cadastrada ainda.</p>
        )}
      </div>
    </div>
  );
}
