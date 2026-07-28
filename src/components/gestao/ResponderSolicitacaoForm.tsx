"use client";

import { useActionState } from "react";
import { responderSolicitacao } from "@/actions/agendamento";

export function ResponderSolicitacaoForm({ solicitacaoId }: { solicitacaoId: string }) {
  const [message, action, pending] = useActionState(responderSolicitacao, undefined);

  return (
    <form action={action} className="flex flex-col gap-2 mt-2">
      <input type="hidden" name="solicitacaoId" value={solicitacaoId} />
      <p className="text-xs font-bold text-ink-faint uppercase tracking-wide">
        Sugira 3 horários
      </p>
      <div className="grid sm:grid-cols-3 gap-2">
        <input
          name="opcao1"
          type="datetime-local"
          required
          className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink"
        />
        <input
          name="opcao2"
          type="datetime-local"
          required
          className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink"
        />
        <input
          name="opcao3"
          type="datetime-local"
          required
          className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start font-bold text-xs px-4 py-2 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar horários"}
      </button>
      {message && <p className="text-xs font-semibold text-teal">{message}</p>}
    </form>
  );
}
