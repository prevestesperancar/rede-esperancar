"use client";

import { useState } from "react";

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
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const notas: NotaComponente[] = notasComponentes ? JSON.parse(notasComponentes) : [];
  const marcadas: Marcacao[] = marcacoes ? JSON.parse(marcacoes) : [];

  const ordenadas = [...marcadas]
    .map((m, indiceOriginal) => ({ ...m, indiceOriginal }))
    .sort((a, b) => a.inicio - b.inicio);
  const partes: { texto: string; marcada: boolean; comentario?: string; indice?: number }[] = [];
  let cursor = 0;
  for (const m of ordenadas) {
    if (m.inicio > cursor) partes.push({ texto: textoEnviado.slice(cursor, m.inicio), marcada: false });
    partes.push({
      texto: textoEnviado.slice(m.inicio, m.fim),
      marcada: true,
      comentario: m.comentario,
      indice: m.indiceOriginal,
    });
    cursor = m.fim;
  }
  if (cursor < textoEnviado.length) partes.push({ texto: textoEnviado.slice(cursor), marcada: false });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="bg-surface border border-border rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line">
          {partes.map((s, i) =>
            s.marcada ? (
              <mark
                key={i}
                onClick={() => setSelecionado((atual) => (atual === s.indice ? null : s.indice!))}
                className={`rounded px-0.5 cursor-pointer ${
                  selecionado === s.indice ? "bg-yellow" : "bg-yellow/40"
                }`}
              >
                {s.texto}
              </mark>
            ) : (
              <span key={i}>{s.texto}</span>
            )
          )}
        </div>
        {selecionado !== null && (
          <div className="mt-2 bg-ink text-paper rounded-xl p-3 text-sm">
            💬 {marcadas[selecionado]?.comentario}
          </div>
        )}
        {marcadas.length > 0 && (
          <p className="text-xs text-ink-faint mt-2">
            Toque nos trechos marcados em amarelo pra ver o comentário.
          </p>
        )}
      </div>

      {marcadas.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase text-ink-faint mb-1.5">
            Todos os comentários
          </div>
          <ul className="flex flex-col gap-1.5">
            {marcadas.map((m, i) => (
              <li
                key={i}
                onClick={() => setSelecionado((atual) => (atual === i ? null : i))}
                className={`text-sm rounded-lg px-3 py-2 cursor-pointer ${
                  selecionado === i ? "bg-yellow/30 text-ink" : "bg-yellow/10 text-ink-soft"
                }`}
              >
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
