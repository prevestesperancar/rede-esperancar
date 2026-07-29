"use client";

import { useActionState } from "react";
import { criarTemaRedacao } from "@/actions/redacao";

export function NovoTemaRedacaoForm() {
  const [error, action, pending] = useActionState(criarTemaRedacao, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Novo tema de redação</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <select
          name="prova"
          required
          defaultValue=""
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          <option value="" disabled>
            Escolha a prova
          </option>
          <option value="ENEM">ENEM</option>
          <option value="UERJ">UERJ</option>
        </select>
        <input
          name="titulo"
          placeholder="Título do tema"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <textarea
        name="textoMotivador"
        placeholder="Texto motivador / proposta (opcional)"
        rows={4}
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink resize-none"
      />
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Prazo máximo de envio (opcional)
        </label>
        <input
          name="prazoEnvio"
          type="date"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar tema"}
      </button>
    </form>
  );
}
