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
    <form action={action} className="flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Importar alunos da planilha para a turma
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
      <button
        type="submit"
        disabled={pending}
        className="font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Importando…" : "Importar"}
      </button>
      {message && <p className="text-xs font-semibold text-ink-soft w-full">{message}</p>}
    </form>
  );
}
