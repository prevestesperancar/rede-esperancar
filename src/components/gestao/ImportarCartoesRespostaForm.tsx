"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser, SUPABASE_UPLOADS_BUCKET } from "@/lib/supabase-browser";
import type { EstadoImportacao } from "@/lib/importar-cartoes-tipos";

export function ImportarCartoesRespostaForm({ simuladoId }: { simuladoId: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoImportacao | undefined>(undefined);
  const [pending, setPending] = useState(false);

  async function enviarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setPending(true);
    setEstado(undefined);
    try {
      // O PDF vai direto do navegador pro Supabase Storage (o corpo de uma
      // requisição de função no Vercel tem limite de 4.5MB) — a rota de
      // importação recebe só a URL depois.
      const respostaUpload = await fetch("/api/upload-prova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeArquivo: arquivo.name }),
      });
      const dadosUpload = await respostaUpload.json();
      if (!respostaUpload.ok) throw new Error(dadosUpload.error ?? "Não foi possível gerar o upload.");

      const { error: erroUpload } = await supabaseBrowser.storage
        .from(SUPABASE_UPLOADS_BUCKET)
        .uploadToSignedUrl(dadosUpload.path, dadosUpload.token, arquivo);
      if (erroUpload) throw new Error(erroUpload.message);

      const resposta = await fetch("/api/importar-cartoes-resposta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simuladoId, url: dadosUpload.publicUrl }),
      });
      const dados: EstadoImportacao = await resposta.json();
      setEstado(dados);
      if (dados.itens?.some((i) => !i.erro)) router.refresh();
    } catch (err) {
      console.error("Erro ao importar cartões-resposta:", err);
      setEstado({ erro: err instanceof Error ? err.message : "Não foi possível importar. Tente de novo." });
    } finally {
      setPending(false);
      e.target.value = "";
    }
  }

  return (
    <div className="bg-paper rounded-xl p-3.5 mt-2">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-ink-faint uppercase tracking-wide">
          Importar cartões-resposta (PDF)
        </div>
        <p className="text-[11px] text-ink-faint">
          Leitura automática por IA, página por página (mais lento, mais preciso) — confira os
          resultados abaixo antes de considerar definitivos, já que letra manuscrita pode ser lida
          errado.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="application/pdf"
            onChange={enviarArquivo}
            disabled={pending}
            className="flex-1 rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink file:mr-2 file:rounded-full file:border-0 file:bg-surface file:text-[10px] file:font-bold file:px-2.5 file:py-1 disabled:opacity-60"
          />
          {pending && <span className="text-[11px] font-bold text-ink-faint flex-shrink-0">Lendo…</span>}
        </div>
      </div>

      {estado?.erro && <p className="text-xs font-semibold text-terracotta mt-2">{estado.erro}</p>}

      {estado?.itens && (
        <div className="mt-3 flex flex-col gap-1.5">
          <p className="text-[11px] text-ink-faint">
            {estado.itens.filter((i) => !i.erro).length} de {estado.itens.length} página(s) lançada(s)
            — confira os nomes e notas na lista acima antes de considerar definitivo.
          </p>
          {estado.itens.map((item, i) =>
            item.erro ? (
              <div key={i} className="text-xs rounded-lg px-2.5 py-1.5 bg-terracotta/10 text-terracotta">
                ✗ Página {item.pagina}: {item.erro}
                {item.nomeLido && ` (nome lido: "${item.nomeLido}")`} — confira e lance manualmente
              </div>
            ) : (
              <div key={i} className="text-xs rounded-lg px-2.5 py-1.5 bg-teal/10 text-teal">
                ✓ Página {item.pagina}: {item.nomeLido || "(sem nome lido)"}
                {item.linguaLida && ` (${item.linguaLida})`} — nota {item.nota ?? "—"}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
