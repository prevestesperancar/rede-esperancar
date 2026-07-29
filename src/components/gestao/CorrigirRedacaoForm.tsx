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
  const containerRef = useRef<HTMLDivElement>(null);
  const textoRef = useRef<HTMLDivElement>(null);
  const [marcacoes, setMarcacoes] = useState<Marcacao[]>([]);
  const [comentarioSelecao, setComentarioSelecao] = useState("");
  const [selecaoAtual, setSelecaoAtual] = useState<{
    inicio: number;
    fim: number;
    top: number;
    left: number;
  } | null>(null);
  const criterios = criteriosDaProva(prova);
  const [notas, setNotas] = useState<number[]>(criterios.map(() => 0));

  const notaTotal = useMemo(() => notas.reduce((a, b) => a + (b || 0), 0), [notas]);

  function capturarSelecao() {
    const selecao = window.getSelection();
    if (!selecao || selecao.isCollapsed || !textoRef.current || !containerRef.current) return;
    const range = selecao.getRangeAt(0);
    const inicio = offsetNoTexto(textoRef.current, range.startContainer, range.startOffset);
    const fim = offsetNoTexto(textoRef.current, range.endContainer, range.endOffset);
    if (fim <= inicio) return;

    const rangeRect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setSelecaoAtual({
      inicio,
      fim,
      top: rangeRect.bottom - containerRect.top + 8,
      left: Math.min(
        Math.max(rangeRect.left - containerRect.left, 0),
        containerRect.width - 260
      ),
    });
  }

  function adicionarMarcacao() {
    if (!selecaoAtual || !comentarioSelecao.trim()) return;
    setMarcacoes((prev) => [
      ...prev,
      { inicio: selecaoAtual.inicio, fim: selecaoAtual.fim, comentario: comentarioSelecao.trim() },
    ]);
    setSelecaoAtual(null);
    setComentarioSelecao("");
    window.getSelection()?.removeAllRanges();
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
        <div ref={containerRef} className="relative">
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
            <div
              className="absolute z-10 w-64 flex gap-1.5 items-start bg-ink text-paper rounded-xl p-2.5 shadow-lg"
              style={{ top: selecaoAtual.top, left: selecaoAtual.left }}
            >
              <div className="absolute -top-1.5 left-4 w-3 h-3 bg-ink rotate-45" />
              <textarea
                autoFocus
                value={comentarioSelecao}
                onChange={(e) => setComentarioSelecao(e.target.value)}
                placeholder="Comente esse trecho…"
                rows={2}
                className="flex-1 rounded-lg bg-white/10 placeholder:text-paper/50 px-2.5 py-1.5 text-xs outline-none resize-none"
              />
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={adicionarMarcacao}
                  className="font-bold text-[11px] px-2.5 py-1 rounded-full bg-yellow text-yellow-ink"
                >
                  Marcar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelecaoAtual(null);
                    setComentarioSelecao("");
                  }}
                  className="font-bold text-[11px] px-2.5 py-1 rounded-full text-paper/70"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

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
