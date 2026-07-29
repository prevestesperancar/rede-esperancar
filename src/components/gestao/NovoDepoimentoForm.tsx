"use client";

import { useActionState } from "react";
import { criarDepoimento } from "@/actions/gestao";
import { CampoArquivo } from "@/components/common/CampoArquivo";
import { TAMANHO_MAXIMO_FOTO } from "@/lib/upload-limits";

export function NovoDepoimentoForm() {
  const [error, action, pending] = useActionState(criarDepoimento, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Nova história</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="nome"
          placeholder="Nome"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="curso"
          placeholder="Curso"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <input
        name="universidade"
        placeholder="Universidade"
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Foto (opcional)
        </label>
        <CampoArquivo
          name="foto"
          accept="image/*"
          tamanhoMaximo={TAMANHO_MAXIMO_FOTO}
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink file:mr-3 file:rounded-full file:border-0 file:bg-yellow file:text-yellow-ink file:font-bold file:text-xs file:px-3 file:py-1.5"
        />
      </div>
      <textarea
        name="quote"
        placeholder="Depoimento"
        required
        rows={3}
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink resize-none"
      />
      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "Adicionar história"}
      </button>
    </form>
  );
}
