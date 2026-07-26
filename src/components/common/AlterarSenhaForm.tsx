"use client";

import { useActionState } from "react";
import { alterarSenha } from "@/actions/auth";

export function AlterarSenhaForm() {
  const [message, action, pending] = useActionState(alterarSenha, undefined);
  const success = message === "Senha alterada com sucesso!";

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        name="senhaAtual"
        type="password"
        placeholder="Senha atual"
        required
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      <input
        name="senhaNova"
        type="password"
        placeholder="Nova senha (mín. 6 caracteres)"
        required
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      {message && (
        <p
          className={`text-sm font-semibold ${
            success ? "text-teal" : "text-terracotta"
          }`}
        >
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-bold text-sm px-5 py-2.5 rounded-full border border-border-strong disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Alterar senha"}
      </button>
    </form>
  );
}
