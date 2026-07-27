"use client";

import { useActionState } from "react";
import { importarEstudantesPlanilha } from "@/actions/gestao";

export function ImportarPlanilhaForm({
  turmas,
}: {
  turmas: { id: string; nome: string; periodo: string }[];
}) {
  const [message, action, pending] = useActionState(importarEstudantesPlanilha, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="font-extrabold text-sm">Importar alunos de um arquivo CSV</div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            Turma
          </label>
          <select
            name="turmaId"
            required
            className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
          >
            <option value="">Selecione a turma</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} · {t.periodo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            Arquivo CSV
          </label>
          <input
            name="arquivo"
            type="file"
            accept=".csv,text/csv"
            required
            className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink file:mr-3 file:rounded-full file:border-0 file:bg-yellow file:text-yellow-ink file:font-bold file:text-xs file:px-3 file:py-1.5"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pending ? "Importando…" : "Importar"}
        </button>
      </div>
      {message && <p className="text-xs font-semibold text-ink-soft">{message}</p>}
    </form>
  );
}
