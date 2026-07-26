import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMateriaisDoNucleoGestao, getNucleoNome } from "@/lib/queries/gestao";
import { apagarMaterial } from "@/actions/gestao";
import { NovoMaterialForm } from "@/components/gestao/NovoMaterialForm";
import { ApagarItemButton } from "@/components/gestao/ApagarItemButton";

export default async function GestaoMateriaisPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const [materiais, nucleoNome] = await Promise.all([
    getMateriaisDoNucleoGestao(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
            {nucleoNome}
          </div>
          <h1 className="font-display text-2xl">Materiais</h1>
        </div>
      </div>

      <NovoMaterialForm />

      <div className="bg-surface border border-border rounded-[18px] p-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiais.map((m) => (
            <div key={m.id} className="border border-border rounded-2xl p-4">
              <div className="font-extrabold text-sm mb-1">{m.titulo}</div>
              <p className="text-xs text-ink-soft mb-2.5">{m.descricao}</p>
              <div className="flex items-center justify-between">
                <a href={m.arquivoUrl} className="text-xs font-bold text-terracotta">
                  Ver arquivo →
                </a>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    m.publico
                      ? "bg-teal/10 text-teal"
                      : "bg-ink-faint/10 text-ink-faint"
                  }`}
                >
                  {m.publico ? "Público" : "Interno"}
                </span>
              </div>
              <div className="mt-2.5 text-right">
                <ApagarItemButton
                  id={m.id}
                  action={apagarMaterial}
                  confirmMessage="Apagar este material?"
                />
              </div>
            </div>
          ))}
        </div>
        {materiais.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum material ainda.</p>
        )}
      </div>
    </div>
  );
}
