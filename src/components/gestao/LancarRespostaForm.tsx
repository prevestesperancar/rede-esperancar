"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { lancarResposta, corrigirRespostaManual, apagarRespostaSimulado } from "@/actions/gestao";
import { CampoArquivo } from "@/components/common/CampoArquivo";
import { TAMANHO_MAXIMO_FOTO } from "@/lib/upload-limits";
import { conceitoUerj } from "@/lib/simulado";

function paraInputDate(data: Date | null) {
  if (!data) return "";
  return data.toISOString().slice(0, 10);
}

export function LancarRespostaForm({
  simuladoId,
  respostaId,
  nomeCompleto,
  dataNascimento,
  respostasAtuais,
  nota,
  totalQuestoes,
  corrigidoManualmente,
  fotoCartaoResposta,
}: {
  simuladoId: string;
  respostaId?: string;
  nomeCompleto?: string;
  dataNascimento?: Date | null;
  respostasAtuais?: string;
  nota?: number | null;
  totalQuestoes: number;
  corrigidoManualmente?: boolean;
  fotoCartaoResposta?: string | null;
}) {
  const [ajuste, setAjuste] = useState(false);
  const [, actionLancar, pendingLancar] = useActionState(lancarResposta, undefined);
  const [, actionCorrigir, pendingCorrigir] = useActionState(corrigirRespostaManual, undefined);
  const [apagando, setApagando] = useState(false);

  return (
    <div className="flex items-center gap-2 py-2 border-b border-border last:border-b-0 text-sm flex-wrap">
      <form action={actionLancar} className="flex items-center gap-1.5 flex-wrap flex-1">
        <input type="hidden" name="simuladoId" value={simuladoId} />
        {respostaId && <input type="hidden" name="respostaId" value={respostaId} />}
        <input
          name="nomeCompleto"
          defaultValue={nomeCompleto ?? ""}
          placeholder="Nome completo"
          required
          className="w-[170px] rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink"
        />
        <input
          name="dataNascimento"
          type="date"
          defaultValue={paraInputDate(dataNascimento ?? null)}
          className="w-[130px] rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink"
        />
        <input
          name="respostas"
          defaultValue={respostasAtuais ?? ""}
          placeholder="A,B,C,D..."
          required
          className="w-[150px] rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink"
        />
        <CampoArquivo
          name="foto"
          accept="image/*"
          tamanhoMaximo={TAMANHO_MAXIMO_FOTO}
          className="w-[140px] text-[11px] rounded-lg border border-border-strong px-1.5 py-1 outline-none focus:border-ink file:mr-1.5 file:rounded-full file:border-0 file:bg-paper file:text-[10px] file:font-bold file:px-2 file:py-1"
        />
        <button
          type="submit"
          disabled={pendingLancar}
          className="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pendingLancar ? "…" : respostaId ? "Salvar" : "Adicionar"}
        </button>
      </form>

      {nota !== undefined && nota !== null && (
        <span className={`font-mono text-xs font-bold ${corrigidoManualmente ? "text-terracotta" : "text-teal"}`}>
          {nota}/{totalQuestoes} · Conceito {conceitoUerj(nota, totalQuestoes)}
          {corrigidoManualmente ? " (manual)" : ""}
        </span>
      )}

      {respostaId && (
        <Link href={`/gestao/simulados/resposta/${respostaId}`} className="text-[11px] font-bold text-ink-soft">
          Ver detalhes →
        </Link>
      )}

      {fotoCartaoResposta && (
        <a
          href={fotoCartaoResposta}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-terracotta"
        >
          Ver cartão →
        </a>
      )}

      {respostaId && (
        <>
          <button
            type="button"
            onClick={() => setAjuste((v) => !v)}
            className="text-[11px] font-bold text-ink-faint"
          >
            Nota manual
          </button>
          <button
            type="button"
            disabled={apagando}
            onClick={() => {
              if (confirm("Apagar esse cartão-resposta?")) {
                setApagando(true);
                apagarRespostaSimulado(respostaId);
              }
            }}
            className="text-[11px] font-bold text-terracotta disabled:opacity-60"
          >
            Apagar
          </button>
        </>
      )}

      {ajuste && respostaId && (
        <form action={actionCorrigir} className="flex items-center gap-1.5">
          <input type="hidden" name="respostaId" value={respostaId} />
          <input
            name="nota"
            type="number"
            step="1"
            min={0}
            max={totalQuestoes}
            placeholder="Acertos"
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
