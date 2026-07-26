"use client";

import { useTransition } from "react";
import { alternarFormularioAtivo } from "@/actions/formularios";

export function ToggleFormularioAtivoButton({
  formularioId,
  ativo,
}: {
  formularioId: string;
  ativo: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => alternarFormularioAtivo(formularioId))}
      className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full disabled:opacity-50 ${
        ativo ? "bg-teal/10 text-teal" : "bg-ink-faint/10 text-ink-faint"
      }`}
    >
      {pending ? "…" : ativo ? "Aberto" : "Encerrado"}
    </button>
  );
}
