"use client";

import { useActionState } from "react";
import { criarTurma } from "@/actions/gestao";

export function NovaTurmaForm() {
  const [error, action, pending] = useActionState(criarTurma, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-4 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Nova turma</div>
      <div className="grid sm:grid-cols-3 gap-3">
        <input
          name="nome"
          placeholder="Nome (ex: Turma 2)"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="periodo"
          placeholder="Período (ex: Sábado)"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="capacidade"
          type="number"
          min={1}
          placeholder="Capacidade"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <input
        name="whatsappLink"
        placeholder="Link do grupo de WhatsApp (opcional)"
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar turma"}
      </button>
    </form>
  );
}
