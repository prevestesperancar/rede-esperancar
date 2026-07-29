"use client";

import { useTransition, useState } from "react";
import { alternarTemaAtivo } from "@/actions/redacao";

export function AlternarTemaAtivoButton({ temaId, ativo }: { temaId: string; ativo: boolean }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setErro(null);
            try {
              await alternarTemaAtivo(temaId);
            } catch {
              setErro("Não foi possível alterar. Tente de novo.");
            }
          })
        }
        className={`text-[11px] font-bold uppercase px-3 py-1.5 rounded-full flex-shrink-0 disabled:opacity-60 ${
          ativo ? "bg-terracotta/10 text-terracotta" : "bg-teal/10 text-teal"
        }`}
      >
        {pending ? "…" : ativo ? "Desativar" : "Reativar"}
      </button>
      {erro && <p className="text-[10px] text-terracotta font-semibold">{erro}</p>}
    </div>
  );
}
