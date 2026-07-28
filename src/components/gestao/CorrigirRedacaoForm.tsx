"use client";

import { useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { corrigirRedacao } from "@/actions/redacao";
import { criteriosDaProva } from "@/lib/redacao-criterios";

type Marcacao = { inicio: number; fim: number; comentario: string };

function offsetNoTexto(container: HTMLElement, node: Node, offset: number) {
  let total = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let atual: Node | null = walker.nextNode();
  while (atual) {
    if (atual === node) return total + offset;
    total += atual.textContent?.length ?? 0;
    atual = walker.nextNode();
  }
  return total;
}

export function CorrigirRedacaoForm({
  redacaoId,
  textoEnviado,
  prova,
}: {
  redacaoId: string;
  textoEnviado: string;
  prova: string;
}) {
  const [message, action, pending] = useActionState(corrigirRedacao, undefined);
  const textoRef = useRef<HTMLDivElement>(null);
  const [marcacoes, setMarcacoes] = useState<Marcacao[]>([]);
  const [comentarioSelecao, setComentarioSelecao] = useState("");
  const [selecaoAtual, setSelecaoAtual] = useState<{ inicio: number; fim: number } | null>(null);
  const criterios = criteriosDaProva(prova);
  const [notas, setNotas] = useState<number[]>(criterios.map(() => 0));

  const notaTotal = useMemo(() => notas.reduce((a, b) => a + (b || 0), 0), [notas]);

  function capturarSelecao() {
    const selecao = window.getSelection();
    if (!selecao || selecao.isCollapsed || !textoRef.current) return;
    const range = selecao.getRangeAt(0);
    const inicio = offsetNoTexto(textoRef.current, range.startContainer, range.startOffset);
    const fim = offsetNoTexto(textoRef.current, range.endContainer, range.endOffset);
    if (fim > inicio) setSelecaoAtual({ inicio, fim });
  }

  function adicionarMarcacao() {
    if (!selecaoAtual || !comentarioSelecao.trim()) return;
    setMarcacoes((prev) => [...prev, { ...selecaoAtual, comentario: comentarioSelecao.trim() }]);
    setSelecaoAtual(null);
    setComentarioSelecao("");
  }

  const segmentos = useMemo(() => {
    const ordenadas = [...marcacoes].sort((a, b) => a.inicio - b.inicio);
    const partes: { texto: string; marcada: boolean; comentario?: string }[] = [];
    let cursor = 0;
    for (const m of ordenadas) {
      if (m.inicio > cursor) partes.push({ texto: textoEnviado.slice(cursor, m.inicio), marcada: false });
      partes.push({ texto: textoEnviado.slice(m.inicio, m.fim), marcada: true, comentario: m.comentario });
      cursor = m.fim;
    }
    if (cursor < textoEnviado.length) partes.push({ texto: textoEnviado.slice(cursor), marcada: false });
    return partes;
  }, [marcacoes, textoEnviado]);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="redacaoId" value={redacaoId} />
      <input type="hidden" name="notaTotal" value={notaTotal} />
      <input type="hidden" name="marcacoes" value={JSON.stringify(marcacoes)} />
      <input
        type="hidden"
        name="notasComponentes"
        value={JSON.stringify(criterios.map((c, i) => ({ criterio: c.label, nota: notas[i] || 0 })))}
      />

      <div>
        <div className="text-xs font-bold uppercase text-ink-faint mb-2">
          Selecione um trecho do texto pra comentar
        </div>
        <div
          ref={textoRef}
          onMouseUp={capturarSelecao}
          className="bg-surface border border-border rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line select-text"
        >
          {segmentos.map((s, i) =>
            s.marcada ? (
              <mark key={i} title={s.comentario} className="bg-yellow/40 rounded px-0.5">
                {s.texto}
              </mark>
            ) : (
              <span key={i}>{s.texto}</span>
            )
          )}
        </div>

        {selecaoAtual && (
          <div className="mt-2 flex gap-2 items-start bg-paper border border-border-strong rounded-xl p-3">
            <textarea
              value={comentarioSelecao}
              onChange={(e) => setComentarioSelecao(e.target.value)}
              placeholder="Comentário sobre o trecho selecionado"
              rows={2}
              className="flex-1 rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink resize-none"
            />
            <button
              type="button"
              onClick={adicionarMarcacao}
              className="font-bold text-xs px-3.5 py-2 rounded-full bg-ink text-paper flex-shrink-0"
            >
              Marcar
            </button>
          </div>
        )}

        {marcacoes.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {marcacoes.map((m, i) => (
              <li key={i} className="text-xs text-ink-soft flex items-center justify-between gap-2">
                <span>&ldquo;{textoEnviado.slice(m.inicio, m.fim).slice(0, 40)}…&rdquo; — {m.comentario}</span>
                <button
                  type="button"
                  onClick={() => setMarcacoes((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-terracotta font-bold flex-shrink-0"
                >
                  remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="text-xs font-bold uppercase text-ink-faint mb-2">Notas por competência</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {criterios.map((c, i) => (
            <div key={c.label} className="flex items-center gap-2">
              <label className="text-sm flex-1">{c.label}</label>
              <input
                type="number"
                min={0}
                max={c.max}
                value={notas[i]}
                onChange={(e) =>
                  setNotas((prev) => prev.map((n, idx) => (idx === i ? Number(e.target.value) : n)))
                }
                className="w-20 rounded-lg border border-border-strong px-2 py-1.5 text-sm outline-none focus:border-ink"
              />
              <span className="text-xs text-ink-faint">/ {c.max}</span>
            </div>
          ))}
        </div>
        <div className="font-extrabold text-sm mt-3">Nota total: {notaTotal}</div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-ink-faint mb-1">Comentário geral</label>
        <textarea
          name="comentarioGeral"
          rows={4}
          placeholder="Comentário geral sobre a redação, para o estudante ler"
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink resize-none"
        />
      </div>

      {message && <p className="text-sm font-semibold text-teal">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar correção"}
      </button>
    </form>
  );
}
