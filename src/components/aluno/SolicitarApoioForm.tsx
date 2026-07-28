"use client";

import { useActionState } from "react";
import { solicitarApoio } from "@/actions/agendamento";

export function SolicitarApoioForm() {
  const [message, action, pending] = useActionState(solicitarApoio, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-2.5">
      <div className="font-bold text-sm">Solicitar uma conversa</div>
      <textarea
        name="mensagem"
        rows={2}
        placeholder="Conte rapidinho o que você gostaria de conversar (opcional)"
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink resize-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Solicitar conversa"}
      </button>
      {message && <p className="text-xs font-semibold text-teal">{message}</p>}
    </form>
  );
}
