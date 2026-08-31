import { conceitoUerj, rotuloConceito } from "@/lib/simulado";
import { GabaritoGrid } from "@/components/site/GabaritoGrid";
import type { ResultadoConsulta } from "@/actions/consulta";

export function ResultadosSimuladoLista({ resultados }: { resultados: ResultadoConsulta[] }) {
  if (resultados.length === 0) {
    return <p className="text-sm text-ink-faint">Nenhum simulado com nota lançada ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {resultados.map((r, i) => (
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
  );
}
