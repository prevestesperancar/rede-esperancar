"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function FiltroBolsistaEstudantes({ bolsistaAtual }: { bolsistaAtual?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      defaultValue={bolsistaAtual ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set("bolsista", e.target.value);
        else params.delete("bolsista");
        router.push(`/gestao/estudantes?${params.toString()}`);
      }}
      className="rounded-full border border-border-strong px-3.5 py-2 text-xs font-bold outline-none focus:border-ink bg-surface"
    >
      <option value="">Bolsista: todos</option>
      <option value="sim">Bolsistas</option>
      <option value="nao">Não bolsistas</option>
    </select>
  );
}
