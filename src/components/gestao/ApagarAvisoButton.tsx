"use client";

import { useTransition } from "react";
import { apagarAviso } from "@/actions/gestao";

export function ApagarAvisoButton({ avisoId }: { avisoId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("Apagar este aviso?")) {
          startTransition(() => apagarAviso(avisoId));
        }
      }}
      className="text-xs font-bold text-ink-faint hover:text-terracotta disabled:opacity-50 flex-shrink-0"
      title="Apagar aviso"
    >
      Apagar
    </button>
  );
}
