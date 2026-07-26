"use client";

import { useActionState } from "react";
import { criarEvento } from "@/actions/gestao";

export function NovoEventoForm() {
  const [error, action, pending] = useActionState(criarEvento, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Novo evento</div>
      <input
        name="titulo"
        placeholder="Título do evento"
        required
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="data"
          type="datetime-local"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="local"
          placeholder="Local"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="publico" defaultChecked className="w-4 h-4" />
        Público (aparece no site)
      </label>
      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "Adicionar evento"}
      </button>
    </form>
  );
}
