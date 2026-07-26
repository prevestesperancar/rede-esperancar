"use client";

import { useActionState } from "react";
import { criarProfessor } from "@/actions/gestao";

export function NovoProfessorForm() {
  const [error, action, pending] = useActionState(criarProfessor, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Novo professor</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="nome"
          placeholder="Nome completo"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="email"
          type="email"
          placeholder="E-mail"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <input
        name="senha"
        type="password"
        placeholder="Senha de acesso (mín. 6 caracteres)"
        required
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="telefone"
          placeholder="WhatsApp"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="materia"
          placeholder="Matéria"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Foto (opcional)
        </label>
        <input
          name="foto"
          type="file"
          accept="image/*"
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink file:mr-3 file:rounded-full file:border-0 file:bg-yellow file:text-yellow-ink file:font-bold file:text-xs file:px-3 file:py-1.5"
        />
      </div>
      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "Adicionar professor"}
      </button>
    </form>
  );
}
