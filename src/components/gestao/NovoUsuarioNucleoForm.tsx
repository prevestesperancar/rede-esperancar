"use client";

import { useActionState } from "react";
import { criarUsuarioNucleo } from "@/actions/gestao";

export function NovoUsuarioNucleoForm() {
  const [message, action, pending] = useActionState(criarUsuarioNucleo, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Novo usuário do núcleo</div>
      <p className="text-xs text-ink-faint">
        Alunos entram pela inscrição pública, e coordenadores só podem ser criados pelo admin da rede.
      </p>
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
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="senha"
          type="password"
          placeholder="Senha de acesso (mín. 8, com letra e número)"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <select
          name="role"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          <option value="PROFESSOR">Professor(a)</option>
          <option value="APOIO_PSICOSSOCIAL">Apoio psicossocial</option>
        </select>
      </div>
      {message && (
        <p className={`text-sm font-semibold ${message === "Usuário criado!" ? "text-teal" : "text-terracotta"}`}>
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar usuário"}
      </button>
    </form>
  );
}
