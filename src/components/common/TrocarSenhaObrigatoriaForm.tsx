"use client";

import { useActionState } from "react";
import { trocarSenhaObrigatoria } from "@/actions/auth";

export function TrocarSenhaObrigatoriaForm() {
  const [message, action, pending] = useActionState(trocarSenhaObrigatoria, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        name="senhaNova"
        type="password"
        placeholder="Nova senha (mín. 8, com letra e número)"
        required
        autoFocus
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      {message && <p className="text-sm font-semibold text-terracotta">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="font-extrabold text-sm px-5 py-3 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Definir nova senha"}
      </button>
    </form>
  );
}
