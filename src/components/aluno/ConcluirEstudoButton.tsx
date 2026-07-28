"use client";

import { useTransition } from "react";
import { alternarConclusaoCronograma } from "@/actions/cronograma";

export function ConcluirEstudoButton({ chave, concluido }: { chave: string; concluido: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => alternarConclusaoCronograma(chave))}
      className={`text-xs font-bold px-3.5 py-1.5 rounded-full flex-shrink-0 disabled:opacity-50 ${
        concluido ? "bg-teal/10 text-teal" : "bg-ink-faint/10 text-ink-faint"
      }`}
    >
      {concluido ? "✓ Estudado" : "Marcar como estudado"}
    </button>
  );
}
