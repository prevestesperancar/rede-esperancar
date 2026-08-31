"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { salvarUrlProvaSimulado } from "@/actions/gestao";

export function AnexarProvaForm({
  simuladoId,
  arquivoAtual,
}: {
  simuladoId: string;
  arquivoAtual: string | null;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setEnviando(true);
    setErro(null);
    try {
      const blob = await upload(arquivo.name, arquivo, {
        access: "public",
        handleUploadUrl: "/api/upload-prova",
        multipart: true,
      });
      await salvarUrlProvaSimulado(simuladoId, blob.url);
    } catch (err) {
      console.error("Erro ao enviar PDF da prova:", err);
      setErro(err instanceof Error ? err.message : "Não foi possível enviar o arquivo.");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <span className="text-[11px] font-bold text-ink-faint uppercase tracking-wide">
        PDF da prova (pros professores)
      </span>
      <input
        type="file"
        accept="application/pdf"
        onChange={enviarArquivo}
        disabled={enviando}
        className="w-[200px] text-[11px] rounded-lg border border-border-strong px-1.5 py-1 outline-none focus:border-ink file:mr-1.5 file:rounded-full file:border-0 file:bg-paper file:text-[10px] file:font-bold file:px-2 file:py-1 disabled:opacity-60"
      />
      {enviando && <span className="text-[11px] font-bold text-ink-faint">Enviando…</span>}
      {arquivoAtual && !enviando && (
        <a
          href={arquivoAtual}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-terracotta"
        >
          Ver PDF atual →
        </a>
      )}
      {erro && <p className="text-xs font-semibold text-terracotta w-full">{erro}</p>}
    </div>
  );
}
