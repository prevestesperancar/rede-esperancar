"use client";

import { useActionState } from "react";
import { editarTurma, atualizarTurmaWhatsapp } from "@/actions/gestao";

export function EditarTurmaForm({
  turmaId,
  nome,
  periodo,
  capacidade,
  whatsappLink,
}: {
  turmaId: string;
  nome: string;
  periodo: string;
  capacidade: number;
  whatsappLink: string | null;
}) {
  const [msgDados, actionDados, pendingDados] = useActionState(editarTurma, undefined);
  const [msgWpp, actionWpp, pendingWpp] = useActionState(atualizarTurmaWhatsapp, undefined);

  return (
    <div className="flex flex-col gap-2.5 mt-3">
      <form action={actionDados} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="turmaId" value={turmaId} />
        <input
          name="nome"
          defaultValue={nome}
          required
          className="w-[110px] rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <input
          name="periodo"
          defaultValue={periodo}
          required
          className="w-[110px] rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <input
          name="capacidade"
          type="number"
          min={1}
          defaultValue={capacidade}
          required
          className="w-[90px] rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={pendingDados}
          className="font-bold text-xs px-4 py-2 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pendingDados ? "Salvando…" : "Salvar dados"}
        </button>
        {msgDados && <span className="text-xs text-teal font-semibold">{msgDados}</span>}
      </form>

      <form action={actionWpp} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="turmaId" value={turmaId} />
        <input
          name="whatsappLink"
          defaultValue={whatsappLink ?? ""}
          placeholder="Link do grupo de WhatsApp"
          className="flex-1 min-w-[220px] rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={pendingWpp}
          className="font-bold text-xs px-4 py-2 rounded-full bg-teal/10 text-teal disabled:opacity-60"
        >
          {pendingWpp ? "Salvando…" : "Salvar link"}
        </button>
        {msgWpp && <span className="text-xs text-teal font-semibold">{msgWpp}</span>}
      </form>
    </div>
  );
}
