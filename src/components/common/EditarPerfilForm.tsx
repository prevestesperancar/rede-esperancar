"use client";

import { useActionState } from "react";
import { editarPerfil } from "@/actions/auth";

export function EditarPerfilForm({
  nome,
  telefone,
  email,
  fotoUrl,
}: {
  nome: string;
  telefone: string | null;
  email?: string;
  fotoUrl?: string | null;
}) {
  const [message, action, pending] = useActionState(editarPerfil, undefined);
  const success = message === "Perfil atualizado!";

  return (
    <form action={action} className="flex flex-col gap-3">
      {fotoUrl !== undefined && (
        <div>
          <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            Foto
          </label>
          {fotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoUrl}
              alt={nome}
              className="w-16 h-16 rounded-full object-cover mb-2"
            />
          )}
          <input
            name="foto"
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink file:mr-3 file:rounded-full file:border-0 file:bg-yellow file:text-yellow-ink file:font-bold file:text-xs file:px-3 file:py-1.5"
          />
          {fotoUrl && (
            <label className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-ink-soft">
              <input type="checkbox" name="removerFoto" />
              Remover foto de perfil
            </label>
          )}
        </div>
      )}
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Nome
        </label>
        <input
          name="nome"
          defaultValue={nome}
          required
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      {email !== undefined && (
        <div>
          <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            E-mail
          </label>
          <input
            name="email"
            type="email"
            defaultValue={email}
            required
            className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
          />
          <p className="text-xs text-ink-faint mt-1">
            Ao trocar o e-mail, você precisará entrar novamente com o novo e-mail.
          </p>
        </div>
      )}
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Telefone
        </label>
        <input
          name="telefone"
          defaultValue={telefone ?? ""}
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
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
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
