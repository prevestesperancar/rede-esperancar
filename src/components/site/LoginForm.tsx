"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-border-strong px-4 py-3 text-sm outline-none focus:border-ink"
          placeholder="seu@email.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold mb-1.5"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-xl border border-border-strong px-4 py-3 text-sm outline-none focus:border-ink"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center gap-2 font-extrabold text-sm px-6 py-3.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
