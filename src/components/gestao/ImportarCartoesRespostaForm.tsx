"use client";

import { useActionState } from "react";
import { importarCartoesResposta } from "@/actions/importar-cartoes";
import { CampoArquivo } from "@/components/common/CampoArquivo";
import { TAMANHO_MAXIMO_DOCUMENTO } from "@/lib/upload-limits";

export function ImportarCartoesRespostaForm({ simuladoId }: { simuladoId: string }) {
  const [estado, action, pending] = useActionState(importarCartoesResposta, undefined);

  return (
    <div className="bg-paper rounded-xl p-3.5 mt-2">
      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="simuladoId" value={simuladoId} />
        <div className="text-xs font-bold text-ink-faint uppercase tracking-wide">
          Importar cartões-resposta (PDF)
        </div>
        <p className="text-[11px] text-ink-faint">
          Leitura automática por IA — confira os resultados abaixo antes de considerar definitivos, já
          que letra manuscrita pode ser lida errado.
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
          {estado.itens.map((item, i) => (
            <div
              key={i}
              className={`text-xs rounded-lg px-2.5 py-1.5 ${
                item.encontrado ? "bg-teal/10 text-teal" : "bg-terracotta/10 text-terracotta"
              }`}
            >
              {item.encontrado ? (
                <>
                  ✓ {item.nomeEstudante} — nota {item.nota?.toFixed(1)}
                </>
              ) : (
                <>
                  ✗ Não encontrado: &ldquo;{item.nomeLido || "sem nome lido"}&rdquo;
                  {item.dataNascimentoLida && ` (${item.dataNascimentoLida})`} — lance manualmente
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
