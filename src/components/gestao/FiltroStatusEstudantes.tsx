"use client";

import { useRouter, useSearchParams } from "next/navigation";

const STATUS_LABEL: Record<string, string> = {
  EM_AVALIACAO: "Em avaliação",
  PRESENTE: "Ativo",
  FALTANTE: "Faltante",
  DESISTENTE: "Desistente",
  TRANSFERIDO: "Transferido",
};

export function FiltroStatusEstudantes({ statusAtual }: { statusAtual?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      defaultValue={statusAtual ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set("status", e.target.value);
        else params.delete("status");
        router.push(`/gestao/estudantes?${params.toString()}`);
      }}
      className="rounded-full border border-border-strong px-3.5 py-2 text-xs font-bold outline-none focus:border-ink bg-surface"
    >
      <option value="">Todos (exceto desistente/transferido)</option>
      {Object.entries(STATUS_LABEL).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
