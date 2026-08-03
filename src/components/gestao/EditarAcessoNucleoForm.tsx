"use client";

import { useState, useActionState } from "react";
import { alterarAcessoUsuarioNucleo, redefinirSenhaUsuarioNucleo } from "@/actions/gestao";

export function EditarAcessoNucleoForm({
  userId,
  email,
  role,
}: {
  userId: string;
  email: string;
  role: string;
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [msgAcesso, actionAcesso, pendingAcesso] = useActionState(alterarAcessoUsuarioNucleo, undefined);
  const [msgSenha, actionSenha, pendingSenha] = useActionState(redefinirSenhaUsuarioNucleo, undefined);

  return (
    <div className="flex flex-col gap-2">
      <form action={actionAcesso} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input
          name="email"
          type="email"
          defaultValue={email}
          required
          className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink min-w-[200px]"
        />
        <select
          name="role"
          defaultValue={role}
          className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink bg-surface"
        >
          <option value="PROFESSOR">Professor(a)</option>
          <option value="APOIO_PSICOSSOCIAL">Apoio psicossocial</option>
        </select>
        <button
          type="submit"
          disabled={pendingAcesso}
          className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pendingAcesso ? "Salvando…" : "Salvar acesso"}
        </button>
        {msgAcesso && <span className="text-[11px] text-teal font-semibold">{msgAcesso}</span>}
      </form>

      {!mostrarSenha ? (
        <button
          type="button"
          onClick={() => setMostrarSenha(true)}
          className="text-[11px] font-bold text-ink-faint self-start"
        >
          Redefinir senha
        </button>
      ) : (
        <form action={actionSenha} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="userId" value={userId} />
          <input
            name="novaSenha"
            type="password"
            placeholder="Nova senha (mín. 8, com letra e número)"
            className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={pendingSenha}
            className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-terracotta/10 text-terracotta disabled:opacity-60"
          >
            {pendingSenha ? "Salvando…" : "Redefinir"}
          </button>
          {msgSenha && <span className="text-[11px] text-teal font-semibold">{msgSenha}</span>}
        </form>
      )}
    </div>
  );
}
