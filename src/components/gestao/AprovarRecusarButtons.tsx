"use client";

import { useTransition } from "react";
import { aprovarMatricula, recusarMatricula } from "@/actions/gestao";

export function AprovarRecusarButtons({ matriculaId }: { matriculaId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-1.5 flex-shrink-0">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => aprovarMatricula(matriculaId))}
        className="text-xs font-bold px-3 py-1.5 rounded-full bg-teal text-white disabled:opacity-50"
      >
        Aprovar
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => recusarMatricula(matriculaId))}
        className="text-xs font-bold px-3 py-1.5 rounded-full border border-border-strong text-ink-soft disabled:opacity-50"
      >
        Recusar
      </button>
    </div>
  );
}
