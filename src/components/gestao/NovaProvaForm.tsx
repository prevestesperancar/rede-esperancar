"use client";

import { useActionState } from "react";
import { criarProva } from "@/actions/gestao";

export function NovaProvaForm() {
  const [error, action, pending] = useActionState(criarProva, undefined);

  return (
    <form action={action} className="flex flex-wrap gap-2.5 items-end mt-3">
      <input
        name="nome"
        placeholder="Nome da prova (ex: ENEM)"
        required
        className="rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink flex-1 min-w-[140px]"
      />
      <input
        name="data"
        type="date"
        required
        className="rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink"
      />
      {error && <p className="text-xs text-terracotta font-semibold w-full">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="font-bold text-xs px-4 py-2 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "+ Adicionar"}
      </button>
    </form>
  );
}
