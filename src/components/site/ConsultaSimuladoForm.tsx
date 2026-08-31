"use client";

import { useActionState } from "react";
import { consultarNotaSimulado } from "@/actions/consulta";
import { conceitoUerj, rotuloConceito } from "@/lib/simulado";
import { GabaritoGrid } from "@/components/site/GabaritoGrid";

export function ConsultaSimuladoForm() {
  const [estado, action, pending] = useActionState(consultarNotaSimulado, undefined);

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            Nome completo
          </label>
          <input
            name="nomeCompleto"
            required
            className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            Data de nascimento
          </label>
          <input
            name="dataNascimento"
            type="date"
            required
            className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        {estado?.erro && <p className="text-sm font-semibold text-terracotta">{estado.erro}</p>}
        <button
          type="submit"
          disabled={pending}
          className="font-extrabold text-sm py-3 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pending ? "Buscando…" : "Consultar"}
        </button>
      </form>

      {estado?.resultados && (
        <div>
          <div className="font-bold text-sm mb-3">Resultados de {estado.nomeEncontrado}</div>
          {estado.resultados.length === 0 ? (
            <p className="text-sm text-ink-faint">Nenhum simulado com nota lançada ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {estado.resultados.map((r, i) => (
                <div key={i} className="bg-surface border border-border rounded-2xl p-4">
                  <div className="font-extrabold text-sm">{r.simulado}</div>
                  <div className="text-xs text-ink-faint font-mono mb-2">
                    {r.data}
                    {r.linguaEscolhida && ` · Língua: ${r.linguaEscolhida}`}
                  </div>
                  {r.nota !== null ? (
                    (() => {
                      const total = r.gabarito.split(",").length;
                      const conceito = conceitoUerj(r.nota, total);
                      return (
                        <>
                          <div className="font-mono text-2xl font-bold text-teal">
                            {r.nota}/{total}
                          </div>
                          <div
                            className={`text-xs font-bold ${
                              conceito === "E" ? "text-terracotta" : "text-ink-soft"
                            }`}
                          >
                            Conceito {conceito}
                            {rotuloConceito(conceito) && ` — ${rotuloConceito(conceito)}`}
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-ink-faint">Nota ainda não lançada.</p>
                  )}
                  {r.respostas && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <GabaritoGrid
                        gabarito={r.gabarito.split(",").map((s) => s.trim().toUpperCase())}
                        respostas={r.respostas.split(",").map((s) => s.trim().toUpperCase())}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
