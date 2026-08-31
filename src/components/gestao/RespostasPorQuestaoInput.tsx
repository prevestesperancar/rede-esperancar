"use client";

import { useState } from "react";

const OPCOES = ["?", "A", "B", "C", "D"];

export function RespostasPorQuestaoInput({
  name,
  totalQuestoes,
  valorInicial,
}: {
  name: string;
  totalQuestoes: number;
  valorInicial?: string;
}) {
  const [respostas, setRespostas] = useState<string[]>(() => {
    const partes = (valorInicial ?? "").split(",").map((r) => r.trim().toUpperCase());
    return Array.from({ length: totalQuestoes }, (_, i) => partes[i] || "?");
  });

  const atualizar = (i: number, valor: string) =>
    setRespostas((prev) => prev.map((r, idx) => (idx === i ? valor : r)));

  return (
    <div>
      <input type="hidden" name={name} value={respostas.join(",")} />
      <div className="flex flex-wrap gap-1.5">
        {respostas.map((r, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-mono text-ink-faint">{i + 1}</span>
            <select
              value={r}
              onChange={(e) => atualizar(i, e.target.value)}
              className={`rounded-md border px-1 py-0.5 text-[11px] font-bold outline-none focus:border-ink ${
                r === "?" ? "border-border-strong text-ink-faint" : "border-border-strong"
              }`}
            >
              {OPCOES.map((o) => (
                <option key={o} value={o}>
                  {o === "?" ? "-" : o}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
