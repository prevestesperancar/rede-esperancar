"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { registrarFrequencia } from "@/actions/gestao";

type Estudante = {
  estudanteId: string;
  nome: string;
  total: number;
  percentual: number | null;
  statusHoje: "presente" | "falta" | null;
};

type Turma = {
  turmaId: string;
  turmaNome: string;
  percentualGeral: number | null;
  estudantes: Estudante[];
};

function corPercentual(p: number | null) {
  if (p === null) return "text-ink-faint";
  if (p >= 75) return "text-teal";
  if (p >= 50) return "text-yellow-ink";
  return "text-terracotta";
}

export function FrequenciaDashboard({
  turmas,
  data,
}: {
  turmas: Turma[];
  data: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <h3 className="font-extrabold text-[15px]">Acompanhamento de frequência</h3>
        <input
          type="date"
          defaultValue={data}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => router.push(`${pathname}?data=${e.target.value}`)}
          className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink"
        />
      </div>
      <p className="text-xs text-ink-faint mb-3.5">
        Marque presença ou falta do dia selecionado para cada estudante.
      </p>

      {turmas.map((turma) => (
        <div key={turma.turmaId} className="pt-3.5 mt-3.5 border-t border-border first:border-t-0 first:mt-0 first:pt-0">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-bold text-sm">{turma.turmaNome}</span>
            <span className={`font-mono text-xs font-bold ${corPercentual(turma.percentualGeral)}`}>
              {turma.percentualGeral !== null ? `${turma.percentualGeral}% geral` : "sem registros"}
            </span>
          </div>
          {turma.estudantes.map((e) => (
            <div
              key={e.estudanteId}
              className="flex items-center gap-2.5 py-2 border-b border-border last:border-b-0 text-sm"
            >
              <span className="flex-1 min-w-0 truncate">{e.nome}</span>
              <span className={`font-mono text-xs w-16 flex-shrink-0 ${corPercentual(e.percentual)}`}>
                {e.percentual !== null ? `${e.percentual}%` : "—"}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(() => registrarFrequencia(e.estudanteId, turma.turmaId, true, data))
                }
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 disabled:opacity-50 ${
                  e.statusHoje === "presente"
                    ? "bg-teal text-white"
                    : "bg-teal/10 text-teal"
                }`}
              >
                Presente
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(() => registrarFrequencia(e.estudanteId, turma.turmaId, false, data))
                }
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 disabled:opacity-50 ${
                  e.statusHoje === "falta"
                    ? "bg-terracotta text-white"
                    : "bg-terracotta/10 text-terracotta"
                }`}
              >
                Faltou
              </button>
            </div>
          ))}
          {turma.estudantes.length === 0 && (
            <p className="text-sm text-ink-faint py-1">Nenhum estudante matriculado.</p>
          )}
        </div>
      ))}
      {turmas.length === 0 && (
        <p className="text-sm text-ink-faint">Nenhuma turma cadastrada ainda.</p>
      )}
    </div>
  );
}
