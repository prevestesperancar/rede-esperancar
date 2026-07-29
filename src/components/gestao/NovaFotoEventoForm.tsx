"use client";

import { useActionState } from "react";
import { criarGaleriaEvento } from "@/actions/gestao";

export function NovaFotoEventoForm() {
  const [error, action, pending] = useActionState(criarGaleriaEvento, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Nova foto de evento</div>
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Foto (opcional se colar o link do Instagram)
        </label>
        <input
          name="imagem"
          type="file"
          accept="image/*"
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink file:mr-3 file:rounded-full file:border-0 file:bg-yellow file:text-yellow-ink file:font-bold file:text-xs file:px-3 file:py-1.5"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Link do post no Instagram (opcional)
        </label>
        <input
          name="instagramUrl"
          type="url"
          placeholder="https://www.instagram.com/p/..."
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="data"
          type="date"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="legenda"
          placeholder="Legenda (opcional)"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Adicionar foto"}
      </button>
    </form>
  );
}
