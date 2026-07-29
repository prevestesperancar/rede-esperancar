"use client";

import { useTransition, useState } from "react";
import { apagarTemaRedacao } from "@/actions/redacao";

export function ApagarTemaButton({ temaId }: { temaId: string }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Apagar esse tema de redação?")) return;
          startTransition(async () => {
            setErro(null);
            try {
              const resultado = await apagarTemaRedacao(temaId);
              if (resultado) setErro(resultado);
            } catch {
              setErro("Não foi possível apagar. Tente de novo.");
            }
          });
        }}
        className="text-[11px] font-bold uppercase px-3 py-1.5 rounded-full flex-shrink-0 text-ink-faint hover:text-terracotta disabled:opacity-60"
      >
        {pending ? "…" : "Apagar"}
      </button>
      {erro && <p className="text-[10px] text-terracotta font-semibold max-w-[180px] text-right">{erro}</p>}
    </div>
  );
}
