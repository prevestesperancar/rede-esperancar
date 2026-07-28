"use client";

import { useActionState } from "react";
import { atualizarLinksAgendamento } from "@/actions/agendamento";

export function LinksAgendamentoForm({
  linkMonitoriaProfessor,
  linkApoioPsicossocial,
}: {
  linkMonitoriaProfessor: string | null;
  linkApoioPsicossocial: string | null;
}) {
  const [message, action, pending] = useActionState(atualizarLinksAgendamento, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Link de videochamada para monitorias com professores
        </label>
        <input
          name="linkMonitoriaProfessor"
          type="url"
          defaultValue={linkMonitoriaProfessor ?? ""}
          placeholder="https://meet.google.com/..."
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Link de videochamada para conversas com o apoio psicossocial
        </label>
        <input
          name="linkApoioPsicossocial"
          type="url"
          defaultValue={linkApoioPsicossocial ?? ""}
          placeholder="https://meet.google.com/..."
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar links"}
      </button>
      {message && <p className="text-xs font-semibold text-teal">{message}</p>}
    </form>
  );
}
