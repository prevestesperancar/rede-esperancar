"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { lancarResposta, corrigirRespostaManual, apagarRespostaSimulado } from "@/actions/gestao";
import { CampoArquivo } from "@/components/common/CampoArquivo";
import { TAMANHO_MAXIMO_FOTO } from "@/lib/upload-limits";
import { conceitoUerj, rotuloConceito, FIM_BLOCO_LINGUA, IDIOMAS_BLOCO_LINGUA } from "@/lib/simulado";
import { RespostasPorQuestaoInput } from "@/components/gestao/RespostasPorQuestaoInput";

function paraInputDate(data: Date | null) {
  if (!data) return "";
  return data.toISOString().slice(0, 10);
}

function CamposCartao({
  simuladoId,
  respostaId,
  nomeCompleto,
  dataNascimento,
  respostasAtuais,
  linguaEscolhida,
  totalQuestoes,
  pending,
}: {
  simuladoId: string;
  respostaId?: string;
  nomeCompleto?: string;
  dataNascimento?: Date | null;
  respostasAtuais?: string;
  linguaEscolhida?: string | null;
  totalQuestoes: number;
  pending: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="simuladoId" value={simuladoId} />
      {respostaId && <input type="hidden" name="respostaId" value={respostaId} />}
      <div className="flex items-center gap-1.5 flex-wrap">
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
        {totalQuestoes >= FIM_BLOCO_LINGUA && (
          <select
            name="linguaEscolhida"
            defaultValue={linguaEscolhida ?? ""}
            className="rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink bg-surface"
          >
            <option value="">Língua: —</option>
            {IDIOMAS_BLOCO_LINGUA.map((idioma) => (
              <option key={idioma} value={idioma}>
                {idioma}
              </option>
            ))}
          </select>
        )}
        <CampoArquivo
          name="foto"
          accept="image/*"
          tamanhoMaximo={TAMANHO_MAXIMO_FOTO}
          className="w-[140px] text-[11px] rounded-lg border border-border-strong px-1.5 py-1 outline-none focus:border-ink file:mr-1.5 file:rounded-full file:border-0 file:bg-paper file:text-[10px] file:font-bold file:px-2 file:py-1"
        />
        <button
          type="submit"
          disabled={pending}
          className="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pending ? "…" : respostaId ? "Salvar" : "Adicionar"}
        </button>
      </div>
      <div>
        <div className="text-[10px] font-bold text-ink-faint uppercase tracking-wide mb-1">
          Respostas marcadas — por questão
        </div>
        <RespostasPorQuestaoInput name="respostas" totalQuestoes={totalQuestoes} valorInicial={respostasAtuais} />
      </div>
    </div>
  );
}

export function LancarRespostaForm({
  simuladoId,
  respostaId,
  nomeCompleto,
  dataNascimento,
  respostasAtuais,
  linguaEscolhida,
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
  linguaEscolhida?: string | null;
  nota?: number | null;
  totalQuestoes: number;
  corrigidoManualmente?: boolean;
  fotoCartaoResposta?: string | null;
}) {
  const [ajuste, setAjuste] = useState(false);
  const [editando, setEditando] = useState(!respostaId);
  const [erroLancar, actionLancar, pendingLancar] = useActionState(lancarResposta, undefined);
  const [, actionCorrigir, pendingCorrigir] = useActionState(corrigirRespostaManual, undefined);
  const [apagando, setApagando] = useState(false);
  const estavaPendente = useRef(false);

  // useActionState não avisa quando terminou com sucesso — detecta a
  // transição de "enviando" pra "parado" e, se não veio erro, fecha o
  // formulário de volta pro resumo com a nota atualizada.
  useEffect(() => {
    if (estavaPendente.current && !pendingLancar && !erroLancar && respostaId) {
      setEditando(false);
    }
    estavaPendente.current = pendingLancar;
  }, [pendingLancar, erroLancar, respostaId]);

  if (editando) {
    return (
      <form
        action={actionLancar}
        className="py-2.5 border-b border-border last:border-b-0 flex flex-col gap-2"
      >
        <CamposCartao
          simuladoId={simuladoId}
          respostaId={respostaId}
          nomeCompleto={nomeCompleto}
          dataNascimento={dataNascimento}
          respostasAtuais={respostasAtuais}
          linguaEscolhida={linguaEscolhida}
          totalQuestoes={totalQuestoes}
          pending={pendingLancar}
        />
        {erroLancar && <p className="text-xs font-semibold text-terracotta">{erroLancar}</p>}
        {respostaId && (
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="self-start text-[11px] font-bold text-ink-faint"
          >
            Cancelar
          </button>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b border-border last:border-b-0 text-sm flex-wrap">
      <span className="flex-1 min-w-[140px] font-semibold truncate">{nomeCompleto}</span>

      {linguaEscolhida && <span className="text-[11px] font-bold text-ink-faint">{linguaEscolhida}</span>}

      {nota !== undefined && nota !== null && (
        <span
          className={`font-mono text-xs font-bold ${
            conceitoUerj(nota, totalQuestoes) === "E"
              ? "text-terracotta"
              : corrigidoManualmente
              ? "text-terracotta"
              : "text-teal"
          }`}
        >
          {nota}/{totalQuestoes} · Conceito {conceitoUerj(nota, totalQuestoes)} —{" "}
          {rotuloConceito(conceitoUerj(nota, totalQuestoes))}
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

      <button type="button" onClick={() => setEditando(true)} className="text-[11px] font-bold text-ink-faint">
        Editar
      </button>

      <button
        type="button"
        onClick={() => setAjuste((v) => !v)}
        className="text-[11px] font-bold text-ink-faint"
      >
        Nota manual
      </button>

      {respostaId && (
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
