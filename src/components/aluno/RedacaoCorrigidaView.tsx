type Marcacao = { inicio: number; fim: number; comentario: string };
type NotaComponente = { criterio: string; nota: number };

export function RedacaoCorrigidaView({
  textoEnviado,
  notasComponentes,
  notaTotal,
  comentarioGeral,
  marcacoes,
}: {
  textoEnviado: string;
  notasComponentes: string | null;
  notaTotal: number | null;
  comentarioGeral: string | null;
  marcacoes: string | null;
}) {
  const notas: NotaComponente[] = notasComponentes ? JSON.parse(notasComponentes) : [];
  const marcadas: Marcacao[] = marcacoes ? JSON.parse(marcacoes) : [];

  const ordenadas = [...marcadas].sort((a, b) => a.inicio - b.inicio);
  const partes: { texto: string; marcada: boolean; comentario?: string }[] = [];
  let cursor = 0;
  for (const m of ordenadas) {
    if (m.inicio > cursor) partes.push({ texto: textoEnviado.slice(cursor, m.inicio), marcada: false });
    partes.push({ texto: textoEnviado.slice(m.inicio, m.fim), marcada: true, comentario: m.comentario });
    cursor = m.fim;
  }
  if (cursor < textoEnviado.length) partes.push({ texto: textoEnviado.slice(cursor), marcada: false });

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-surface border border-border rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line">
        {partes.map((s, i) =>
          s.marcada ? (
            <mark key={i} title={s.comentario} className="bg-yellow/40 rounded px-0.5 cursor-help">
              {s.texto}
            </mark>
          ) : (
            <span key={i}>{s.texto}</span>
          )
        )}
      </div>

      {marcadas.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase text-ink-faint mb-1.5">
            Comentários nos trechos marcados
          </div>
          <ul className="flex flex-col gap-1.5">
            {marcadas.map((m, i) => (
              <li key={i} className="text-sm text-ink-soft bg-yellow/10 rounded-lg px-3 py-2">
                {m.comentario}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-extrabold text-sm">Notas por competência</div>
          <div className="font-mono font-bold text-lg text-teal">{notaTotal}</div>
        </div>
        <div className="flex flex-col gap-1">
          {notas.map((n, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">{n.criterio}</span>
              <span className="font-mono font-bold">{n.nota}</span>
            </div>
          ))}
        </div>
      </div>

      {comentarioGeral && (
        <div>
          <div className="text-xs font-bold uppercase text-ink-faint mb-1.5">Comentário geral</div>
          <p className="text-sm text-ink-soft whitespace-pre-line">{comentarioGeral}</p>
        </div>
      )}
    </div>
  );
}
