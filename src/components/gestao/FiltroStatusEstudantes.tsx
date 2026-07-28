"use client";

import { useRouter } from "next/navigation";

const STATUS_LABEL: Record<string, string> = {
  EM_AVALIACAO: "Em avaliação",
  PRESENTE: "Ativo",
  FALTANTE: "Faltante",
  DESISTENTE: "Desistente",
  TRANSFERIDO: "Transferido",
};

export function FiltroStatusEstudantes({ statusAtual }: { statusAtual?: string }) {
  const router = useRouter();

  return (
    <select
      defaultValue={statusAtual ?? ""}
      onChange={(e) => {
        const valor = e.target.value;
        router.push(valor ? `/gestao/estudantes?status=${valor}` : "/gestao/estudantes");
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
