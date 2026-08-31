"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CampoArquivo } from "@/components/common/CampoArquivo";
import { TAMANHO_MAXIMO_DOCUMENTO } from "@/lib/upload-limits";
import type { EstadoImportacao } from "@/lib/importar-cartoes-tipos";

export function ImportarCartoesRespostaForm({ simuladoId }: { simuladoId: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoImportacao | undefined>(undefined);
  const [pending, setPending] = useState(false);

  async function enviar(formData: FormData) {
    setPending(true);
    setEstado(undefined);
    try {
      const resposta = await fetch("/api/importar-cartoes-resposta", { method: "POST", body: formData });
      const dados: EstadoImportacao = await resposta.json();
      setEstado(dados);
      if (dados.itens?.some((i) => !i.erro)) router.refresh();
    } catch {
      setEstado({ erro: "Não foi possível conectar pra importar. Tente de novo." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-paper rounded-xl p-3.5 mt-2">
      <form
        action={enviar}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="simuladoId" value={simuladoId} />
        <div className="text-xs font-bold text-ink-faint uppercase tracking-wide">
          Importar cartões-resposta (PDF)
        </div>
        <p className="text-[11px] text-ink-faint">
          Leitura automática por IA, página por página (mais lento, mais preciso) — confira os
          resultados abaixo antes de considerar definitivos, já que letra manuscrita pode ser lida
          errado.
        </p>
        <div className="flex items-center gap-2">
          <CampoArquivo
            name="arquivo"
            accept="application/pdf"
            tamanhoMaximo={TAMANHO_MAXIMO_DOCUMENTO}
            className="flex-1 rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink file:mr-2 file:rounded-full file:border-0 file:bg-surface file:text-[10px] file:font-bold file:px-2.5 file:py-1"
          />
          <button
            type="submit"
            disabled={pending}
            className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-ink text-paper disabled:opacity-60 flex-shrink-0"
          >
            {pending ? "Lendo…" : "Importar"}
          </button>
        </div>
      </form>

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
