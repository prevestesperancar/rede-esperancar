"use client";

import { useActionState } from "react";
import { atualizarEmailEstudante } from "@/actions/gestao";

export function EditarEmailEstudanteForm({
  estudanteId,
  email,
}: {
  estudanteId: string;
  email: string;
}) {
  const [message, action, pending] = useActionState(atualizarEmailEstudante, undefined);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="estudanteId" value={estudanteId} />
      <input
        name="email"
        type="email"
        defaultValue={email}
        required
        className="flex-1 min-w-[220px] rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={pending}
        className="font-bold text-xs px-4 py-2 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar e-mail"}
      </button>
      {message && <span className="text-xs text-teal font-semibold">{message}</span>}
    </form>
  );
}
