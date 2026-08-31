type Item = { chave: string; acertos: number; respondidas: number; percentualErro: number };
type ItemSubtema = Item & { materia: string; subtema: string; numero: number };

function BarraErro({ label, percentualErro }: { label: string; percentualErro: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-40 flex-shrink-0 truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-paper overflow-hidden">
        <div className="h-full bg-terracotta" style={{ width: `${percentualErro}%` }} />
      </div>
      <span className="text-ink-faint w-14 text-right flex-shrink-0 font-mono font-bold">
        {percentualErro}%
      </span>
    </div>
  );
}

export function PanoramaSimulado({
  porGrupo,
  porMateria,
  porSubtema,
}: {
  porGrupo: Item[];
  porMateria: Item[];
  porSubtema: ItemSubtema[];
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-5 mb-5">
      <div>
        <div className="text-[11px] font-bold text-ink-faint uppercase tracking-wide mb-2">
          % de erro por área geral
        </div>
        <div className="flex flex-col gap-2">
          {porGrupo.map((g) => (
            <BarraErro key={g.chave} label={g.chave} percentualErro={g.percentualErro} />
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold text-ink-faint uppercase tracking-wide mb-2">
          % de erro por matéria
        </div>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {porMateria.map((m) => (
            <BarraErro key={m.chave} label={m.chave} percentualErro={m.percentualErro} />
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold text-ink-faint uppercase tracking-wide mb-2">
          Subtemas com mais erro
        </div>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {porSubtema.slice(0, 10).map((s) => (
            <BarraErro
              key={s.chave}
              label={`Q${s.numero} · ${s.subtema}`}
              percentualErro={s.percentualErro}
            />
          ))}
          {porSubtema.length === 0 && (
            <p className="text-xs text-ink-faint">Nenhum cartão-resposta lançado ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
