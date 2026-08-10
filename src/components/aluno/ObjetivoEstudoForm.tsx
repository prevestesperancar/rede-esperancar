"use client";

import { useActionState, useState } from "react";
import { salvarObjetivoEstudo } from "@/actions/banco";

const OBJETIVOS = [
  { valor: "PASSAR_ENEM_ANO", label: "Passar no Enem esse ano" },
  { valor: "PASSAR_UERJ_ANO", label: "Passar na Uerj esse ano" },
  { valor: "TREINO_ENEM", label: "Fazer Enem/Uerj como treino" },
  { valor: "MANDAR_BEM_ESCOLA", label: "Mandar bem na escola" },
  { valor: "AINDA_NAO_SEI", label: "Ainda não sei" },
];

export function ObjetivoEstudoForm({ nomeAtual }: { nomeAtual: string }) {
  const [error, action, pending] = useActionState(salvarObjetivoEstudo, undefined);
  const [objetivo, setObjetivo] = useState<string | null>(null);

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="objetivoEstudo" value={objetivo ?? ""} />

      <div>
        <label className="block text-sm font-bold mb-2">Me conta o seu nome?</label>
        <input
          name="nome"
          defaultValue={nomeAtual}
          required
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <div>
        <div className="text-sm font-bold mb-2">Você tá na Rede Esperançar para:</div>
        <div className="flex flex-wrap gap-2">
          {OBJETIVOS.map((o) => (
            <button
              key={o.valor}
              type="button"
              onClick={() => setObjetivo(o.valor)}
              className={`text-sm font-bold px-4 py-2.5 rounded-full border ${
                objetivo === o.valor
                  ? "bg-teal/10 border-teal text-teal"
                  : "border-border-strong text-ink-soft"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm font-semibold text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={pending || !objetivo}
        className="font-extrabold text-sm py-3.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Continuar →"}
      </button>
    </form>
  );
}
