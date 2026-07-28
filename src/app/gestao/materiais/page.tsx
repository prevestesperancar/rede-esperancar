import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMateriaisDoNucleoGestao, getNucleoNome, getDisciplinasDoNucleo } from "@/lib/queries/gestao";
import { apagarMaterial } from "@/actions/gestao";
import { NovoMaterialForm } from "@/components/gestao/NovoMaterialForm";
import { ApagarItemButton } from "@/components/gestao/ApagarItemButton";

const TIPO_LABEL: Record<string, string> = {
  SLIDE: "📊 Slide",
  EXERCICIO: "📝 Exercício",
  VIDEO: "🎬 Vídeo",
  OUTRO: "📎 Outro",
};

export default async function GestaoMateriaisPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const [materiais, nucleoNome, disciplinas] = await Promise.all([
    getMateriaisDoNucleoGestao(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
    getDisciplinasDoNucleo(session.user.nucleoId),
  ]);

  const grupos = new Map<string, typeof materiais>();
  for (const m of materiais) {
    const chave = m.disciplina?.nome ?? "Sem disciplina";
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(m);
  }

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

      <NovoMaterialForm disciplinas={disciplinas} />

      {materiais.length === 0 && (
        <p className="text-sm text-ink-faint">Nenhum material ainda.</p>
      )}

      {[...grupos.entries()].map(([disciplina, itens]) => (
        <div key={disciplina} className="mb-7">
          <h2 className="font-extrabold text-base mb-3">{disciplina}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {itens.map((m) => (
              <div key={m.id} className="bg-surface border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase text-ink-faint">
                    {TIPO_LABEL[m.tipo] ?? TIPO_LABEL.OUTRO}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      m.publico ? "bg-teal/10 text-teal" : "bg-ink-faint/10 text-ink-faint"
                    }`}
                  >
                    {m.publico ? "Público" : "Interno"}
                  </span>
                </div>
                <div className="font-extrabold text-sm mb-1">{m.titulo}</div>
                {m.aula && <div className="text-xs text-terracotta font-bold mb-1">{m.aula}</div>}
                <p className="text-xs text-ink-soft mb-2.5">{m.descricao}</p>
                <div className="flex items-center justify-between">
                  <a href={m.arquivoUrl} className="text-xs font-bold text-terracotta">
                    Ver arquivo →
                  </a>
                  <ApagarItemButton
                    id={m.id}
                    action={apagarMaterial}
                    confirmMessage="Apagar este material?"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
