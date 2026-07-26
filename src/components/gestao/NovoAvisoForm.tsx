"use client";

import { useActionState } from "react";
import { criarAviso } from "@/actions/gestao";

export function NovoAvisoForm({
  turmas,
}: {
  turmas: { id: string; nome: string }[];
}) {
  const [error, action, pending] = useActionState(criarAviso, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Novo aviso</div>
      <input
        name="titulo"
        placeholder="Título"
        required
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      <textarea
        name="corpo"
        placeholder="Mensagem"
        required
        rows={2}
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink resize-none"
      />
      <select
        name="turmaId"
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      >
        <option value="">Todas as turmas do núcleo</option>
        {turmas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nome}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Publicando…" : "Publicar aviso"}
      </button>
    </form>
  );
}
