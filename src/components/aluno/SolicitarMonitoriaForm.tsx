"use client";

import { useActionState } from "react";
import { solicitarMonitoria } from "@/actions/agendamento";

export function SolicitarMonitoriaForm({
  professores,
}: {
  professores: { id: string; nome: string }[];
}) {
  const [message, action, pending] = useActionState(solicitarMonitoria, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-2.5">
      <div className="font-bold text-sm">Solicitar monitoria com um professor</div>
      <select
        name="professorId"
        required
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
      >
        <option value="">Escolha o professor</option>
        {professores.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
      <textarea
        name="mensagem"
        rows={2}
        placeholder="Conte rapidinho o que você precisa (opcional)"
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink resize-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Solicitar monitoria"}
      </button>
      {message && <p className="text-xs font-semibold text-teal">{message}</p>}
    </form>
  );
}
