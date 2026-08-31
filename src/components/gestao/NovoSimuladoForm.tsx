"use client";

import { useActionState, useState } from "react";
import { criarSimulado } from "@/actions/gestao";
import { BlocoLinguaEditor } from "@/components/gestao/BlocoLinguaEditor";
import { INICIO_BLOCO_LINGUA, FIM_BLOCO_LINGUA } from "@/lib/simulado";

const QUANTIDADES_RAPIDAS = [10, 20, 40, 50, 60, 70];
const OPCOES = ["A", "B", "C", "D", "ANULADA"];

export function NovoSimuladoForm() {
  const [error, action, pending] = useActionState(criarSimulado, undefined);
  const [gabarito, setGabarito] = useState<string[]>(() => Array(60).fill("A"));

  function mudarQuantidade(quantidade: number) {
    setGabarito((prev) => {
      if (quantidade <= prev.length) return prev.slice(0, quantidade);
      return [...prev, ...Array(quantidade - prev.length).fill("A")];
    });
  }

  const atualizarResposta = (i: number, valor: string) =>
    setGabarito((prev) => prev.map((r, idx) => (idx === i ? valor : r)));

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Novo simulado</div>
      <input type="hidden" name="gabarito" value={gabarito.join(",")} />
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="nome"
          placeholder="Nome (ex: Simulado 1 — Uerj)"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="data"
          type="date"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1.5">
          Número de questões
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {QUANTIDADES_RAPIDAS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => mudarQuantidade(q)}
              className={`font-bold text-sm w-11 h-9 rounded-full border ${
                gabarito.length === q ? "bg-ink border-ink text-paper" : "border-border-strong text-ink-soft"
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
            className="w-20 rounded-full border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1.5">
          Gabarito oficial ({gabarito.length} questões)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {gabarito.map((r, i) => {
            const posicao = i + 1;
            const naLingua = posicao >= INICIO_BLOCO_LINGUA && posicao <= FIM_BLOCO_LINGUA;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-mono text-ink-faint">{i + 1}</span>
                <select
                  value={r}
                  onChange={(e) => atualizarResposta(i, e.target.value)}
                  disabled={naLingua}
                  title={naLingua ? "Definido no bloco de língua estrangeira, abaixo" : undefined}
                  className={`rounded-md border px-1 py-0.5 text-[11px] font-bold outline-none focus:border-ink disabled:opacity-40 ${
                    r === "ANULADA" ? "border-terracotta text-terracotta" : "border-border-strong"
                  }`}
                >
                  {OPCOES.map((o) => (
                    <option key={o} value={o}>
                      {o === "ANULADA" ? "X" : o}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {gabarito.length >= FIM_BLOCO_LINGUA && <BlocoLinguaEditor />}

      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar simulado"}
      </button>
    </form>
  );
}
