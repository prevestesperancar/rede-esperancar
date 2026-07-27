const CORES = ["bg-teal", "bg-terracotta", "bg-yellow", "bg-ink", "bg-ink-faint", "bg-border-strong"];

function Barra({ dados }: { dados: { label: string; total: number }[] }) {
  const max = Math.max(1, ...dados.map((d) => d.total));
  return (
    <div className="flex flex-col gap-2">
      {dados.map((d, i) => (
        <div key={d.label} className="flex items-center gap-2.5">
          <span className="text-xs text-ink-soft w-[120px] flex-shrink-0 truncate">{d.label}</span>
          <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
            <div
              className={`h-full rounded-full ${CORES[i % CORES.length]}`}
              style={{ width: `${(d.total / max) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs text-ink-faint w-8 text-right flex-shrink-0">
            {d.total}
          </span>
        </div>
      ))}
      {dados.length === 0 && <p className="text-xs text-ink-faint">Sem dados ainda.</p>}
    </div>
  );
}

export function PerfilEstudantesChart({
  total,
  genero,
  racaCor,
  rendaFamiliar,
}: {
  total: number;
  genero: { label: string; total: number }[];
  racaCor: { label: string; total: number }[];
  rendaFamiliar: { label: string; total: number }[];
}) {
  return (
    <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-[15px]">Perfil dos estudantes ativos</h3>
        <span className="text-[11px] font-bold uppercase text-teal bg-teal/10 px-2.5 py-1 rounded-full">
          {total} ativo(s)
        </span>
      </div>
      {total === 0 ? (
        <p className="text-sm text-ink-faint">Nenhum estudante ativo ainda.</p>
      ) : (
        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <div className="text-xs font-bold text-ink-faint uppercase tracking-wide mb-2.5">
              Gênero
            </div>
            <Barra dados={genero} />
          </div>
          <div>
            <div className="text-xs font-bold text-ink-faint uppercase tracking-wide mb-2.5">
              Raça/cor
            </div>
            <Barra dados={racaCor} />
          </div>
          <div>
            <div className="text-xs font-bold text-ink-faint uppercase tracking-wide mb-2.5">
              Renda familiar
            </div>
            <Barra dados={rendaFamiliar} />
          </div>
        </div>
      )}
    </div>
  );
}
