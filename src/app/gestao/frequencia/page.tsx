import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFrequenciaDetalhadaDoNucleo, getNucleoNome } from "@/lib/queries/gestao";

const PERMITIDOS = ["COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

function corPercentual(p: number | null) {
  if (p === null) return "text-ink-faint";
  if (p >= 75) return "text-teal";
  if (p >= 50) return "text-yellow-ink";
  return "text-terracotta";
}

export default async function FrequenciaDetalhadaPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (!PERMITIDOS.includes(session.user.role)) redirect("/gestao");

  const [estudantes, nucleoNome] = await Promise.all([
    getFrequenciaDetalhadaDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  return (
    <div>
      <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
        {nucleoNome}
      </div>
      <h1 className="font-display text-2xl mb-6">Frequência detalhada</h1>

      <div className="flex flex-col gap-4">
        {estudantes.map((e) => (
          <div key={e.estudanteId} className="bg-surface border border-border rounded-[18px] p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <div className="font-bold text-sm">{e.nome}</div>
                <div className="text-xs text-ink-faint">{e.turmaNome}</div>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="font-mono text-[10px] font-bold uppercase text-ink-faint">Geral</div>
                  <span className={`font-mono text-sm font-bold ${corPercentual(e.percentual)}`}>
                    {e.percentual !== null ? `${e.percentual}%` : "—"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] font-bold uppercase text-ink-faint">Este mês</div>
                  <span className={`font-mono text-sm font-bold ${corPercentual(e.percentualMes)}`}>
                    {e.percentualMes !== null ? `${e.percentualMes}%` : "—"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {e.registros.map((r, i) => (
                <span
                  key={i}
                  title={r.data.toLocaleDateString("pt-BR")}
                  className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full ${
                    r.presente ? "bg-teal/10 text-teal" : "bg-terracotta/10 text-terracotta"
                  }`}
                >
                  {r.data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </span>
              ))}
              {e.registros.length === 0 && (
                <span className="text-xs text-ink-faint">Nenhum registro de frequência.</span>
              )}
            </div>
          </div>
        ))}
        {estudantes.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum estudante matriculado ainda.</p>
        )}
      </div>
    </div>
  );
}
