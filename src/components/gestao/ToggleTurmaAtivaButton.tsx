"use client";

import { useTransition } from "react";
import { alternarTurmaAtiva } from "@/actions/gestao";

export function ToggleTurmaAtivaButton({
  turmaId,
  ativo,
}: {
  turmaId: string;
  ativo: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => alternarTurmaAtiva(turmaId))}
      className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full disabled:opacity-50 ${
        ativo ? "bg-teal/10 text-teal" : "bg-ink-faint/10 text-ink-faint"
      }`}
    >
      {pending ? "…" : ativo ? "Aberta · clique para fechar" : "Fechada · clique para abrir"}
    </button>
  );
}
