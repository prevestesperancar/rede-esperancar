"use client";

import { useState, useActionState } from "react";
import { lancarResposta, corrigirRespostaManual } from "@/actions/gestao";

export function LancarRespostaForm({
  simuladoId,
  estudanteId,
  estudanteNome,
  respostaId,
  respostasAtuais,
  nota,
  corrigidoManualmente,
}: {
  simuladoId: string;
  estudanteId: string;
  estudanteNome: string;
  respostaId?: string;
  respostasAtuais?: string;
  nota?: number | null;
  corrigidoManualmente?: boolean;
}) {
  const [ajuste, setAjuste] = useState(false);
  const [, actionLancar, pendingLancar] = useActionState(lancarResposta, undefined);
  const [, actionCorrigir, pendingCorrigir] = useActionState(corrigirRespostaManual, undefined);

  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-border last:border-b-0 text-sm flex-wrap">
      <span className="flex-1 min-w-[140px] font-semibold truncate">{estudanteNome}</span>

      <form action={actionLancar} className="flex items-center gap-1.5">
        <input type="hidden" name="simuladoId" value={simuladoId} />
        <input type="hidden" name="estudanteId" value={estudanteId} />
        <input
          name="respostas"
          defaultValue={respostasAtuais ?? ""}
          placeholder="A,B,C,D..."
          className="w-[160px] rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={pendingLancar}
          className="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pendingLancar ? "…" : "Lançar/corrigir"}
        </button>
      </form>

      {nota !== undefined && nota !== null && (
        <span className={`font-mono text-xs font-bold ${corrigidoManualmente ? "text-terracotta" : "text-teal"}`}>
          {nota.toFixed(1)}
          {corrigidoManualmente ? " (manual)" : ""}
        </span>
      )}

      {respostaId && (
        <button
          type="button"
          onClick={() => setAjuste((v) => !v)}
          className="text-[11px] font-bold text-ink-faint"
        >
          Corrigir manualmente
        </button>
      )}

      {ajuste && respostaId && (
        <form action={actionCorrigir} className="flex items-center gap-1.5">
          <input type="hidden" name="respostaId" value={respostaId} />
          <input
            name="nota"
            type="number"
            step="0.1"
            min={0}
            max={10}
            placeholder="Nota"
            className="w-16 rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={pendingCorrigir}
            className="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-terracotta/10 text-terracotta disabled:opacity-60"
          >
            {pendingCorrigir ? "…" : "Salvar nota"}
          </button>
        </form>
      )}
    </div>
  );
}
