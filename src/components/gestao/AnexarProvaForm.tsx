"use client";

import { useActionState } from "react";
import { anexarProvaSimulado } from "@/actions/gestao";
import { CampoArquivo } from "@/components/common/CampoArquivo";
import { TAMANHO_MAXIMO_DOCUMENTO } from "@/lib/upload-limits";

export function AnexarProvaForm({
  simuladoId,
  arquivoAtual,
}: {
  simuladoId: string;
  arquivoAtual: string | null;
}) {
  const [error, action, pending] = useActionState(anexarProvaSimulado, undefined);

  return (
    <form action={action} className="flex items-center gap-2 mt-2 flex-wrap">
      <input type="hidden" name="simuladoId" value={simuladoId} />
      <span className="text-[11px] font-bold text-ink-faint uppercase tracking-wide">
        PDF da prova (pros professores)
      </span>
      <CampoArquivo
        name="arquivo"
        accept="application/pdf"
        tamanhoMaximo={TAMANHO_MAXIMO_DOCUMENTO}
        className="w-[180px] text-[11px] rounded-lg border border-border-strong px-1.5 py-1 outline-none focus:border-ink file:mr-1.5 file:rounded-full file:border-0 file:bg-paper file:text-[10px] file:font-bold file:px-2 file:py-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-ink text-paper disabled:opacity-60"
      >
        {pending ? "…" : arquivoAtual ? "Substituir" : "Anexar"}
      </button>
      {arquivoAtual && (
        <a href={arquivoAtual} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-terracotta">
          Ver PDF atual →
        </a>
      )}
      {error && <p className="text-xs font-semibold text-terracotta w-full">{error}</p>}
    </form>
  );
}
