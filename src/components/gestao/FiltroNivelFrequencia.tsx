"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPCOES = [
  { value: "", label: "Todas as frequências" },
  { value: "baixa", label: "Baixa (abaixo de 50%)" },
  { value: "media", label: "Média (50% a 74%)" },
  { value: "ok", label: "Ok (75% ou mais)" },
];

export function FiltroNivelFrequencia({ nivelAtual }: { nivelAtual?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      defaultValue={nivelAtual ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set("nivel", e.target.value);
        else params.delete("nivel");
        const query = params.toString();
        router.push(query ? `/gestao/frequencia?${query}` : "/gestao/frequencia");
      }}
      className="rounded-full border border-border-strong px-3.5 py-2 text-xs font-bold outline-none focus:border-ink bg-surface"
    >
      {OPCOES.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
