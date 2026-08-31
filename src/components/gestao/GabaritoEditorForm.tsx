"use client";

import { useActionState, useState } from "react";
import { editarGabaritoSimulado } from "@/actions/gestao";
import { BlocoLinguaEditor } from "@/components/gestao/BlocoLinguaEditor";
import { INICIO_BLOCO_LINGUA, FIM_BLOCO_LINGUA } from "@/lib/simulado";

const OPCOES = ["A", "B", "C", "D", "ANULADA"];
const QUANTIDADES_RAPIDAS = [10, 20, 40, 50, 60, 70];

export function GabaritoEditorForm({
  simuladoId,
  gabaritoAtual,
  gabaritoIngles,
  gabaritoEspanhol,
  gabaritoFrances,
}: {
  simuladoId: string;
  gabaritoAtual: string;
  gabaritoIngles?: string | null;
  gabaritoEspanhol?: string | null;
  gabaritoFrances?: string | null;
}) {
  const [aberto, setAberto] = useState(false);
  const [error, action, pending] = useActionState(editarGabaritoSimulado, undefined);
  const [respostas, setRespostas] = useState<string[]>(
    gabaritoAtual.split(",").map((r) => r.trim().toUpperCase())
  );

  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className="text-[11px] font-bold text-terracotta">
        Editar gabarito →
      </button>
    );
  }

  const atualizar = (i: number, valor: string) =>
    setRespostas((prev) => prev.map((r, idx) => (idx === i ? valor : r)));

  function mudarQuantidade(quantidade: number) {
    setRespostas((prev) => {
      if (quantidade <= prev.length) return prev.slice(0, quantidade);
      return [...prev, ...Array(quantidade - prev.length).fill("A")];
    });
  }

  return (
    <form action={action} className="bg-paper rounded-xl p-3.5 mt-2 flex flex-col gap-3">
      <input type="hidden" name="simuladoId" value={simuladoId} />
      <input type="hidden" name="gabarito" value={respostas.join(",")} />

      <div className="text-xs font-bold text-ink-faint uppercase tracking-wide">
        Gabarito oficial ({respostas.length} questões)
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {QUANTIDADES_RAPIDAS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => mudarQuantidade(q)}
            className={`font-bold text-xs w-9 h-8 rounded-full border ${
              respostas.length === q ? "bg-ink border-ink text-paper" : "border-border-strong text-ink-soft"
            }`}
          >
            {q}
          </button>
        ))}
        <input
          type="number"
          min={1}
          placeholder="Outro"
          onChange={(e) => {
            const valor = Number(e.target.value);
            if (valor > 0) mudarQuantidade(valor);
          }}
          className="w-16 rounded-full border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {respostas.map((r, i) => {
          const posicao = i + 1;
          const naLingua = posicao >= INICIO_BLOCO_LINGUA && posicao <= FIM_BLOCO_LINGUA;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-ink-faint">{i + 1}</span>
              <select
                value={r}
                onChange={(e) => atualizar(i, e.target.value)}
                disabled={naLingua}
                title={naLingua ? "Definido no bloco de língua estrangeira, abaixo" : undefined}
                className={`rounded-lg border px-1.5 py-1 text-xs font-bold outline-none focus:border-ink disabled:opacity-40 ${
                  r === "ANULADA" ? "border-terracotta text-terracotta" : "border-border-strong"
                }`}
              >
                {OPCOES.map((o) => (
                  <option key={o} value={o}>
                    {o === "ANULADA" ? "Anulada" : o}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {respostas.length >= FIM_BLOCO_LINGUA && (
        <BlocoLinguaEditor
          gabaritoIngles={gabaritoIngles}
          gabaritoEspanhol={gabaritoEspanhol}
          gabaritoFrances={gabaritoFrances}
        />
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setRespostas((prev) => [...prev, "A"])}
          className="text-[11px] font-bold text-ink-faint"
        >
          + Adicionar questão
        </button>
        {respostas.length > 1 && (
          <button
            type="button"
            onClick={() => setRespostas((prev) => prev.slice(0, -1))}
            className="text-[11px] font-bold text-ink-faint"
          >
            − Remover última
          </button>
        )}
      </div>

      {error && <p className="text-xs font-semibold text-terracotta">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="text-xs font-bold px-4 py-2 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar gabarito"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="text-xs font-bold px-4 py-2 rounded-full border border-border-strong text-ink-soft"
        >
          Fechar
        </button>
      </div>
      <p className="text-[11px] text-ink-faint">
        Alterar o gabarito recalcula a nota de todo mundo que já tem cartão lançado.
      </p>
    </form>
  );
}
