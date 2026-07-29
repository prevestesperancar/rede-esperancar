"use client";

import { useState, useTransition } from "react";
import { remarcarSolicitacao } from "@/actions/agendamento";

export function RemarcarButton({ solicitacaoId }: { solicitacaoId: string }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState(false);

  if (feito) {
    return <span className="text-xs font-bold text-teal">Reaberta ✓</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Remarcar? O horário confirmado será desfeito e você vai poder sugerir novos horários.")) return;
          startTransition(async () => {
            const resultado = await remarcarSolicitacao(solicitacaoId);
            if (resultado) setErro(resultado);
            else setFeito(true);
          });
        }}
        className="text-xs font-bold text-terracotta disabled:opacity-50"
      >
        {pending ? "Remarcando…" : "Remarcar"}
      </button>
      {erro && <p className="text-[10px] text-terracotta">{erro}</p>}
    </div>
  );
}
