"use client";

import { useRouter } from "next/navigation";

export function FiltroTurmaFrequencia({
  turmas,
  turmaAtual,
}: {
  turmas: string[];
  turmaAtual?: string;
}) {
  const router = useRouter();

  return (
    <select
      defaultValue={turmaAtual ?? ""}
      onChange={(e) => {
        const valor = e.target.value;
        router.push(valor ? `/gestao/frequencia?turma=${encodeURIComponent(valor)}` : "/gestao/frequencia");
      }}
      className="rounded-full border border-border-strong px-3.5 py-2 text-xs font-bold outline-none focus:border-ink bg-surface"
    >
      <option value="">Todas as turmas</option>
      {turmas.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
