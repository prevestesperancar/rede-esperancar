"use client";

import { useState } from "react";

export function ExportarPresencaButton({ turmas }: { turmas: { id: string; nome: string }[] }) {
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");

  if (turmas.length === 0) {
    return <p className="text-sm text-ink-faint">Nenhuma turma cadastrada ainda.</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={turmaId}
        onChange={(e) => setTurmaId(e.target.value)}
        className="rounded-full border border-border-strong px-3.5 py-2.5 text-sm font-bold outline-none focus:border-ink bg-surface"
      >
        {turmas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nome}
          </option>
        ))}
      </select>
      <a
        href={`/api/exportar-estudantes?turmaId=${turmaId}`}
        className="font-bold text-sm px-4 py-2.5 rounded-full border border-border-strong text-ink-soft hover:text-ink"
      >
        ⬇️ Exportar lista de presença
      </a>
    </div>
  );
}
