"use client";

import { useState, useTransition } from "react";
import { gerarDiagnosticoIA } from "@/actions/redacao";

export function DiagnosticoIAButton({
  redacaoId,
  diagnosticoInicial,
}: {
  redacaoId: string;
  diagnosticoInicial: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [diagnostico, setDiagnostico] = useState(diagnosticoInicial);

  return (
    <div className="bg-ink text-paper rounded-2xl p-4 mb-5">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="font-extrabold text-sm">🤖 Diagnóstico da IA (rascunho — só a equipe vê)</div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const resultado = await gerarDiagnosticoIA(redacaoId);
              setDiagnostico(resultado);
            })
          }
          className="font-bold text-[11px] px-3 py-1.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60 flex-shrink-0"
        >
          {pending ? "Gerando…" : diagnostico ? "Gerar de novo" : "Gerar diagnóstico"}
        </button>
      </div>
      {diagnostico && <p className="text-sm text-paper/85 whitespace-pre-line">{diagnostico}</p>}
    </div>
  );
}
