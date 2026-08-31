"use client";

import { useState } from "react";
import { conceitoUerj, pontosConceito } from "@/lib/simulado";
import { GabaritoGrid } from "@/components/site/GabaritoGrid";

type Resultado = {
  nomeAluno: string;
  nota: number | null;
  gabarito: string;
  respostas: string | null;
};

export function RankingComGabarito({ resultados }: { resultados: Resultado[] }) {
  const [nomeAberto, setNomeAberto] = useState<string | null>(null);

  const ordenados = [...resultados].sort((a, b) => (b.nota ?? -1) - (a.nota ?? -1));

  return (
    <div className="flex flex-col gap-1.5">
      {ordenados.map((r, i) => {
        const total = r.gabarito.split(",").length;
        const conceito = r.nota !== null ? conceitoUerj(r.nota, total) : null;
        const pontos = conceito ? pontosConceito(conceito) : null;
        const aberto = nomeAberto === r.nomeAluno;

        return (
          <div key={r.nomeAluno + i}>
            <button
              type="button"
              onClick={() => setNomeAberto(aberto ? null : r.nomeAluno)}
              disabled={!r.respostas}
              className="w-full flex items-center justify-between text-sm bg-surface border border-border rounded-xl px-4 py-3 text-left disabled:cursor-default"
            >
              <span
                className={`font-semibold truncate ${r.respostas ? "underline decoration-dotted text-terracotta" : ""}`}
              >
                {i + 1}. {r.nomeAluno}
              </span>
              {r.nota !== null ? (
                <span className="font-mono font-bold flex-shrink-0 ml-2">
                  {r.nota}/{total} acertos
                  {conceito && ` · ${pontos !== null ? `${pontos} pontos` : `Conceito ${conceito}`}`}
                </span>
              ) : (
                <span className="text-xs text-ink-faint flex-shrink-0 ml-2">sem nota</span>
              )}
            </button>

            {aberto && r.respostas && (
              <div className="mt-2 mb-1 bg-paper rounded-xl p-3.5">
                <GabaritoGrid
                  gabarito={r.gabarito.split(",").map((s) => s.trim().toUpperCase())}
                  respostas={r.respostas.split(",").map((s) => s.trim().toUpperCase())}
                />
              </div>
            )}
          </div>
        );
      })}
      {ordenados.length === 0 && (
        <p className="text-sm text-ink-faint">Nenhum resultado encontrado.</p>
      )}
    </div>
  );
}
